import type { ReactNode } from "react";
import { createPortal } from "react-dom";

const mono = "'IBM Plex Mono',monospace";

/**
 * The full-screen green CRT the corruption wave lands on: scanlines, flicker,
 * vignette and an esc button. Shared by the footer terminal and the 404's BREACH.
 */
export function CrtScreen({ onExit, children }: { onExit: () => void; children: ReactNode }) {
  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483600,
        background: "#000208",
        color: "var(--green,#35ff8f)",
        animation: "fe-termin .5s ease-out both",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 3,
          background:
            "repeating-linear-gradient(0deg,rgba(0,0,0,0) 0,rgba(0,0,0,0) 2px,rgba(0,20,8,.5) 3px,rgba(0,0,0,0) 4px)",
          mixBlendMode: "overlay",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 4,
          background: "rgba(53,255,143,.9)",
          animation: "fe-flick .13s steps(2) infinite",
          mixBlendMode: "overlay",
          opacity: 0.06,
        }}
      />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5, boxShadow: "inset 0 0 220px 40px rgba(0,0,0,.9)" }} />

      <button
        onClick={onExit}
        className="fe-termexit"
        style={{
          position: "absolute",
          top: 14,
          right: 16,
          zIndex: 6,
          fontFamily: mono,
          fontSize: 11,
          color: "#3aa768",
          background: "rgba(0,10,4,.5)",
          border: "1px solid rgba(53,255,143,.28)",
          padding: "6px 12px",
          cursor: "pointer",
          letterSpacing: 1.5,
          opacity: 0.75,
        }}
      >
        esc ✕
      </button>

      <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>{children}</div>
    </div>,
    document.body
  );
}
