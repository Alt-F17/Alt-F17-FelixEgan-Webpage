import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { PatternGrid } from "@/components/paste/PatternGrid";
import { PinInput } from "@/components/paste/PinInput";
import { RetryCountdown } from "@/components/paste/RetryCountdown";
import { formatCountdown } from "@/lib/countdown";
import { renderTurnstile, type TurnstileHandle } from "@/lib/turnstile";
import * as authApi from "@/lib/authApi";
import {
  MAX_FILE_BYTES,
  PasteApiError,
  deleteItem,
  downloadFile,
  getItem,
  listItems,
  saveText,
  unlockItem,
  uploadFile,
  type Item,
} from "@/lib/pasteApi";

const POLL_MS = 5000;
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "";

type RelayError = { message: string; retryAt: string | null };

// Both PasteApiError (pasteApi.ts) and AuthApiError (authApi.ts) carry the
// same {message, retryAt} shape from the relay's standard error body —
// normalize either into the plain object RetryCountdown expects.
const toRelayError = (error: unknown): RelayError => {
  if (error instanceof PasteApiError || error instanceof authApi.AuthApiError) {
    return { message: error.message, retryAt: error.retryAt ?? null };
  }
  return { message: error instanceof Error ? error.message : "Something went wrong", retryAt: null };
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
};

const BackLink = () => (
  <Link
    to="/"
    className="absolute left-4 top-5 flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M5 12l7 7M5 12l7-7" />
    </svg>
    Back
  </Link>
);

const Header = ({ subtitle }: { subtitle: string }) => (
  <div className="space-y-1 text-center">
    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Felix Egan</p>
    <h1 className="text-xl font-bold tracking-tight text-zinc-100">Paste</h1>
    <p className="text-xs text-zinc-500">{subtitle}</p>
  </div>
);

// --- Turnstile ---------------------------------------------------------

type TurnstileWidgetHandle = { reset: () => void };

