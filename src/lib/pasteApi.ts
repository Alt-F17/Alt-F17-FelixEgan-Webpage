// Client for the Theta-hosted paste relay (files.felixegan.me). See
// /home/felix/.claude/plans/change-the-google-oauth-tidy-lovelace.md
// ("Workstream D — API server") for the full route/response contract this
// implements against.

export const MAX_FILE_BYTES = 5 * 1024 * 1024 * 1024; // 5GB
const CHUNK_BYTES = 8 * 1024 * 1024; // 8MB per chunk, tuned for slow home uplinks
const CHUNK_MAX_RETRIES = 5;

const apiBase = (import.meta.env.VITE_PASTE_API_BASE ?? "").replace(/\/$/, "");

// Standard backend error body (rate-limit/quota/captcha/pin failures, per
// Workstream D): { error, message, retryAt }. `retryAt` is an ISO timestamp
// when known, or null when nothing blocking has a known expiry yet (e.g.
// still pending_scan) — callers must show a static message rather than
// fabricate a countdown in that case.
export class PasteApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public retryAt: string | null = null,
  ) {
    super(message);
    this.name = "PasteApiError";
  }
}

type ErrorBody = { error?: string; message?: string; retryAt?: string | null };

const parseErrorBody = (raw: string): ErrorBody => {
  try {
    return raw ? (JSON.parse(raw) as ErrorBody) : {};
  } catch {
    // Non-JSON error body (e.g. a proxy/5xx HTML page) — fall back to raw text.
    return {};
  }
};

