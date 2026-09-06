// Client for the Theta-hosted paste relay (files.felixegan.me). See
// docs/theta-paste-relay-plan.md for the full API contract this implements
// against. The relay does not exist yet — calls here will fail until the
// second agent's plan is executed on Theta; that's expected.

export const MAX_FILE_BYTES = 5 * 1024 * 1024 * 1024; // 5GB
const CHUNK_BYTES = 8 * 1024 * 1024; // 8MB per chunk, tuned for slow home uplinks
const CHUNK_MAX_RETRIES = 5;

const apiBase = (import.meta.env.VITE_PASTE_API_BASE ?? "").replace(/\/$/, "");

// Wire format, per docs/theta-paste-relay-plan.md.
type PasteStateWire =
  | { empty: true }
  | { type: "text"; content: string; expiresAt: string }
  | { type: "file"; filename: string; size: number; mime: string; expiresAt: string };

// Normalized shape with a single discriminant (`kind`) so consumers get
// clean type narrowing — the wire format's `empty` flag doesn't discriminate
// cleanly since it's absent on the other two variants.
export type PasteState =
  | { kind: "empty" }
  | { kind: "text"; content: string; expiresAt: string }
  | { kind: "file"; filename: string; size: number; mime: string; expiresAt: string };

const normalizeState = (wire: PasteStateWire): PasteState => {
  if (!("type" in wire)) return { kind: "empty" };
  if (wire.type === "text") return { kind: "text", content: wire.content, expiresAt: wire.expiresAt };
  return { kind: "file", filename: wire.filename, size: wire.size, mime: wire.mime, expiresAt: wire.expiresAt };
};

class PasteApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "PasteApiError";
  }
}

const authedFetch = (path: string, idToken: string, init: RequestInit = {}) => {
  if (!apiBase) {
    return Promise.reject(new PasteApiError("Paste relay is not configured (VITE_PASTE_API_BASE)"));
  }

  return fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${idToken}`,
    },
  }).then(async (response) => {
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new PasteApiError(detail || `Request failed: ${response.status}`, response.status);
    }
    return response;
  });
};

export const getPasteState = async (idToken: string): Promise<PasteState> => {
  const response = await authedFetch("/api/paste", idToken);
  return normalizeState((await response.json()) as PasteStateWire);
};

export const saveText = async (idToken: string, content: string): Promise<{ expiresAt: string }> => {
  const response = await authedFetch("/api/paste/text", idToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return (await response.json()) as { expiresAt: string };
};

export const clearPaste = async (idToken: string): Promise<void> => {
  await authedFetch("/api/paste", idToken, { method: "DELETE" });
};

export type UploadProgress = {
  sentBytes: number;
  totalBytes: number;
};

// Returns a fresh, non-expired ID token — callers pass a getter rather than a
// static token so a multi-hour upload over a slow home uplink can refresh a
// short-lived GIS token mid-transfer instead of failing partway through.
export type TokenGetter = () => Promise<string>;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const uploadChunkWithRetry = async (
  uploadId: string,
  offset: number,
  blob: Blob,
  getToken: TokenGetter,
  signal?: AbortSignal,
) => {
  let lastError: unknown;
  for (let attempt = 0; attempt < CHUNK_MAX_RETRIES; attempt += 1) {
    if (signal?.aborted) throw new PasteApiError("Upload cancelled");
    try {
      const idToken = await getToken();
      await authedFetch(`/api/paste/file/${uploadId}/chunk?offset=${offset}`, idToken, {
        method: "PUT",
        headers: { "Content-Type": "application/octet-stream" },
        body: blob,
        signal,
      });
      return;
    } catch (error) {
      lastError = error;
      if (signal?.aborted) throw error;
      await sleep(500 * 2 ** attempt);
    }
  }
  throw lastError instanceof Error ? lastError : new PasteApiError("Chunk upload failed");
};

const getUploadStatus = async (uploadId: string, idToken: string): Promise<number> => {
  const response = await authedFetch(`/api/paste/file/${uploadId}/status`, idToken);
  const data = (await response.json()) as { receivedBytes: number };
  return data.receivedBytes;
};

export const uploadFile = async (
  file: File,
  getToken: TokenGetter,
  options: { onProgress?: (progress: UploadProgress) => void; signal?: AbortSignal } = {},
): Promise<{ expiresAt: string }> => {
  if (file.size > MAX_FILE_BYTES) {
    throw new PasteApiError(`File exceeds the 5GB limit (${(file.size / 1024 ** 3).toFixed(2)}GB)`);
  }

  const initToken = await getToken();
  const initResponse = await authedFetch("/api/paste/file/init", initToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, size: file.size, mime: file.type || "application/octet-stream" }),
  });
  const { uploadId } = (await initResponse.json()) as { uploadId: string };

  let offset = 0;
  while (offset < file.size) {
    if (options.signal?.aborted) throw new PasteApiError("Upload cancelled");

    const chunk = file.slice(offset, Math.min(offset + CHUNK_BYTES, file.size));
    try {
      await uploadChunkWithRetry(uploadId, offset, chunk, getToken, options.signal);
      offset += chunk.size;
    } catch (error) {
      // A dropped connection may have partially landed on the server — trust
      // its reported offset rather than assuming this chunk fully failed.
      const confirmedToken = await getToken();
      const confirmedOffset = await getUploadStatus(uploadId, confirmedToken).catch(() => offset);
      if (confirmedOffset > offset) {
        offset = confirmedOffset;
        continue;
      }
      throw error;
    }

    options.onProgress?.({ sentBytes: offset, totalBytes: file.size });
  }

  const completeToken = await getToken();
  const completeResponse = await authedFetch(`/api/paste/file/${uploadId}/complete`, completeToken, {
    method: "POST",
  });
  return (await completeResponse.json()) as { expiresAt: string };
};

// Streams the current file to disk via the File System Access API when
// available (avoids holding multi-GB downloads in memory); falls back to an
// in-memory Blob + object URL on browsers without it.
export const downloadFile = async (
  idToken: string,
  filename: string,
  onProgress?: (receivedBytes: number) => void,
): Promise<void> => {
  const response = await authedFetch("/api/paste/file/download", idToken);
  if (!response.body) throw new PasteApiError("Empty download response");

  const totalBytes = Number(response.headers.get("Content-Length") ?? 0);
  let received = 0;

  const hasFsAccess = typeof window.showSaveFilePicker === "function";

  if (hasFsAccess) {
    const handle = await window.showSaveFilePicker({ suggestedName: filename });
    const writable = await handle.createWritable();
    const reader = response.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      await writable.write(value);
      received += value.byteLength;
      onProgress?.(received);
    }
    await writable.close();
    return;
  }

  const reader = response.body.getReader();
  const parts: BlobPart[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parts.push(value);
    received += value.byteLength;
    onProgress?.(received);
  }

  const blob = new Blob(parts);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
  void totalBytes;
};

type SaveFilePickerHandle = {
  createWritable: () => Promise<{
    write: (chunk: Uint8Array) => Promise<void>;
    close: () => Promise<void>;
  }>;
};

declare global {
  interface Window {
    showSaveFilePicker?: (options?: { suggestedName?: string }) => Promise<SaveFilePickerHandle>;
  }
}
