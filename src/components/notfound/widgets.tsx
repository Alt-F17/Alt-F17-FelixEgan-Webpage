import { useEffect, useRef, useState } from "react";
import { morseTimeline, PAYLOAD } from "./breach/levels";

const mono = "'IBM Plex Mono',monospace";
const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Level 4: two-ring Caesar wheel. Drag the inner ring; the readout decodes live. */
export function CipherWheel() {
  const [shift, setShift] = useState(0);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const size = 236;
  const c = size / 2;
  const step = 360 / 26;

  const angleAt = (x: number, y: number) => {
    const r = svgRef.current!.getBoundingClientRect();
    return (Math.atan2(y - (r.top + r.height / 2), x - (r.left + r.width / 2)) * 180) / Math.PI;
  };
  const onDown = (e: React.PointerEvent<SVGGElement>) => {
    e.stopPropagation();
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const a0 = angleAt(e.clientX, e.clientY);
    const s0 = shift;
    const move = (ev: PointerEvent) => {
      const d = angleAt(ev.clientX, ev.clientY) - a0;
      setShift((((s0 + Math.round(d / step)) % 26) + 26) % 26);
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };
  const decoded = PAYLOAD.cipher.replace(/[A-Z]/g, (ch) => ABC[(ABC.indexOf(ch) - shift + 26) % 26]);
  const ring = (r: number, rot: number, color: string, fs: number) =>
    [...ABC].map((ch, i) => {
      const a = ((i * step + rot - 90) * Math.PI) / 180;
      return (
        <text
          key={ch}
          x={c + r * Math.cos(a)}
          y={c + r * Math.sin(a)}
          fill={color}
          fontSize={fs}
          fontFamily="IBM Plex Mono, monospace"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {ch}
        </text>
      );
    });

  return (
    <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontFamily: mono }}>
      <svg ref={svgRef} width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ touchAction: "none" }}>
        <circle cx={c} cy={c} r={c - 4} fill="none" stroke="rgba(53,255,143,.35)" />
        <circle cx={c} cy={c} r={c - 34} fill="rgba(53,255,143,.05)" stroke="rgba(53,255,143,.5)" />
        {ring(c - 18, 0, "#7cffb0", 12)}
        <g onPointerDown={onDown} style={{ cursor: "grab" }}>
          <circle cx={c} cy={c} r={c - 36} fill="transparent" />
          {ring(c - 50, shift * step, "#c9ffe0", 12)}
          <circle cx={c} cy={c} r={24} fill="#000a04" stroke="rgba(53,255,143,.4)" />
          <text x={c} y={c} fill="#35ff8f" fontSize={12} textAnchor="middle" dominantBaseline="central" fontFamily="IBM Plex Mono, monospace">
            {String(shift).padStart(2, "0")}
          </text>
        </g>
        <line x1={c} y1={4} x2={c} y2={40} stroke="#ffd23f" strokeWidth={1.5} />
      </svg>
      <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 12 }}>
        <button className="fe404-termlink" onClick={() => setShift((s) => (s + 25) % 26)} aria-label="Rotate left">
          ◀
        </button>
        <span style={{ color: "#2f7d4f" }}>ct:</span>
        <span style={{ color: "#c9ffe0", letterSpacing: 1 }}>{PAYLOAD.cipher}</span>
        <button className="fe404-termlink" onClick={() => setShift((s) => (s + 1) % 26)} aria-label="Rotate right">
          ▶
        </button>
      </div>
      <div style={{ fontSize: 15, letterSpacing: 2, color: "#35ff8f" }}>{decoded}</div>
    </div>
  );
}

/** Level 6: a star that blinks the key in morse while the level is live, and just twinkles otherwise. */
export function MorseStar({ x, y, active }: { x: number; y: number; active: boolean }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    if (!active) {
      setOn(true);
      return;
    }
    const tl = morseTimeline();
    const unit = 230;
    let i = 0;
    let t = 0;
    const tick = () => {
      const s = tl[i];
      setOn(s.on);
      i = (i + 1) % tl.length;
      t = window.setTimeout(tick, s.units * unit);
    };
    tick();
    return () => window.clearTimeout(t);
  }, [active]);
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 3,
        height: 3,
        background: "#eaf1ff",
        boxShadow: on ? "0 0 6px 2px rgba(200,220,255,.85)" : "none",
        opacity: active ? (on ? 1 : 0.06) : 0.8,
        animation: active ? undefined : "fe-pulse 3.2s ease-in-out infinite",
        zIndex: 5,
        pointerEvents: "none",
      }}
    />
  );
}

export type Flash = { code: string | null; round: number; total: number } | null;

/** Level 9: the trace code is painted on a canvas so it never exists in the DOM. */
export function FlashCanvas({ flash }: { flash: Flash }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = cv.clientWidth;
    const h = cv.clientHeight;
    cv.width = w * dpr;
    cv.height = h * dpr;
    ctx.scale(dpr, dpr);
    let raf = 0;
    const draw = () => {
      ctx.fillStyle = "#000a04";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `rgba(53,255,143,${Math.random() * 0.12})`;
        ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 40, 1);
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (flash?.code) {
        const fs = Math.min(30, (w - 24) / (flash.code.length * 0.62));
        ctx.font = `600 ${fs}px 'IBM Plex Mono', monospace`;
        ctx.fillStyle = "#35ff8f";
        ctx.shadowColor = "rgba(53,255,143,.7)";
        ctx.shadowBlur = 10;
        const off = (Math.random() - 0.5) * 6;
        ctx.fillText(flash.code, w / 2 + off, h / 2);
        ctx.shadowBlur = 0;
        const sy = Math.random() * h;
        const sh = 4 + Math.random() * 10;
        const slice = ctx.getImageData(0, sy * dpr, w * dpr, sh * dpr);
        ctx.putImageData(slice, (Math.random() - 0.5) * 24 * dpr, sy * dpr);
      } else {
        ctx.font = "13px 'IBM Plex Mono', monospace";
        ctx.fillStyle = "#2f7d4f";
        ctx.fillText(flash ? `round ${flash.round}/${flash.total}: type it in the shell` : "idle. run: trace", w / 2, h / 2);
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [flash]);
  return <canvas ref={ref} style={{ display: "block", width: "100%", height: "100%" }} />;
}

export function CodeView({ source }: { source: string }) {
  return (
    <pre
      style={{
        margin: 0,
        height: "100%",
        overflow: "auto",
        padding: "12px 14px",
        fontFamily: mono,
        fontSize: 12,
        lineHeight: 1.55,
        color: "#c9ffe0",
        whiteSpace: "pre",
        userSelect: "text",
      }}
    >
      {source}
    </pre>
  );
}

/** What a breach tool looks like from the blue side. */
export function Redacted({ label }: { label: string }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 16, textAlign: "center" }}>
      <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: 2, color: "var(--ac,#3b82f6)" }}>{label}</div>
      <div style={{ fontFamily: mono, fontSize: 13, color: "#5f6b85" }}>████████ ███ ██████</div>
      <div style={{ fontSize: 13.5, color: "#8a93a8", maxWidth: 260 }}>This tool only runs on the green side. Drag it back across the seam.</div>
    </div>
  );
}