// Kept verbatim in shape/signature/role: takes (path, token, init), adds only
// `Authorization: Bearer <token>`, and is otherwise credential-agnostic — it
// doesn't know or care whether the token came from Google (as before) or the
// new pattern-login session (now). The error branch is extended to parse the
// relay's structured `{error, message, retryAt}` body so callers can hand a
// caught PasteApiError straight to <RetryCountdown>.
const authedFetch = (path: string, token: string, init: RequestInit = {}) => {
  if (!apiBase) {
    return Promise.reject(new PasteApiError("Paste relay is not configured (VITE_PASTE_API_BASE)"));
  }

  return fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${token}`,
    },
  }).then(async (response) => {
    if (!response.ok) {
      const raw = await response.text().catch(() => "");
      const parsed = parseErrorBody(raw);
      throw new PasteApiError(
        parsed.message || raw || `Request failed: ${response.status}`,
        response.status,
        parsed.error,
        parsed.retryAt ?? null,
      );
    }
    return response;
  });
};

// --- Items -------------------------------------------------------------

export type ItemKind = "text" | "file";
export type ItemStatus = "uploading" | "pending_scan" | "active" | "rejected" | "expired";

export type Item = {
  id: string;
  kind: ItemKind;
  filename: string | null;
  mime: string | null;
  size: number | null;
  status: ItemStatus;
  createdAt: string;
  /** Set exactly when the item became `active` — this is when the TTL starts. */
  readyAt: string | null;
  /** `ready_at + TTL_SECONDS`; null until the item is active. */
  expiresAt: string | null;
  rejectReason?: string | null;
};

/** GET /api/paste/items — the caller's own items only. */
export const listItems = async (token: string): Promise<Item[]> => {
  const response = await authedFetch("/api/paste/items", token);
  return (await response.json()) as Item[];
};

/**
 * GET /api/paste/items/:id — any authenticated account may fetch metadata for
 * any item id (this is the cross-account sharing route); content itself
 * still requires the item's PIN via `unlockItem`/`downloadFile`.
 */
export const getItem = async (token: string, id: string): Promise<Item> => {
  const response = await authedFetch(`/api/paste/items/${id}`, token);
  return (await response.json()) as Item;
};

export const deleteItem = async (token: string, id: string): Promise<void> => {
  await authedFetch(`/api/paste/items/${id}`, token, { method: "DELETE" });
};

// The PIN is generated server-side at `db.reserveItem()` time — the very
// first statement of both create-item handlers — so it exists immediately
// on creation, before a file has even finished uploading/scanning. Callers
// must display it once ("won't be shown again") right away.
export type CreatedItem = {
  id: string;
  pin: string;
  status: ItemStatus;
  /** Null until the item reaches `active` (file uploads start this way). */
  expiresAt: string | null;
};

/** POST /api/paste/text — synchronous: text pastes are active immediately. */
export const saveText = async (
  token: string,
  content: string,
  turnstileToken: string,
): Promise<CreatedItem> => {
  const response = await authedFetch("/api/paste/text", token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, turnstileToken }),
  });
  return (await response.json()) as CreatedItem;
};

export type InitFileUpload = { filename: string; size: number; mime: string; turnstileToken: string };

/** POST /api/paste/file/init — reserves the item + quota/IP-cap slot and returns its PIN immediately. */
export const initFileUpload = async (token: string, init: InitFileUpload): Promise<CreatedItem> => {
  const response = await authedFetch("/api/paste/file/init", token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(init),
  });
  return (await response.json()) as CreatedItem;
};

export const unlockItem = async (
  token: string,
  id: string,
  pin: string,
): Promise<{ content: string }> => {
  const response = await authedFetch(`/api/paste/items/${id}/unlock`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });
  return (await response.json()) as { content: string };
};

export type UploadProgress = {
  sentBytes: number;
  totalBytes: number;
};

// Returns a fresh, non-expired session token — callers pass a getter rather
// than a static token since a multi-hour upload over a slow home uplink
// could outlast a single call, though sessions are now long-lived (24h) so
// this mostly just keeps `uploadFile` credential-agnostic.
export type TokenGetter = () => Promise<string>;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const uploadChunkWithRetry = async (
  itemId: string,
  offset: number,
  blob: Blob,
  getToken: TokenGetter,
  signal?: AbortSignal,
) => {
  let lastError: unknown;
  for (let attempt = 0; attempt < CHUNK_MAX_RETRIES; attempt += 1) {
    if (signal?.aborted) throw new PasteApiError("Upload cancelled");
    try {
      const token = await getToken();
      await authedFetch(`/api/paste/items/${itemId}/chunk?offset=${offset}`, token, {
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

const getUploadStatus = async (itemId: string, token: string): Promise<number> => {
  const response = await authedFetch(`/api/paste/items/${itemId}/status`, token);
  const data = (await response.json()) as { receivedBytes: number };
  return data.receivedBytes;
};

export type UploadFileResult = { id: string; status: ItemStatus };

export const uploadFile = async (
  file: File,
  getToken: TokenGetter,
  options: {
    turnstileToken: string;
    /** Fires as soon as the item + PIN exist, well before the upload (or scan) finishes. */
    onInit?: (init: CreatedItem) => void;
    onProgress?: (progress: UploadProgress) => void;
    signal?: AbortSignal;
  },
): Promise<UploadFileResult> => {
  if (file.size > MAX_FILE_BYTES) {
    throw new PasteApiError(`File exceeds the 5GB limit (${(file.size / 1024 ** 3).toFixed(2)}GB)`);
  }

  const initToken = await getToken();
  const created = await initFileUpload(initToken, {
    filename: file.name,
    size: file.size,
    mime: file.type || "application/octet-stream",
    turnstileToken: options.turnstileToken,
  });
  options.onInit?.(created);
  const itemId = created.id;

  let offset = 0;
  while (offset < file.size) {
    if (options.signal?.aborted) throw new PasteApiError("Upload cancelled");

    const chunk = file.slice(offset, Math.min(offset + CHUNK_BYTES, file.size));
    try {
      await uploadChunkWithRetry(itemId, offset, chunk, getToken, options.signal);
      offset += chunk.size;
    } catch (error) {
      // A dropped connection may have partially landed on the server — trust
      // its reported offset rather than assuming this chunk fully failed.
      const confirmedToken = await getToken();
      const confirmedOffset = await getUploadStatus(itemId, confirmedToken).catch(() => offset);
      if (confirmedOffset > offset) {
        offset = confirmedOffset;
        continue;
      }
      throw error;
    }

    options.onProgress?.({ sentBytes: offset, totalBytes: file.size });
  }

  const completeToken = await getToken();
  const completeResponse = await authedFetch(`/api/paste/items/${itemId}/complete`, completeToken, {
    method: "POST",
  });
  // 202 pending_scan, intentionally with no expiresAt yet — the TTL only
  // starts once the async scan activates the item; poll listItems/getItem
  // to observe that transition.
  return (await completeResponse.json()) as UploadFileResult;
};

// Streams the current file to disk via the File System Access API when
// available (avoids holding multi-GB downloads in memory); falls back to an
// in-memory Blob + object URL on browsers without it. The PIN travels via
// the `X-Paste-Pin` header (not the URL/query string, to keep it out of
// server logs) — the same pinAttemptMiddleware backing `unlockItem` gates
// this route too, so a wrong PIN here counts toward the same 5-attempt lockout.
export const downloadFile = async (
  token: string,
  id: string,
  pin: string,
  filename: string,
  onProgress?: (receivedBytes: number) => void,
): Promise<void> => {
  const response = await authedFetch(`/api/paste/items/${id}/download`, token, {
    headers: { "X-Paste-Pin": pin },
  });
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
