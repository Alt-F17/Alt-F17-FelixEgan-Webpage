import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SiteContent, TermLine } from "@/content/siteContent";

const mono = "'IBM Plex Mono',monospace";
const press = "'Press Start 2P'";

type RenderLine = { c: string; t: string; w: number; pre: boolean };
type GlyphCell = { ch: string; c: string; s: string };

/**
 * Footer + the hidden "breach" terminal easter egg.
 * Click the glitching copyright to trigger a circular corruption wave that
 * scrambles the page into a retro hacker terminal. Ported 1:1 from the design's
 * DCLogic component (openTerminal / initCorruption / bootTerminal / runCommand …).
 */
export function SiteFooter({ content }: { content: SiteContent }) {
  const { footer, terminal } = content;
  const colors = terminal.colors;
  const green = () =>
    getComputedStyle(document.documentElement).getPropertyValue("--green").trim() || "#35ff8f";

  const [footerGlitch, setFooterGlitch] = useState<GlyphCell[]>([]);
  const [footerHover, setFooterHover] = useState(false);
  const [corrupt, setCorrupt] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [booting, setBooting] = useState(false);
  const [transition, setTransition] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [lines, setLines] = useState<RenderLine[]>([]);
  const [input, setInput] = useState("");

  const M = useRef<any>({
    ivs: [],
    bootT: [],
    cmdHistory: [],
    histIdx: -1,
    footerHover: false,
    resolveStarted: false,
  }).current;

  const showPrompt = terminalOpen && !booting;

  // ---- helpers -----------------------------------------------------------
  const rootEl = () => document.querySelector(".fe-root") as HTMLElement | null;
  const col = (c?: string) => (c && colors[c]) || c || "#35ff8f";
  const bannerText = terminal.banner.join("\n");

  const expand = (l: TermLine): RenderLine => ({
    c: l.banner ? col(l.c) : col(l.c),
    t: l.banner ? bannerText : l.t ?? "",
    w: l.w ?? 400,
    pre: !!(l.pre || l.banner),
  });

  const scrollTerm = () =>
    requestAnimationFrame(() => {
      if (M.termBody) M.termBody.scrollTop = M.termBody.scrollHeight;
    });
  const focusInput = () =>
    setTimeout(() => {
      if (M.input) M.input.focus();
    }, 30);
  const push = (arr: RenderLine[]) => {
    setLines((s) => [...s, ...arr]);
    scrollTerm();
  };

  // ---- footer glitch -----------------------------------------------------
  useEffect(() => {
    const base = footer.copyright;
    const glyphs = "▓▒░#01<>/\\$%*".split("");
    const tick = () => {
      const gr = green();
      const rate = M.footerHover ? 0.26 : 0.09;
      const arr: GlyphCell[] = [];
      for (const ch of base) {
        if (ch === " ") {
          arr.push({ ch: " ", c: "#6b7590", s: "none" });
          continue;
        }
        if (Math.random() < rate) {
          const useGlyph = Math.random() < 0.5;
          arr.push({ ch: useGlyph ? glyphs[(Math.random() * glyphs.length) | 0] : ch, c: gr, s: "0 0 6px " + gr });
        } else {
          arr.push({ ch, c: Math.random() < 0.06 ? "#c9ffe0" : "#6b7590", s: "none" });
        }
      }
      setFooterGlitch(arr);
    };
    tick();
    const iv = window.setInterval(tick, 110);
    return () => window.clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [footer.copyright]);

  useEffect(() => {
    M.footerHover = footerHover;
  }, [footerHover, M]);

  // ---- global escape + cleanup ------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && terminalOpen && !resolving) exitSequence();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminalOpen, resolving]);

  useEffect(
    () => () => {
      (M.bootT || []).forEach(clearTimeout);
      clearTimeout(M.openT);
      clearTimeout(M.openT2);
      cancelAnimationFrame(M.corruptRaf);
      if (M.corruptResize) window.removeEventListener("resize", M.corruptResize);
      document.body.style.overflow = "";
    },
    [M]
  );

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
    const out: any[] = [];
    let node: Node | null;
    let count = 0;
    while ((node = walker.nextNode()) && count < 240) {
      const p = (node as any).parentElement as HTMLElement;
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

  // ---- terminal open / close --------------------------------------------
  const openTerminal = (ev?: React.MouseEvent) => {
    if (transition || terminalOpen) return;
    if (ev && typeof ev.clientX === "number") M.origin = { x: ev.clientX, y: ev.clientY };
    M.pendingMode = "in";
    document.body.style.overflow = "hidden";
    setTransition(true);
    setBooting(true);
    setCorrupt(true);
    setResolving(false);
    setLines([]);
    setInput("");
    M.histIdx = -1;
    applyShake(true);
    const tryStart = (n: number) => {
      if (M.corruptCanvas) initCorruption("in");
      else if (n < 12) setTimeout(() => tryStart(n + 1), 20);
    };
    setTimeout(() => tryStart(0), 20);
    M.openT = setTimeout(() => {
      applyShake(false);
      setTerminalOpen(true);
      bootTerminal();
      M.openT2 = setTimeout(() => {
        stopCorruption();
        resetContent();
        setCorrupt(false);
      }, 560);
    }, 1500);
  };

  const resolveExit = () => {
    if (M.resolveStarted) return;
    M.resolveStarted = true;
    M.pendingMode = "out";
    setResolving(true);
    setTerminalOpen(false);
    setCorrupt(true);
    setBooting(false);
    applyShake(true);
    const tryStart = (n: number) => {
      if (M.corruptCanvas) initCorruption("out");
      else if (n < 12) setTimeout(() => tryStart(n + 1), 20);
    };
    setTimeout(() => tryStart(0), 20);
    M.openT = setTimeout(() => {
      stopCorruption();
      applyShake(false);
      resetContent();
      document.body.style.overflow = "";
      M.resolveStarted = false;
      setCorrupt(false);
      setTransition(false);
      setResolving(false);
      setLines([]);
      setInput("");
      M.histIdx = -1;
    }, 1300);
  };

  // ---- commands ----------------------------------------------------------
  const contentFor = (cmd: string): TermLine[] | undefined => {
    if (cmd === "banner") return [{ c: colors.ok, w: 700, pre: true, banner: true }];
    return terminal.commands[cmd];
  };

  const bootTerminal = () => {
    M.bootT = [];
    const q = (line: RenderLine, d: number) => M.bootT.push(setTimeout(() => push([line]), d));
    let d = 240;
    terminal.boot.forEach((l) => {
      q(expand(l), d);
      d += l.pre || l.banner ? 300 : l.t === "" || l.t === undefined ? 60 : 135;
    });
    M.bootT.push(
      setTimeout(() => {
        setBooting(false);
        runCommand(terminal.autoRun, true);
        focusInput();
      }, d + 100)
    );
  };

  const runCommand = (raw: string, auto: boolean) => {
    const cmd = (raw || "").trim();
    const C = colors;
    const out: RenderLine[] = [];
    if (!auto) out.push({ c: "#eaffef", t: terminal.prompt + " " + cmd, w: 400, pre: false });
    const base = cmd.split(/\s+/)[0];
    const arg = cmd.split(/\s+/)[1];
    if (cmd === "") {
      setInput("");
      push(out);
      return;
    }
    if (base === "clear") {
      setLines([]);
      setInput("");
      return;
    }
    if (["exit", "quit", "q", "logout"].includes(base)) {
      exitSequence();
      return;
    }
    let body = contentFor(cmd);
    if (!body && base === "cat") {
      body = arg
        ? [
            { c: C.err, t: "cat: " + arg + ": permission denied" },
            { c: C.dim, t: "hint: try 'cat about.txt' or 'cat contact.txt'" },
          ]
        : [{ c: C.err, t: "cat: missing operand — e.g. cat about.txt" }];
    }
    if (!body && contentFor(base)) body = contentFor(base);
    if (!body) {
      if (base === "sudo") body = [{ c: C.warn, t: "nice try — you're already root. 😏" }];
      else if (base === "rm") body = [{ c: C.err, t: "rm: nope. this machine is a museum piece now." }];
      else if (base === "ls" && arg) body = contentFor("ls");
      else if (["help", "man"].includes(base)) body = contentFor("help");
      else
        body = [
          { c: C.err, t: "command not found: " + base },
          { c: C.dim, t: "type 'help' for the list of commands" },
        ];
    }
    const expanded = (body || []).map(expand);
    setLines((s) => [...s, ...out, ...expanded, { c: "#5f6b85", t: "", w: 400, pre: false }]);
    setInput("");
    scrollTerm();
  };

  const exitSequence = () => {
    if (resolving || M.resolveStarted) return;
    push([
      { c: "#eaffef", t: terminal.prompt + " exit", w: 400, pre: false },
      { c: colors.warn, t: "logout — resolving session …  [████████████]", w: 400, pre: false },
    ]);
    const t = setTimeout(() => resolveExit(), 620);
    M.bootT = (M.bootT || []).concat([t]);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const v = input;
      if (v.trim()) M.cmdHistory = [...(M.cmdHistory || []), v.trim()];
      M.histIdx = -1;
      runCommand(v, false);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const hh = M.cmdHistory || [];
      if (!hh.length) return;
      const i = M.histIdx < 0 ? hh.length - 1 : Math.max(0, M.histIdx - 1);
      M.histIdx = i;
      setInput(hh[i]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const hh = M.cmdHistory || [];
      if (M.histIdx < 0) return;
      const i = M.histIdx + 1;
      if (i >= hh.length) {
        M.histIdx = -1;
        setInput("");
      } else {
        M.histIdx = i;
        setInput(hh[i]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const m = terminal.completions.find((c) => c.startsWith(input.trim()));
      if (m) setInput(m);
    }
  };

  // ---- render ------------------------------------------------------------
  return (
    <>
      <footer style={{ position: "relative", borderTop: "1px solid rgba(59,130,246,.14)", padding: "34px clamp(18px,5vw,56px) 46px" }}>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 30,
                border: "2px solid var(--ac,#3b82f6)",
                fontFamily: press,
                fontSize: 8,
                color: "var(--ac,#3b82f6)",
              }}
            >
              {content.nav.logo}
            </span>
            <div
              onClick={(e) => openTerminal(e)}
              onMouseEnter={() => setFooterHover(true)}
              onMouseLeave={() => setFooterHover(false)}
              style={{ cursor: "pointer", userSelect: "none", lineHeight: 1.55 }}
              title="root@alt-f17"
            >
              <div style={{ fontFamily: mono, fontSize: 13, letterSpacing: 0, lineHeight: 1.5, display: "flex" }}>
                {footerGlitch.map((g, i) => (
                  <span key={i} style={{ display: "inline-block", width: ".62em", textAlign: "center", color: g.c, textShadow: g.s }}>
                    {g.ch}
                  </span>
                ))}
              </div>
              <div style={{ fontFamily: mono, fontSize: 12.5, color: "#4a5470", marginTop: 2 }}>{footer.tagline}</div>
            </div>
          </div>
          <div style={{ fontFamily: mono, fontSize: 12, color: "#4a5470", textAlign: "right" }}>
            {footer.metaLines.map((m, i) => (
              <div key={i} style={i === 0 ? undefined : { marginTop: 4, color: "#3a4258" }}>
                {m}
              </div>
            ))}
          </div>
        </div>
      </footer>

      {corrupt &&
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

      {terminalOpen &&
        createPortal(
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
            onClick={() => exitSequence()}
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

          <div
            className="term-scroll"
            ref={(el) => {
              M.termBody = el;
            }}
            onClick={() => focusInput()}
            style={{ position: "absolute", inset: 0, zIndex: 2, overflowY: "auto", padding: "36px clamp(14px,4vw,44px) 40px", cursor: "text" }}
          >
            <div
              style={{
                maxWidth: 1020,
                margin: "0 auto",
                fontFamily: mono,
                fontSize: "clamp(12px,1.5vw,14.5px)",
                lineHeight: 1.62,
                textShadow: "0 0 7px rgba(53,255,143,.35)",
              }}
            >
              {lines.map((ln, i) => (
                <div key={i} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", color: ln.c, fontWeight: ln.w }}>
                  {ln.t}
                </div>
              ))}
              {showPrompt && (
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 4 }}>
                  <span style={{ color: "#7cffb0", whiteSpace: "nowrap" }}>
                    root@alt-f17<span style={{ color: "#2f7d4f" }}>:</span>
                    <span style={{ color: "#c9ffe0" }}>~</span>
                    <span style={{ color: "#2f7d4f" }}>#</span>
                  </span>
                  <input
                    className="term-in"
                    ref={(el) => {
                      M.input = el;
                    }}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="type a command…"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: "transparent",
                      border: 0,
                      outline: 0,
                      color: "var(--green,#35ff8f)",
                      fontFamily: mono,
                      fontSize: "inherit",
                      textShadow: "inherit",
                      padding: "2px 0",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>,
          document.body
        )}
    </>
  );
}