// Renders one Turnstile widget and reports each freshly-solved token via
// onToken. Cloudflare tokens are single-use, so callers reset() after every
// submit attempt (success or failure) to get a new one for next time.
const TurnstileWidget = forwardRef<TurnstileWidgetHandle, { onToken: (token: string) => void }>(
  ({ onToken }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<TurnstileHandle | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => handleRef.current?.reset(),
    }));

    useEffect(() => {
      let cancelled = false;
      const container = containerRef.current;
      if (!container) return;

      renderTurnstile(container, TURNSTILE_SITE_KEY, { onToken })
        .then((handle) => {
          if (cancelled) {
            handle.remove();
            return;
          }
          handleRef.current = handle;
        })
        .catch(() => {
          // No token will ever arrive; callers notice via a disabled submit
          // button and the page's own relayError messaging on submit.
        });

      return () => {
        cancelled = true;
        handleRef.current?.remove();
        handleRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div ref={containerRef} className="flex justify-center" />;
  },
);
TurnstileWidget.displayName = "TurnstileWidget";

// --- One item row (owned or reached via a shared /paste/i/:id link) ----

type ItemRowProps = {
  item: Item;
  now: number;
  token: string;
  allowDelete?: boolean;
  onDeleted?: () => void;
  onError: (error: RelayError) => void;
};

function ItemRow({ item, now, token, allowDelete = true, onDeleted, onError }: ItemRowProps) {
  const { toast } = useToast();
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [content, setContent] = useState<string | null>(null);

  const expiresAtMs = item.expiresAt ? new Date(item.expiresAt).getTime() : null;
  const msRemaining = expiresAtMs !== null ? expiresAtMs - now : null;

  const statusLabel =
    item.status !== "active"
      ? item.status.replace("_", " ")
      : msRemaining !== null
        ? msRemaining > 0
          ? `Expires in ${formatCountdown(msRemaining)}`
          : "Expired"
        : "";

  const handleOpen = async () => {
    if (pin.length !== 4) return;
    setBusy(true);
    try {
      if (item.kind === "text") {
        const result = await unlockItem(token, item.id, pin);
        setContent(result.content);
      } else {
        await downloadFile(token, item.id, pin, item.filename ?? "download");
        toast({ title: "Downloaded", description: item.filename ?? undefined });
      }
      setPin("");
    } catch (error) {
      onError(toRelayError(error));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteItem(token, item.id);
      onDeleted?.();
    } catch (error) {
      onError(toRelayError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-zinc-700/60 bg-zinc-800/50 px-3.5 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs text-zinc-300">
          {item.kind === "file" ? item.filename : "Text paste"}
          {item.kind === "file" && item.size !== null ? ` · ${formatBytes(item.size)}` : ""}
        </span>
        <span className="shrink-0 text-[11px] text-zinc-500">{statusLabel}</span>
      </div>

      {content !== null ? (
        <Textarea
          readOnly
          value={content}
          className="min-h-[100px] resize-y bg-zinc-950/60 text-xs text-zinc-100"
        />
      ) : (
        item.status === "active" && (
          <div className="flex flex-wrap items-center gap-2">
            <PinInput value={pin} onChange={setPin} disabled={busy} />
            <Button size="sm" variant="secondary" disabled={busy || pin.length !== 4} onClick={handleOpen}>
              {item.kind === "text" ? "Open" : "Download"}
            </Button>
          </div>
        )
      )}

      {allowDelete && (
        <button
          onClick={handleDelete}
          disabled={busy}
          className="self-end text-[11px] font-medium text-zinc-500 hover:text-red-400"
        >
          Delete
        </button>
      )}
    </div>
  );
}

// --- Page ----------------------------------------------------------------

export default function PastePage() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { itemId } = useParams<{ itemId?: string }>();
  const inviteToken = searchParams.get("invite");

  const [session, setSession] = useState<authApi.Session | null>(() => authApi.loadSession());
  const sessionRef = useRef<authApi.Session | null>(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const getToken = useCallback(async (): Promise<string> => {
    if (!sessionRef.current) throw new Error("Not signed in");
    return sessionRef.current.token;
  }, []);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  // --- Auth screen (login, or redeem-invite when ?invite= is present) ---

  const [patternHash, setPatternHash] = useState<string | null>(null);
  const [authTurnstileToken, setAuthTurnstileToken] = useState<string | null>(null);
  const authTurnstileRef = useRef<TurnstileWidgetHandle>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState<RelayError | null>(null);

  const handlePatternComplete = useCallback((cells: number[]) => {
    authApi.hashPatternClient(cells).then(setPatternHash);
  }, []);

  const handleAuthSubmit = async () => {
    if (!patternHash || !authTurnstileToken) return;
    setAuthSubmitting(true);
    setAuthError(null);
    try {
      const result = inviteToken
        ? await authApi.redeemInvite(inviteToken, patternHash, authTurnstileToken)
        : await authApi.login(patternHash, authTurnstileToken);
      authApi.saveSession(result);
      setSession(result);
      setPatternHash(null);
    } catch (error) {
      setAuthError(toRelayError(error));
    } finally {
      setAuthSubmitting(false);
      setAuthTurnstileToken(null);
      authTurnstileRef.current?.reset();
    }
  };

  const handleLogout = async () => {
    if (!session) return;
    try {
      await authApi.logout(session.token);
    } catch {
      // Best-effort: clear local state regardless of whether this reached the server.
    }
    authApi.clearSession();
    setSession(null);
    setItems([]);
  };

  // --- Owned items list ---

  const [items, setItems] = useState<Item[]>([]);
  const [relayError, setRelayError] = useState<RelayError | null>(null);

  const refreshItems = useCallback(async () => {
    if (!sessionRef.current) return;
    try {
      const next = await listItems(sessionRef.current.token);
      setItems(next);
      setRelayError(null);
    } catch (error) {
      setRelayError(toRelayError(error));
    }
  }, []);

  useEffect(() => {
    if (!session) return;
    refreshItems();
    const interval = setInterval(refreshItems, POLL_MS);
    return () => clearInterval(interval);
  }, [session, refreshItems]);

  // --- Shared item (arrived via /paste/i/:itemId) ---

  const [sharedItem, setSharedItem] = useState<Item | null>(null);
  const [sharedError, setSharedError] = useState<RelayError | null>(null);

  useEffect(() => {
    if (!session || !itemId) {
      setSharedItem(null);
      return;
    }
    getItem(session.token, itemId)
      .then(setSharedItem)
      .catch((error) => setSharedError(toRelayError(error)));
  }, [session, itemId]);

  // --- Create item (explicit Save/Upload — no more debounced autosave: a
  // continuous-autosave effect would blow through the 1/min create limit
  // and per-paste captcha requirement almost immediately) ---

  const [textDraft, setTextDraft] = useState("");
  const [createTurnstileToken, setCreateTurnstileToken] = useState<string | null>(null);
  const createTurnstileRef = useRef<TurnstileWidgetHandle>(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ sent: number; total: number } | null>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);
  const [createdPin, setCreatedPin] = useState<{ id: string; pin: string } | null>(null);
  const [pinCopied, setPinCopied] = useState(false);

  const consumeCreateToken = () => {
    const token = createTurnstileToken;
    setCreateTurnstileToken(null);
    createTurnstileRef.current?.reset();
    return token;
  };

  const handleSaveText = async () => {
    if (!session || !createTurnstileToken || textDraft.trim().length === 0) return;
    const turnstileToken = consumeCreateToken();
    if (!turnstileToken) return;
    setSaving(true);
    setRelayError(null);
    try {
      const created = await saveText(session.token, textDraft, turnstileToken);
      setCreatedPin({ id: created.id, pin: created.pin });
      setPinCopied(false);
      setTextDraft("");
      await refreshItems();
      toast({ title: "Saved", description: "Copy the PIN below — it won't be shown again." });
    } catch (error) {
      setRelayError(toRelayError(error));
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!session || !createTurnstileToken) return;
    if (file.size > MAX_FILE_BYTES) {
      toast({ title: "File too large", description: "5GB max.", variant: "destructive" });
      return;
    }

    const turnstileToken = consumeCreateToken();
    if (!turnstileToken) return;

    const controller = new AbortController();
    uploadAbortRef.current = controller;
    setUploadProgress({ sent: 0, total: file.size });

    try {
      await uploadFile(file, getToken, {
        turnstileToken,
        signal: controller.signal,
        onInit: (created) => {
          setCreatedPin({ id: created.id, pin: created.pin });
          setPinCopied(false);
        },
        onProgress: ({ sentBytes, totalBytes }) => setUploadProgress({ sent: sentBytes, total: totalBytes }),
      });
      await refreshItems();
      toast({ title: "Uploaded", description: `${file.name} is being scanned — it'll be shareable once ready.` });
    } catch (error) {
      setRelayError(toRelayError(error));
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

  const handleCopyPin = async () => {
    if (!createdPin) return;
    try {
      await navigator.clipboard.writeText(createdPin.pin);
      setPinCopied(true);
    } catch {
      toast({ title: "Couldn't copy", description: "Copy the PIN manually.", variant: "destructive" });
    }
  };

  const createReady = Boolean(createTurnstileToken);

  return (
    <>
      <Seo title="Paste | Felix Egan" description="Temporary cross-device clipboard" canonicalPath="/paste" />

      <main className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-16">
        <BackLink />

        <div className="flex w-full max-w-lg flex-col items-center gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-7 shadow-2xl backdrop-blur-sm">
          {!session ? (
            <>
              <Header
                subtitle={
                  inviteToken
                    ? "Draw a pattern to secure your new account."
                    : "Draw your pattern to unlock Paste. No public sign-up — accounts come only from an invite link."
                }
              />

              {authError && <RetryCountdown message={authError.message} retryAt={authError.retryAt} />}

              <PatternGrid onComplete={handlePatternComplete} disabled={authSubmitting} />

              <TurnstileWidget ref={authTurnstileRef} onToken={setAuthTurnstileToken} />

              <Button
                className="w-full"
                disabled={!patternHash || !authTurnstileToken || authSubmitting}
                onClick={handleAuthSubmit}
              >
                {authSubmitting ? "Please wait…" : inviteToken ? "Create account" : "Sign in"}
              </Button>
            </>
          ) : (
            <>
              <div className="flex w-full items-start justify-between">
                <Header subtitle="Text or a file up to 5GB, PIN-protected, gone after 5 minutes." />
                <button
                  onClick={handleLogout}
                  className="mt-1 shrink-0 text-[11px] font-medium text-zinc-500 hover:text-zinc-300"
                >
                  Sign out
                </button>
              </div>

              {relayError && <RetryCountdown message={relayError.message} retryAt={relayError.retryAt} />}

              {itemId && (
                <div className="flex w-full flex-col gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Shared with you</p>
                  {sharedError && <RetryCountdown message={sharedError.message} retryAt={sharedError.retryAt} />}
                  {sharedItem ? (
                    <ItemRow
                      item={sharedItem}
                      now={now}
                      token={session.token}
                      allowDelete={false}
                      onError={setSharedError}
                    />
                  ) : (
                    !sharedError && <p className="text-xs text-zinc-500">Loading shared item…</p>
                  )}
                </div>
              )}

              {createdPin && (
                <div className="flex w-full flex-col items-center gap-2 rounded-lg border border-emerald-900/60 bg-emerald-950/40 px-4 py-3 text-center">
                  <p className="text-xs text-emerald-400">
                    Share this PIN — it won't be shown again.
                  </p>
                  <p className="font-mono text-2xl tracking-[0.3em] text-emerald-300">{createdPin.pin}</p>
                  <Button size="sm" variant="secondary" onClick={handleCopyPin}>
                    {pinCopied ? "Copied" : "Copy PIN"}
                  </Button>
                </div>
              )}

              {items.length > 0 && (
                <div className="flex w-full flex-col gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Your items</p>
                  {items.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      now={now}
                      token={session.token}
                      onDeleted={refreshItems}
                      onError={setRelayError}
                    />
                  ))}
                </div>
              )}

              <div className="flex w-full flex-col gap-3 border-t border-zinc-800 pt-4">
                <Textarea
                  value={textDraft}
                  onChange={(e) => setTextDraft(e.target.value)}
                  placeholder="Type or paste text, then hit Save"
                  className="min-h-[120px] resize-y bg-zinc-950/60 text-sm text-zinc-100"
                />

                <TurnstileWidget ref={createTurnstileRef} onToken={setCreateTurnstileToken} />

                <Button
                  className="w-full"
                  disabled={!createReady || saving || textDraft.trim().length === 0}
                  onClick={handleSaveText}
                >
                  {saving ? "Saving…" : "Save"}
                </Button>

                <label
                  className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-dashed border-zinc-700 px-4 py-5 text-center text-xs text-zinc-500 transition-colors hover:border-zinc-500 hover:text-zinc-300 ${
                    !createReady ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  <input
                    type="file"
                    className="hidden"
                    disabled={!createReady}
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
            </>
          )}
        </div>

        <p className="mt-6 max-w-sm text-center text-xs text-zinc-600">
          Every item gets its own 4-digit PIN — hand it to anyone signed in to unlock it. Nothing is kept
          after 5 minutes of being ready.
        </p>
      </main>
    </>
  );
}
