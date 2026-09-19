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
  listItems,
  openByPin,
  saveText,
  uploadFile,
  type Item,
  type OpenedItem,
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
  onDeleted?: () => void;
  onError: (error: RelayError) => void;
};

// Status + delete only. Opening happens through the single PIN field above —
// the row can't offer a shortcut because the PIN is the decryption key and
// the relay never stores it, so not even the owner's own list can unlock an
// item without it.
function ItemRow({ item, now, token, onDeleted, onError }: ItemRowProps) {
  const [busy, setBusy] = useState(false);

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

      <button
        onClick={handleDelete}
        disabled={busy}
        className="self-end text-[11px] font-medium text-zinc-500 hover:text-red-400"
      >
        Delete
      </button>
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

  // --- Open an item. Typed in by hand or prefilled from a /paste/i/<pin>
  // link; either way it's the same single step.

  const [openPin, setOpenPin] = useState("");
  const [openBusy, setOpenBusy] = useState(false);
  const [opened, setOpened] = useState<OpenedItem | null>(null);
  const [openError, setOpenError] = useState<RelayError | null>(null);

  // Opening is one step now: the PIN both names the item and decrypts it, so
  // there's no id to resolve first and no separate unlock call.
  const openWithPin = useCallback(
    async (pin: string) => {
      if (!session || pin.length !== 4) return;
      setOpenBusy(true);
      setOpenError(null);
      try {
        setOpened(await openByPin(session.token, pin));
      } catch (error) {
        setOpened(null);
        setOpenError(toRelayError(error));
      } finally {
        setOpenBusy(false);
      }
    },
    [session],
  );

  const handleOpenByPin = () => openWithPin(openPin);

  const handleDownloadOpened = async () => {
    if (!session || opened?.kind !== "file") return;
    setOpenBusy(true);
    try {
      await downloadFile(session.token, openPin, opened.filename ?? "download");
    } catch (error) {
      setOpenError(toRelayError(error));
    } finally {
      setOpenBusy(false);
    }
  };

  // A /paste/i/<pin> link just prefills and opens — same single step.
  useEffect(() => {
    if (session && itemId && /^\d{4}$/.test(itemId)) {
      setOpenPin(itemId);
      openWithPin(itemId);
    }
  }, [session, itemId, openWithPin]);

  // --- Create item (explicit Save/Upload — no more debounced autosave: a
  // continuous-autosave effect would blow through the 1/min create limit
  // almost immediately). Turnstile was originally required here too, but
  // came off post-launch — solving a fresh captcha on every single save was
  // too disruptive for a small set of already-authenticated, invite-only
  // users. requireAuth + the 1/min rate limit are the controls on these
  // routes now; Turnstile stays on login/redeem-invite above. ---

  const [textDraft, setTextDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ sent: number; total: number } | null>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);
  const [createdPin, setCreatedPin] = useState<{ id: string; pin: string } | null>(null);
  const [pinCopied, setPinCopied] = useState(false);

  const handleSaveText = async () => {
    if (!session || textDraft.trim().length === 0) return;
    setSaving(true);
    setRelayError(null);
    try {
      const created = await saveText(session.token, textDraft);
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
    if (!session) return;
    if (file.size > MAX_FILE_BYTES) {
      toast({ title: "File too large", description: "5GB max.", variant: "destructive" });
      return;
    }

    const controller = new AbortController();
    uploadAbortRef.current = controller;
    setUploadProgress({ sent: 0, total: file.size });

    try {
      await uploadFile(file, getToken, {
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

              <div className="flex w-full flex-col gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                  Open an item
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <PinInput value={openPin} onChange={setOpenPin} disabled={openBusy} />
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={openBusy || openPin.length !== 4}
                    onClick={handleOpenByPin}
                  >
                    {openBusy ? "Opening…" : "Open"}
                  </Button>
                </div>
                <p className="text-[11px] text-zinc-600">
                  The 4-digit PIN is the whole address — it finds the item and unlocks it. Works for anyone
                  signed in, from any device.
                </p>

                {openError && <RetryCountdown message={openError.message} retryAt={openError.retryAt} />}

                {opened?.kind === "text" && (
                  <Textarea
                    readOnly
                    value={opened.content}
                    className="min-h-[120px] resize-y bg-zinc-950/60 text-xs text-zinc-100"
                  />
                )}

                {opened?.kind === "file" && (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-zinc-700/60 bg-zinc-800/50 px-3.5 py-2.5">
                    <span className="truncate text-xs text-zinc-300">
                      {opened.filename}
                      {opened.size !== null ? ` · ${formatBytes(opened.size)}` : ""}
                    </span>
                    <Button size="sm" variant="secondary" disabled={openBusy} onClick={handleDownloadOpened}>
                      Download
                    </Button>
                  </div>
                )}
              </div>

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

                <Button
                  className="w-full"
                  disabled={saving || textDraft.trim().length === 0}
                  onClick={handleSaveText}
                >
                  {saving ? "Saving…" : "Save"}
                </Button>

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
