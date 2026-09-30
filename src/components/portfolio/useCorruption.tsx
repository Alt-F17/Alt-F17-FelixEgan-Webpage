import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * The circular corruption wave that scrambles the page into the terminal (and
 * back). Shared by the footer easter egg and the 404 page, so both breaches look
 * identical. Extracted verbatim from SiteFooter.
 *
 * enter(origin, onCovered): wave in from origin; onCovered fires once the screen
 * is black, then the wave cleans itself up. leave(onDone): wave back out.
 */
type Target = { node: Node; text: string | null; p: HTMLElement; cx: number; cy: number; color: string; shadow: string; phase: number };

type WaveState = {
  targets: Target[] | null;
  origin?: { x: number; y: number };
  pendingMode?: "in" | "out";
  corruptCanvas?: HTMLCanvasElement | null;
  corruptRaf?: number;
  corruptResize?: (() => void) | null;
  openT?: ReturnType<typeof setTimeout>;
  openT2?: ReturnType<typeof setTimeout>;
};

export function useCorruption() {
  const [active, setActive] = useState(false);
  const M = useRef<WaveState>({ targets: null }).current;

  const rootEl = () => document.querySelector(".fe-root") as HTMLElement | null;
  const green = () =>
    getComputedStyle(document.documentElement).getPropertyValue("--green").trim() || "#35ff8f";

  // ---- shake / filters ---------------------------------------------------
  // Shake main+nav (NOT the .fe-root wrapper): a transform on .fe-root would make it
  // the containing block for the fixed corruption/terminal overlays and clip them.
  const applyShake = (on: boolean) => {
    const r = rootEl();
    if (!r) return;
    [r.querySelector("main"), r.querySelector("nav")].forEach((el) => {
      if (el) (el as HTMLElement).style.animation = on ? "fe-meltshake .32s steps(2) infinite" : "";
    });
  };
  const resetContent = () => {
    const r = rootEl();
    if (!r) return;
    [r.querySelector("main"), r.querySelector("nav")].forEach((el) => {
      if (el) {
        (el as HTMLElement).style.filter = "";
        (el as HTMLElement).style.transition = "";
        (el as HTMLElement).style.animation = "";
      }
    });
    r.style.animation = "";
  };

  // ---- corruption wave ---------------------------------------------------
  const SCRAMBLE = "!<>-_\\/[]{}=+*#01ABCDEF$%&@?▓▒░".split("");
  const scrambleStr = (text: string) => {
    let o = "";
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      o += ch === " " || ch === "\n" || ch === "\t" ? ch : SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0];
    }
    return o;
  };
  const collectTargets = () => {
    const r = rootEl();
    if (!r) {
      M.targets = [];
      return;
    }
    const vh = window.innerHeight;
    const walker = document.createTreeWalker(r, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = n.parentElement;
        if (!p || !p.closest("main, nav")) return NodeFilter.FILTER_REJECT;
        if (p.tagName === "SCRIPT" || p.tagName === "STYLE") return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const out: Target[] = [];
    let node: Node | null;
    let count = 0;
    while ((node = walker.nextNode()) && count < 240) {
      const p = node.parentElement as HTMLElement;
      const range = document.createRange();
      range.selectNodeContents(node);
      const rect = range.getBoundingClientRect();
      if ((rect.width === 0 && rect.height === 0) || rect.bottom < -90 || rect.top > vh + 90) continue;
      out.push({
        node,
        text: node.nodeValue,
        p,
        cx: rect.left + rect.width / 2,
        cy: rect.top + rect.height / 2,
        color: p.style.color,
        shadow: p.style.textShadow,
        phase: -1,
      });
      count++;
    }
    M.targets = out;
  };
  const updateTextWave = (front: number, band: number, gr: string, O: { x: number; y: number }) => {
    const T = M.targets;
    if (!T) return;
    for (let i = 0; i < T.length; i++) {
      const t = T[i];
      const local = (front - Math.hypot(t.cx - O.x, t.cy - O.y)) / band;
      if (local <= 0.02) {
        if (t.phase !== 0) {
          t.node.nodeValue = t.text;
          t.p.style.color = t.color;
          t.p.style.textShadow = t.shadow;
          t.phase = 0;
        }
      } else if (local < 1) {
        t.node.nodeValue = scrambleStr(t.text);
        t.p.style.color = gr;
        t.p.style.textShadow = "0 0 6px " + gr;
        t.phase = 1;
      } else if (t.phase !== 2) {
        t.node.nodeValue = scrambleStr(t.text);
        t.p.style.color = gr;
        t.p.style.textShadow = "0 0 5px " + gr;
        t.phase = 2;
      }
    }
  };
  const restoreTargets = () => {
    const T = M.targets;
    if (!T) return;
    for (const t of T) {
      t.node.nodeValue = t.text;
      t.p.style.color = t.color;
      t.p.style.textShadow = t.shadow;
    }
    M.targets = null;
  };
  const stopCorruption = () => {
    cancelAnimationFrame(M.corruptRaf);
    if (M.corruptResize) {
      window.removeEventListener("resize", M.corruptResize);
      M.corruptResize = null;
    }
    restoreTargets();
  };
  const initCorruption = (mode: "in" | "out") => {
    const c = M.corruptCanvas as HTMLCanvasElement | undefined;
    if (!c) return;
    cancelAnimationFrame(M.corruptRaf);
    const ctx = c.getContext("2d")!;
    let w = 0;
    let h = 0;
    const resize = () => {
      w = c.width = window.innerWidth;
      h = c.height = window.innerHeight;
    };
    resize();
    if (M.corruptResize) window.removeEventListener("resize", M.corruptResize);
    M.corruptResize = resize;
    window.addEventListener("resize", resize);
    const O = M.origin || { x: w * 0.5, y: h * 0.62 };
    collectTargets();
    let maxR = 0;
    [[0, 0], [w, 0], [0, h], [w, h]].forEach(([x, y]) => {
      const d = Math.hypot(x - O.x, y - O.y);
      if (d > maxR) maxR = d;
    });
    const band = Math.max(140, maxR * 0.32);
    const reach = maxR + band;
    const chars = "01<>/\\|#$%*+=:;[]{}!?ABCDEF".split("");
    const glyphs = "█▓▒░▚▞▙▟▛▜".split("");
    const cell = 13;
    const cols = Math.ceil(w / cell);
    const rows = Math.ceil(h / cell);
    const gc = () => green();
    const r = rootEl();
    const site = r ? [r.querySelector("main"), r.querySelector("nav")].filter(Boolean) : [];
    const DUR = mode === "in" ? 1500 : 1300;
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const start = performance.now();
    const loop = () => {
      const raw = Math.min(1, (performance.now() - start) / DUR);
      const e = ease(raw);
      const prog = mode === "in" ? e : 1 - e;
      const front = prog * reach;
      const gr = gc();
      updateTextWave(front, band, gr, O);
      const gVal = prog;
      site.forEach((el) => {
        (el as HTMLElement).style.filter = "contrast(" + (1 + gVal * 0.35) + ") brightness(" + (1 - gVal * 0.16) + ")";
      });
      ctx.clearRect(0, 0, w, h);
      for (let ri = 0; ri < rows; ri++) {
        const y = ri * cell;
        const cy = y + cell / 2;
        for (let ci = 0; ci < cols; ci++) {
          const x = ci * cell;
          const cx = x + cell / 2;
          const d = Math.hypot(cx - O.x, cy - O.y);
          const local = (front - d) / band;
          if (local <= 0.02) continue;
          if (local >= 1) {
            ctx.fillStyle = "#000107";
            ctx.globalAlpha = 1;
            ctx.fillRect(x, y, cell, cell);
            if (Math.random() < 0.045) {
              ctx.fillStyle = gr;
              ctx.globalAlpha = 0.15 + Math.random() * 0.3;
              ctx.fillRect(x + ((Math.random() * cell) | 0), y + ((Math.random() * cell) | 0), 2, 2);
            }
            ctx.globalAlpha = 1;
          } else {
            const roll = Math.random();
            if (roll < 0.11) {
              ctx.fillStyle = gr;
              ctx.globalAlpha = 0.24 + Math.random() * 0.4;
              ctx.font = cell + "px 'IBM Plex Mono',monospace";
              const pool = Math.random() < 0.42 ? glyphs : chars;
              ctx.fillText(pool[(Math.random() * pool.length) | 0], x, y + cell - 1);
            } else if (roll < 0.2) {
              ctx.fillStyle = gr;
              ctx.globalAlpha = 0.14 + Math.random() * 0.3;
              ctx.fillRect(x + ((Math.random() * cell) | 0), y + ((Math.random() * cell) | 0), 2, 2);
            } else if (roll < 0.26) {
              ctx.fillStyle = "#000107";
              ctx.globalAlpha = 0.22 + Math.random() * 0.3;
              ctx.fillRect(x, y, cell, cell);
            }
            ctx.globalAlpha = 1;
          }
        }
      }
      if (front > 4 && front < reach * 0.98) {
        ctx.strokeStyle = gr;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 20;
        ctx.shadowColor = gr;
        ctx.beginPath();
        ctx.arc(O.x, O.y, front, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
      if (raw < 1) M.corruptRaf = requestAnimationFrame(loop);
      else if (mode === "in") {
        ctx.fillStyle = "#000107";
        ctx.globalAlpha = 1;
        ctx.fillRect(0, 0, w, h);
        M.corruptRaf = requestAnimationFrame(loop);
      }
    };
    loop();
  };

  const kick = (mode: "in" | "out") => {
    const tryStart = (n: number) => {
      if (M.corruptCanvas) initCorruption(mode);
      else if (n < 12) setTimeout(() => tryStart(n + 1), 20);
    };
    setTimeout(() => tryStart(0), 20);
  };

  const enter = (origin: { x: number; y: number } | undefined, onCovered: () => void) => {
    if (origin) M.origin = origin;
    M.pendingMode = "in";
    document.body.style.overflow = "hidden";
    setActive(true);
    applyShake(true);
    kick("in");
    M.openT = setTimeout(() => {
      applyShake(false);
      onCovered();
      M.openT2 = setTimeout(() => {
        stopCorruption();
        resetContent();
        setActive(false);
      }, 560);
    }, 1500);
  };

  const leave = (onDone: () => void) => {
    M.pendingMode = "out";
    setActive(true);
    applyShake(true);
    kick("out");
    M.openT = setTimeout(() => {
      stopCorruption();
      applyShake(false);
      resetContent();
      document.body.style.overflow = "";
      setActive(false);
      onDone();
    }, 1300);
  };

  useEffect(
    () => () => {
      clearTimeout(M.openT);
      clearTimeout(M.openT2);
      cancelAnimationFrame(M.corruptRaf);
      if (M.corruptResize) window.removeEventListener("resize", M.corruptResize);
      document.body.style.overflow = "";
    },
    [M]
  );

  const overlay = (
    <>
      {active &&
        createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 2147483000, pointerEvents: "none", overflow: "hidden" }}>
          <canvas
            ref={(el) => {
              M.corruptCanvas = el;
              // On exit, paint the canvas fully black the instant it mounts so the
              // page never flashes through before the "out" wave starts drawing.
              if (el && M.pendingMode === "out") {
                el.width = window.innerWidth;
                el.height = window.innerHeight;
                const cx = el.getContext("2d");
                if (cx) {
                  cx.fillStyle = "#000107";
                  cx.fillRect(0, 0, el.width, el.height);
                }
              }
            }}
            style={{ position: "absolute", inset: 0, width: "100vw", height: "100vh" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "repeating-linear-gradient(0deg,rgba(0,0,0,0) 0,rgba(0,0,0,0) 2px,rgba(0,25,10,.35) 3px,rgba(0,0,0,0) 4px)",
              mixBlendMode: "overlay",
            }}
          />
        </div>,
          document.body
        )}

    </>
  );

  return { enter, leave, overlay };
}
