import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { renderGoogleSignInButton, promptGoogleReauth, type GoogleIdentity } from "@/lib/googleAuth";
import {
  MAX_FILE_BYTES,
  clearPaste,
  downloadFile,
  getPasteState,
  saveText,
  uploadFile,
  type PasteState,
} from "@/lib/pasteApi";

const POLL_MS = 3000;
const AUTOSAVE_MS = 600;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID ?? "";

const formatCountdown = (msRemaining: number) => {
  const totalSeconds = Math.max(0, Math.ceil(msRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
};

export default function PastePage() {
  const { toast } = useToast();
  const signInRef = useRef<HTMLDivElement>(null);

  const [identity, setIdentity] = useState<GoogleIdentity | null>(null);
  const identityRef = useRef<GoogleIdentity | null>(null);
  const [state, setState] = useState<PasteState>({ kind: "empty" });
  const [textDraft, setTextDraft] = useState("");
  const [textFocused, setTextFocused] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [uploadProgress, setUploadProgress] = useState<{ sent: number; total: number } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [relayError, setRelayError] = useState<string | null>(null);

  const lastLocalEditAt = useRef(0);
  const uploadAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    identityRef.current = identity;
  }, [identity]);

  // Google's ID tokens are short-lived; re-mint one on demand rather than
  // caching a single token across a potentially long upload.
  const getFreshToken = useCallback(async (): Promise<string> => {
    if (!identityRef.current) throw new Error("Not signed in");
    try {
      const fresh = await promptGoogleReauth(CLIENT_ID);
      identityRef.current = fresh;
      setIdentity(fresh);
      return fresh.idToken;
    } catch {
      return identityRef.current.idToken;
    }
  }, []);

  useEffect(() => {
    if (identity || !signInRef.current) return;
    renderGoogleSignInButton(signInRef.current, CLIENT_ID)
      .then(setIdentity)
      .catch((error: Error) => setRelayError(error.message));
  }, [identity]);

  const refreshState = useCallback(async () => {
    if (!identityRef.current) return;
    try {
      const next = await getPasteState(identityRef.current.idToken);
      setRelayError(null);
      setState(next);
      if (!textFocused && Date.now() - lastLocalEditAt.current > AUTOSAVE_MS * 2) {
        setTextDraft(next.kind === "text" ? next.content : "");
      }
    } catch (error) {
      setRelayError(error instanceof Error ? error.message : "Could not reach the paste relay");
    }
  }, [textFocused]);

  useEffect(() => {
    if (!identity) return;
    refreshState();
    const interval = setInterval(refreshState, POLL_MS);
    return () => clearInterval(interval);
  }, [identity, refreshState]);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!identity || textFocused) return;
    const handle = setTimeout(async () => {
      if (textDraft.trim().length === 0) return;
      try {
        const { expiresAt } = await saveText(identity.idToken, textDraft);
        setState({ kind: "text", content: textDraft, expiresAt });
        setRelayError(null);
      } catch (error) {
        setRelayError(error instanceof Error ? error.message : "Save failed");
      }
    }, AUTOSAVE_MS);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textDraft]);

  const expiresAt = state.kind !== "empty" ? new Date(state.expiresAt).getTime() : null;
  const msRemaining = expiresAt ? expiresAt - now : 0;
  const expired = expiresAt !== null && msRemaining <= 0;

  const handleClear = async () => {
    if (!identity) return;
    try {
      await clearPaste(identity.idToken);
      setState({ kind: "empty" });
      setTextDraft("");
    } catch (error) {
      toast({
        title: "Couldn't clear",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!identity) return;
    if (file.size > MAX_FILE_BYTES) {
      toast({ title: "File too large", description: "5GB max.", variant: "destructive" });
      return;
    }

    const controller = new AbortController();
    uploadAbortRef.current = controller;
    setUploadProgress({ sent: 0, total: file.size });

    try {
      await uploadFile(file, getFreshToken, {
        signal: controller.signal,
        onProgress: ({ sentBytes, totalBytes }) => setUploadProgress({ sent: sentBytes, total: totalBytes }),
      });
      await refreshState();
      toast({ title: "Uploaded", description: `${file.name} is ready on any device for 5 minutes.` });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUploadProgress(null);
      uploadAbortRef.current = null;
    }
  };

  const handleDownload = async () => {
    if (!identity || state.kind !== "file") return;
    setDownloading(true);
    try {
      await downloadFile(identity.idToken, state.filename);
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Seo title="Paste | Felix Egan" description="Temporary cross-device clipboard" canonicalPath="/paste" />

      <main className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-16">
        <Link
          to="/"
          className="absolute left-4 top-5 flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
          Back
        </Link>

        <div className="flex w-full max-w-lg flex-col items-center gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-7 shadow-2xl backdrop-blur-sm">
          <div className="space-y-1 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Felix Egan</p>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Paste</h1>
            <p className="text-xs text-zinc-500">Text or a file up to 5GB, visible on any signed-in device for 5 minutes, then gone.</p>
          </div>

          {!identity ? (
            <div ref={signInRef} className="flex justify-center py-4" />
          ) : (
            <div className="flex w-full flex-col gap-4">
              {relayError && (
                <p className="rounded-lg border border-amber-900/60 bg-amber-950/40 px-3 py-2 text-xs text-amber-400">
                  {relayError}
                </p>
              )}

              {state.kind !== "empty" && (
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>{expired ? "Expired" : `Expires in ${formatCountdown(msRemaining)}`}</span>
                  <button onClick={handleClear} className="font-medium text-zinc-400 hover:text-red-400">
                    Clear now
                  </button>
                </div>
              )}

              {state.kind === "file" && !expired ? (
                <div className="flex items-center justify-between rounded-lg border border-zinc-700/60 bg-zinc-800/50 px-3.5 py-2.5">
                  <span className="truncate text-xs text-zinc-300">
                    {state.filename} · {formatBytes(state.size)}
                  </span>
                  <Button size="sm" variant="secondary" disabled={downloading} onClick={handleDownload}>
                    {downloading ? "Downloading…" : "Download"}
                  </Button>
                </div>
              ) : (
                <Textarea
                  value={textDraft}
                  onFocus={() => setTextFocused(true)}
                  onBlur={() => setTextFocused(false)}
                  onChange={(e) => {
                    lastLocalEditAt.current = Date.now();
                    setTextDraft(e.target.value);
                  }}
                  placeholder="Paste or type here — saves automatically"
                  className="min-h-[160px] resize-y bg-zinc-950/60 text-sm text-zinc-100"
                />
              )}

              <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-dashed border-zinc-700 px-4 py-5 text-center text-xs text-zinc-500 transition-colors hover:border-zinc-500 hover:text-zinc-300">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                    e.target.value = "";
                  }}
                />
                {uploadProgress ? (
                  <div className="w-full space-y-1.5">
                    <Progress value={(uploadProgress.sent / uploadProgress.total) * 100} className="h-1.5" />
                    <span>
                      {formatBytes(uploadProgress.sent)} / {formatBytes(uploadProgress.total)}
                    </span>
                  </div>
                ) : (
                  <span>Click or drop a file here — up to 5GB</span>
                )}
              </label>
            </div>
          )}
        </div>

        <p className="mt-6 max-w-sm text-center text-xs text-zinc-600">
          Nothing is kept after 5 minutes. Sign-in is required so only your devices can read or write here.
        </p>
      </main>
    </>
  );
}
