import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";

const SITE_URL = "https://felixegan.me";

function useScreenBrightness() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  useEffect(() => {
    let released = false;

    const acquire = async () => {
      if (!("wakeLock" in navigator)) return;
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
        if (!released) setWakeLockActive(true);
        wakeLockRef.current.addEventListener("release", () => {
          if (!released) setWakeLockActive(false);
        });
      } catch {
        // Permission not available — silent fail
      }
    };

    // Re-acquire on visibility change (wake lock is released when tab is hidden)
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") acquire();
    };

    acquire();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      released = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      wakeLockRef.current?.release().catch(() => {});
    };
  }, []);

  return wakeLockActive;
}

export default function QRPage() {
  const wakeLockActive = useScreenBrightness();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: silent
    }
  };

  return (
    <div
      className="qr-page"
      style={{
        minHeight: "100dvh",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
        fontFamily: "'Sora', sans-serif",
        color: "#09090b",
        position: "relative",
      }}
    >
      {/* Back link */}
      <Link
        to="/"
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "13px",
          color: "#71717a",
          textDecoration: "none",
          fontWeight: 500,
          letterSpacing: "0.01em",
        }}
      >
        <svg
          width="16"
          height="16"
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

      {/* Wake lock pill */}
      {wakeLockActive && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "11px",
            color: "#16a34a",
            background: "#dcfce7",
            borderRadius: "99px",
            padding: "4px 10px",
            fontWeight: 600,
            letterSpacing: "0.03em",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#16a34a",
              display: "inline-block",
            }}
          />
          Screen on
        </div>
      )}

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "28px",
          maxWidth: "360px",
          width: "100%",
        }}
      >
        {/* Wordmark */}
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#a1a1aa",
              marginBottom: "6px",
            }}
          >
            Felix Egan Studio
          </p>
          <h1
            style={{
              fontSize: "clamp(22px, 6vw, 28px)",
              fontWeight: 700,
              color: "#09090b",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Scan to visit
          </h1>
        </div>

        {/* QR code card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "24px",
            boxShadow:
              "0 0 0 1px rgba(0,0,0,0.06), 0 4px 6px -1px rgba(0,0,0,0.07), 0 16px 40px -4px rgba(0,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <QRCodeSVG
            value={SITE_URL}
            size={Math.min(window.innerWidth - 112, 240)}
            level="H"
            bgColor="#ffffff"
            fgColor="#09090b"
            style={{ borderRadius: "4px", display: "block" }}
          />

          {/* URL bar inside card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#f4f4f5",
              borderRadius: "10px",
              padding: "8px 14px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#71717a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
            <span
              style={{
                fontSize: "13px",
                color: "#3f3f46",
                fontWeight: 500,
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {SITE_URL.replace("https://", "")}
            </span>
            <button
              onClick={handleCopy}
              style={{
                background: "none",
                border: "none",
                padding: "2px",
                cursor: "pointer",
                color: copied ? "#16a34a" : "#71717a",
                display: "flex",
                alignItems: "center",
                transition: "color 0.2s",
                flexShrink: 0,
              }}
              aria-label="Copy link"
            >
              {copied ? (
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Subtext */}
        <p
          style={{
            fontSize: "13px",
            color: "#a1a1aa",
            textAlign: "center",
            margin: 0,
            lineHeight: 1.6,
            maxWidth: "260px",
          }}
        >
          Point your camera at the code to open the site, no app needed.
        </p>

        {/* Share button (native) */}
        {"share" in navigator && (
          <button
            onClick={() =>
              navigator.share({
                title: "Felix Egan Studio",
                text: "Check out Felix Egan's portfolio & studio",
                url: SITE_URL,
              }).catch(() => {})
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#09090b",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              padding: "13px 28px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: "0.01em",
              width: "100%",
              justifyContent: "center",
              fontFamily: "inherit",
            }}
          >
            <svg
              width="16"
              height="16"
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
    </div>
  );
}
