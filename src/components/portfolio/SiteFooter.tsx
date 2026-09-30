import { useEffect, useRef, useState } from "react";
import type { SiteContent, TermLine } from "@/content/siteContent";
import { useCorruption } from "./useCorruption";
import { useGlitchText } from "./useGlitchText";
import { CrtScreen } from "./CrtScreen";

const mono = "'IBM Plex Mono',monospace";
const press = "'Press Start 2P'";

type RenderLine = { c: string; t: string; w: number; pre: boolean };

/**
 * Footer + the hidden "breach" terminal easter egg.
 * Click the glitching copyright to trigger a circular corruption wave that
 * scrambles the page into a retro hacker terminal. Ported 1:1 from the design's
 * DCLogic component (openTerminal / bootTerminal / runCommand …). The wave, the CRT
 * screen and the glitch text live in shared modules so the 404 page can reuse them.
 */
export function SiteFooter({ content }: { content: SiteContent }) {
  const { footer, terminal } = content;
  const colors = terminal.colors;
  const fx = useCorruption();
  const { cells: footerGlitch, setHover: setFooterHover } = useGlitchText(footer.copyright, "#6b7590");
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
    resolveStarted: false,
  }).current;

  const showPrompt = terminalOpen && !booting;

  // ---- helpers -----------------------------------------------------------
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
    },
    [M]
  );

  // ---- terminal open / close --------------------------------------------
  const openTerminal = (ev?: React.MouseEvent) => {
    if (transition || terminalOpen) return;
    setTransition(true);
    setBooting(true);
    setResolving(false);
    setLines([]);
    setInput("");
    M.histIdx = -1;
    const origin = ev && typeof ev.clientX === "number" ? { x: ev.clientX, y: ev.clientY } : undefined;
    fx.enter(origin, () => {
      setTerminalOpen(true);
      bootTerminal();
    });
  };

  const resolveExit = () => {
    if (M.resolveStarted) return;
    M.resolveStarted = true;
    setResolving(true);
    setTerminalOpen(false);
    setBooting(false);
    fx.leave(() => {
      M.resolveStarted = false;
      setTransition(false);
      setResolving(false);
      setLines([]);
      setInput("");
      M.histIdx = -1;
    });
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

      {fx.overlay}

      {terminalOpen && (
        <CrtScreen onExit={() => exitSequence()}>
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
        </CrtScreen>
      )}
    </>
  );
}
