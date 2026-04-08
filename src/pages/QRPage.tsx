import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";

const SITE_URL = "https://felixegan.me";

function useWakeLock() {
  const ref = useRef<WakeLockSentinel | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let unmounted = false;

    const acquire = async () => {
      if (!("wakeLock" in navigator)) return;
      try {
        ref.current = await navigator.wakeLock.request("screen");
        if (!unmounted) setActive(true);
        ref.current.addEventListener("release", () => {
          if (!unmounted) setActive(false);
        });
      } catch {
        // Not available — silent fail, no prompt
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") acquire();
    };

    acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      unmounted = true;
      document.removeEventListener("visibilitychange", onVisible);
      ref.current?.release().catch(() => {});
    };
  }, []);

  return active;
}

export default function QRPage() {
  const wakeLockActive = useWakeLock();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent
    }
  };

  const handleShare = () => {
    navigator
      .share({
        title: "Felix Egan Studio",
        text: "Check out Felix Egan's portfolio & studio",
        url: SITE_URL,
      })
      .catch(() => {});
  };

  // Responsive QR size: fits nicely on any phone without overflowing
  const qrSize =
    typeof window !== "undefined"
      ? Math.min(window.innerWidth - 96, 260)
      : 240;

  return (
    <>
      <Seo
        title="Share | Felix Egan Studio"
        description="Scan to visit Felix Egan Studio"
        canonicalPath="/qr"
      />

      <main className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-16">

        {/* Back */}
        <Link
          to="/"
          className="absolute left-4 top-5 flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
          Back
        </Link>

        {/* Wake lock indicator */}
        {wakeLockActive && (
          <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-emerald-800/60 bg-emerald-950/70 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Screen on
          </div>
        )}

        {/* Card */}
        <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-7 shadow-2xl backdrop-blur-sm">

          {/* Header copy */}
          <div className="space-y-1 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Felix Egan Studio
            </p>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">
              Scan to visit
            </h1>
          </div>

          {/* QR code — white inset so it stays scannable */}
          <div className="rounded-xl bg-white p-4 shadow-inner">
            <QRCodeSVG
              value={SITE_URL}
              size={qrSize}
              level="H"
              bgColor="#ffffff"
              fgColor="#09090b"
              style={{ display: "block", borderRadius: "4px" }}
            />
          </div>

          {/* URL row with copy */}
          <button
            onClick={handleCopy}
            className="group flex w-full items-center gap-2 rounded-lg border border-zinc-700/60 bg-zinc-800/50 px-3.5 py-2.5 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-zinc-500"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left text-xs text-zinc-400">
              {SITE_URL.replace("https://", "")}
            </span>
            <span className={`shrink-0 text-xs font-medium transition-colors ${copied ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300"}`}>
              {copied ? "Copied!" : "Copy"}
            </span>
          </button>

          {/* Share button — only on devices that support it */}
          {"share" in navigator && (
            <button
              onClick={handleShare}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 active:bg-blue-700"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Share via…
            </button>
          )}
        </div>

        {/* Footer hint */}
        <p className="mt-6 text-center text-xs text-zinc-600">
          Point any camera at the code — no app needed.
        </p>
      </main>
    </>
  );
}
