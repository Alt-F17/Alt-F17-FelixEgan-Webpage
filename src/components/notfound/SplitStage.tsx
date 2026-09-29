import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { SiteContent } from "@/content/siteContent";
import { Starfield } from "@/components/portfolio/Starfield";
import { SiteNav } from "@/components/portfolio/SiteNav";
import { useLanguage } from "@/i18n/LanguageProvider";
import { portfolioCopy } from "@/content/portfolioCopy";
import { FloatWindow, type Skin } from "./FloatWindow";
import { BreachShell } from "./BreachShell";
import { CipherWheel, CodeView, FlashCanvas, MorseStar, Redacted, type Flash } from "./widgets";
import { winStore } from "./winStore";
import { clip, defaultSeam, layout, normal, polygonCss, widgetRect, type Pt, type Rect, type Seam, type WinId } from "./geometry";
import { LEAKED_SOURCE, LEVELS, PAYLOAD, SESSION_KEY, VALIDATOR_SOURCE, guestSession, unmask, type LevelWidget } from "./breach/levels";
import { fmtDuration, useProgress } from "./breach/progress";
import "./notfound.css";

const mono = "'IBM Plex Mono',monospace";
const press = "'Press Start 2P'";

const ASCII_404 = [
  "██╗  ██╗ ██████╗ ██╗  ██╗",
  "██║  ██║██╔═████╗██║  ██║",
  "███████║██║██╔██║███████║",
  "╚════██║████╔╝██║╚════██║",
  "     ██║╚██████╔╝     ██║",
  "     ╚═╝ ╚═════╝      ╚═╝",
].join("\n");

const WIDGET_WIN: Record<LevelWidget, "cipher" | "leak" | "flash" | "validator"> = {
  cipher: "cipher",
  leak: "leak",
  trace: "flash",
  validator: "validator",
};

const GLYPHS = "!<>-_\\/[]{}=+*#01ABCDEF$%&@?▓▒░".split("");
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function SeamGlyphs({ seg, n }: { seg: Pt[]; n: Pt }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const iv = window.setInterval(() => setTick((t) => t + 1), reducedMotion() ? 900 : 110);
    return () => window.clearInterval(iv);
  }, []);
  if (seg.length < 2) return null;
  const [a, b] = seg;
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const count = Math.floor(len / 30);
  const out = [];
  for (let i = 1; i < count; i++) {
    const t = i / count;
    const side = (i % 2 ? 1 : -1) * (7 + ((i * 7 + tick) % 5));
    out.push(
      <text
        key={i}
        x={a.x + (b.x - a.x) * t + n.x * side}
        y={a.y + (b.y - a.y) * t + n.y * side}
        fill={side > 0 ? "#35ff8f" : "#7cb3ff"}
        opacity={0.35 + ((i + tick) % 4) * 0.12}
        fontSize={11}
        fontFamily="IBM Plex Mono, monospace"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {GLYPHS[(i * 13 + tick * 7) % GLYPHS.length]}
      </text>,
    );
  }
  return <>{out}</>;
}

export function SplitStage({ content }: { content: SiteContent }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { locale } = useLanguage();
  const t = portfolioCopy.notFound;
  const [vp, setVp] = useState(() => ({ W: window.innerWidth, H: window.innerHeight }));
  const lay = useMemo(() => layout(vp.W, vp.H), [vp.W, vp.H]);
  const [seam, setSeam] = useState<Seam>(() => defaultSeam(vp.W, vp.H));
  const { progress, start, advance, reset } = useProgress();
  const [flash, setFlash] = useState<Flash>(null);
  const [ending, setEnding] = useState(false);
  const started = progress.startedAt !== null;
  const level = LEVELS[progress.level - 1];
  const widget = started && level?.widget ? WIDGET_WIN[level.widget] : null;

  useState(() => winStore.reset(layout(window.innerWidth, window.innerHeight).wins as Record<string, Rect>));

  const lastW = useRef(vp.W);
  useEffect(() => {
    let t = 0;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        const W = window.innerWidth;
        const H = window.innerHeight;
        setVp({ W, H });
        // height-only changes (mobile keyboard, URL bar) keep the arrangement
        if (W !== lastW.current) {
          lastW.current = W;
          winStore.reset(layout(W, H).wins as Record<string, Rect>);
          setSeam(defaultSeam(W, H));
        }
      }, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
    };
  }, []);

  // open the current level's tool window
  useEffect(() => {
    if (widget && !winStore.get(widget)) winStore.set(widget, widgetRect(vp.W, vp.H, seam, widget));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widget]);

  // level 8 needs a guest session to forge from
  useEffect(() => {
    if (!started || level?.n !== 8) return;
    try {
      if (!localStorage.getItem(SESSION_KEY)) localStorage.setItem(SESSION_KEY, guestSession());
    } catch {
      /* storage blocked */
    }
  }, [started, level?.n]);

  const tidy = useCallback(() => {
    const rects = { ...(layout(vp.W, vp.H).wins as Record<string, Rect>) };
    if (widget) rects[widget] = widgetRect(vp.W, vp.H, seam, widget);
    winStore.reset(rects);
  }, [vp.W, vp.H, seam, widget]);
  const seamReset = useCallback(() => setSeam(defaultSeam(vp.W, vp.H)), [vp.W, vp.H]);

  const { poly, seg } = clip(vp.W, vp.H, seam);
  const n = normal(seam);
  const mid: Pt | null = seg.length === 2 ? { x: (seg[0].x + seg[1].x) / 2, y: (seg[0].y + seg[1].y) / 2 } : null;
  const knob: Pt | null = (() => {
    if (!mid) return null;
    const d = { x: Math.cos(seam.angle), y: Math.sin(seam.angle) };
    for (const k of [70, -70]) {
      const p = { x: mid.x + d.x * k, y: mid.y + d.y * k };
      if (p.x > 16 && p.x < vp.W - 16 && p.y > 16 && p.y < vp.H - 16) return p;
    }
    return null;
  })();
  const maxOffset = Math.hypot(vp.W, vp.H) / 2 - 24;
  const clampOffset = (o: number) => Math.max(-maxOffset, Math.min(maxOffset, o));

  const dragSeam = (e: React.PointerEvent) => {
    e.preventDefault();
    const el = e.currentTarget as Element;
    el.setPointerCapture(e.pointerId);
    const x0 = e.clientX;
    const y0 = e.clientY;
    const s0 = seam;
    const n0 = normal(s0);
    const move = (ev: PointerEvent) => {
      const o = s0.offset + (ev.clientX - x0) * n0.x + (ev.clientY - y0) * n0.y;
      setSeam({ angle: s0.angle, offset: clampOffset(o) });
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

  const rotateSeam = (e: React.PointerEvent) => {
    if (!mid) return;
    e.preventDefault();
    const el = e.currentTarget as Element;
    el.setPointerCapture(e.pointerId);
    const pivot = mid;
    const a0 = Math.atan2(e.clientY - pivot.y, e.clientX - pivot.x);
    const s0 = seam;
    const move = (ev: PointerEvent) => {
      const angle = s0.angle + Math.atan2(ev.clientY - pivot.y, ev.clientX - pivot.x) - a0;
      const nn = { x: Math.sin(angle), y: -Math.cos(angle) };
      const offset = (pivot.x - vp.W / 2) * nn.x + (pivot.y - vp.H / 2) * nn.y;
      setSeam({ angle, offset: clampOffset(offset) });
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

  const onHandleKey = (e: React.KeyboardEvent) => {
    const k = e.key;
    if (k === "Enter" || k === "Home") {
      seamReset();
      return;
    }
    const dir = k === "ArrowRight" || k === "ArrowDown" ? 1 : k === "ArrowLeft" || k === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    if (e.shiftKey) setSeam((s) => ({ ...s, angle: s.angle + (dir * 4 * Math.PI) / 180 }));
    else setSeam((s) => ({ ...s, offset: clampOffset(s.offset + dir * 18) }));
  };

  const behindKey = useMemo(() => unmask(PAYLOAD.behind), []);
  const otherSideKey = useMemo(() => unmask(PAYLOAD.otherSide), []);

  const go = (path: string) => navigate(path);

  const shellApi = {
    progress,
    start,
    advance,
    reset,
    tidy,
    seamReset,
    navigate: go,
    setFlash,
    win: () => setEnding(true),
  };

  const windows = (skin: Skin) => {
    const term = skin === "term";
    const has = (id: WinId) => !!lay.wins[id];
    return (
      <>
        {has("w404") && (
          <FloatWindow id="w404" skin={skin} title={term ? "404.log" : "error"}>
            {term ? (
              <div style={{ padding: "12px 16px", fontFamily: mono }}>
                <pre style={{ margin: 0, fontSize: lay.mobile ? 8.5 : 11, lineHeight: 1.12, color: "#35ff8f" }}>{ASCII_404}</pre>
                <div style={{ marginTop: 12, fontSize: 12.5, color: "#ff5f57", wordBreak: "break-all" }}>ERR_ROUTE_NOT_FOUND {pathname}</div>
                <div style={{ marginTop: 6, fontSize: 12, color: "#2f7d4f" }}>{lay.mobile ? "type 'breach' in the shell below" : "type 'breach' in the shell"}</div>
              </div>
            ) : (
              <div style={{ padding: lay.mobile ? "12px 16px" : "16px 22px", display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ fontFamily: mono, fontSize: 11.5, letterSpacing: 2, color: "#5f6b85", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  GET {pathname}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                  <span style={{ fontSize: lay.mobile ? 54 : 76, fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1, color: "#fff" }}>404</span>
                  <span style={{ fontFamily: mono, fontSize: 13, color: "var(--ac,#3b82f6)" }}>{t.title[locale]}</span>
                </div>
                <p style={{ margin: "8px 0 0", fontSize: lay.mobile ? 13 : 14.5, lineHeight: 1.5, color: "#9aa3b8" }}>{t.body[locale]}</p>
                <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
                  <Link to="/" className="fe404-sitebtn fe404-sitebtn-primary">
                    {t.home[locale]}
                  </Link>
                  <Link to="/projects" className="fe404-sitebtn">
                    {t.projects[locale]}
                  </Link>
                </div>
              </div>
            )}
          </FloatWindow>
        )}

        {has("whoami") && (
          <FloatWindow id="whoami" skin={skin} title={term ? "whoami.txt" : "whoami"}>
            {term ? (
              <div style={{ padding: "12px 16px", fontSize: 12.5, lineHeight: 1.65, fontFamily: mono }}>
                {(content.terminal.commands.whoami ?? []).map((l, i) => (
                  <div key={i} style={{ color: content.terminal.colors[l.c ?? "val"] ?? "#c9ffe0" }}>
                    {l.t}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "14px 18px" }}>
                <div style={{ fontSize: 21, fontWeight: 700, color: "#fff" }}>{content.hero.name}</div>
                <div style={{ fontFamily: mono, fontSize: 12.5, color: "var(--acb,#7cb3ff)", margin: "4px 0 12px" }}>{content.hero.role}</div>
                {content.about.profile.fields.slice(0, 3).map((f) => (
                  <div key={f.label} style={{ display: "flex", gap: 10, fontSize: 13, lineHeight: 1.7 }}>
                    <span style={{ fontFamily: mono, fontSize: 11, color: "var(--ac,#3b82f6)", textTransform: "uppercase", width: 96, flex: "none", paddingTop: 2 }}>{f.label}</span>
                    <span style={{ color: "#c4ccdd" }}>{f.value}</span>
                  </div>
                ))}
              </div>
            )}
          </FloatWindow>
        )}

        {has("trace") && (
          <FloatWindow id="trace" skin={skin} title={term ? "trace.log" : "request"}>
            {term ? (
              <pre style={{ margin: 0, padding: "10px 14px", fontFamily: mono, fontSize: 11.5, lineHeight: 1.6, color: "#c9ffe0", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                <span style={{ color: "#ff5f57" }}>RouteNotFoundError</span>: no route matches "{pathname}"{"\n"}
                {"    "}at Router.resolve (router.ts:404){"\n"}
                {"    "}at felixegan.me (breach.ts:17){"\n"}
                {"    "}at you (curiosity.js:1)
              </pre>
            ) : (
              <div style={{ padding: "12px 16px", fontFamily: mono, fontSize: 12.5, lineHeight: 1.7 }}>
                <div style={{ color: "#aeb6c9", wordBreak: "break-all" }}>
                  <span style={{ color: "var(--ac,#3b82f6)" }}>GET</span> {pathname}
                </div>
                <div style={{ color: "#fff" }}>
                  status <span style={{ color: "#ffb454" }}>404 Not Found</span>
                </div>
                <div style={{ color: "#5f6b85" }}>{t.trace[locale]}</div>
              </div>
            )}
          </FloatWindow>
        )}

        {has("nav") && (
          <FloatWindow id="nav" skin={skin} title={term ? "routes" : "navigate"}>
            {term ? (
              <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 7, fontSize: 13 }}>
                {[
                  ["cd ~", "/"],
                  ["cd ~/projects", "/projects"],
                  ["cd ~/studio", "/studio"],
                  ["open ~/paste", "/paste"],
                ].map(([label, to]) => (
                  <button key={to} className="fe404-termlink" onClick={() => go(to)}>
                    <span style={{ color: "#2f7d4f" }}>$ </span>
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  [t.home[locale], "/"],
                  [t.projects[locale], "/projects"],
                  ["Studio ↗", "/studio"],
                ].map(([label, to]) => (
                  <Link key={to} to={to} className="fe404-sitebtn" style={{ padding: "8px 12px" }}>
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </FloatWindow>
        )}

        {has("shell") && (
          <FloatWindow id="shell" skin={skin} title={term ? "root@alt-f17: ~" : "shell"}>
            {term ? (
              <BreachShell content={content} api={shellApi} mobile={lay.mobile} />
            ) : (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 20, textAlign: "center" }}>
                <div style={{ fontFamily: press, fontSize: 10, color: "var(--ac,#3b82f6)" }}>NO SIGNAL</div>
                <div style={{ fontSize: 14, color: "#8a93a8", maxWidth: 300 }}>{t.shellLost[locale]}</div>
              </div>
            )}
          </FloatWindow>
        )}

        {widget === "cipher" && (
          <FloatWindow id="cipher" skin={skin} title="dial">
            {term ? <CipherWheel /> : <Redacted label="// CIPHER" />}
          </FloatWindow>
        )}
        {widget === "leak" && (
          <FloatWindow id="leak" skin={skin} title="leaked: auth/session.js">
            {term ? <CodeView source={LEAKED_SOURCE} /> : <Redacted label="// LEAK" />}
          </FloatWindow>
        )}
        {widget === "flash" && (
          <FloatWindow id="flash" skin={skin} title="trace" className={flash?.code ? "fe404-jitter" : undefined}>
            {term ? <FlashCanvas flash={flash} /> : <Redacted label="// TRACE" />}
          </FloatWindow>
        )}
        {widget === "validator" && (
          <FloatWindow id="validator" skin={skin} title="v(s)">
            {term ? <CodeView source={VALIDATOR_SOURCE} /> : <Redacted label="// VALIDATOR" />}
          </FloatWindow>
        )}
      </>
    );
  };

  return (
    <div className="fe404">
      {/* SITE HALF */}
      <div className="fe404-layer" style={{ zIndex: 1 }}>
        <Starfield theme={content.theme} />
        <SiteNav nav={content.nav} home={false} />
        <span
          aria-hidden
          style={{ position: "absolute", left: lay.behindKey.x, top: lay.behindKey.y, transform: "translate(-50%,-50%)", zIndex: 5, fontFamily: mono, fontSize: 14, color: "#7cb3ff", whiteSpace: "nowrap" }}
        >
          {behindKey}
        </span>
        <div
          aria-hidden
          style={{ position: "absolute", left: lay.otherSideKey.x, top: lay.otherSideKey.y, transform: "translate(-50%,-50%)", zIndex: 5, textAlign: "center", whiteSpace: "nowrap" }}
        >
          <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: 2, color: "#5f6b85" }}>// WRITTEN ON THE BLUE SIDE</div>
          <div style={{ fontFamily: mono, fontSize: 15, color: "#fff", textShadow: "0 0 14px rgba(59,130,246,.8)" }}>{otherSideKey}</div>
        </div>
        <MorseStar x={lay.morseStar.x} y={lay.morseStar.y} active={started && level?.n === 6} />
        {windows("site")}
      </div>

      {/* TERMINAL HALF */}
      <div className="fe404-layer fe404-term" style={{ clipPath: polygonCss(poly), WebkitClipPath: polygonCss(poly) }}>
        <div className="fe404-term-grid" />
        {!lay.mobile && (
          <div className="fe404-termbar">
            {[
              ["~", "/"],
              ["projects", "/projects"],
              ["studio", "/studio"],
            ].map(([l, to]) => (
              <button key={to} className="fe404-termlink" onClick={() => go(to)}>
                [ {l} ]
              </button>
            ))}
            <button className="fe404-termlink" onClick={tidy} style={{ color: "#ffd23f" }}>
              [ tidy ]
            </button>
          </div>
        )}
        <span
          aria-hidden
          style={{ position: "absolute", left: lay.behindKey.x, top: lay.behindKey.y, transform: "translate(-50%,-50%)", zIndex: 5, fontSize: 14, color: "#35ff8f", whiteSpace: "nowrap" }}
        >
          {behindKey}
        </span>
        {windows("term")}
        <div className="fe404-crt" />
        <div className="fe404-flicker" />
        <div className="fe404-vignette" />
      </div>

      {/* SEAM */}
      <svg className="fe404-seam" width={vp.W} height={vp.H} aria-hidden>
        <defs>
          <filter id="fe404-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        {seg.length === 2 && (
          <>
            <line x1={seg[0].x} y1={seg[0].y} x2={seg[1].x} y2={seg[1].y} stroke="#35ff8f" strokeWidth={8} opacity={0.35} filter="url(#fe404-glow)" />
            <line
              x1={seg[0].x - n.x * 3}
              y1={seg[0].y - n.y * 3}
              x2={seg[1].x - n.x * 3}
              y2={seg[1].y - n.y * 3}
              stroke="#3b82f6"
              strokeWidth={1.5}
              opacity={0.9}
            />
            <line className="fe404-seam-line" x1={seg[0].x} y1={seg[0].y} x2={seg[1].x} y2={seg[1].y} stroke="#eafff3" strokeWidth={1.5} />
            <SeamGlyphs seg={seg} n={n} />
            <line className="fe404-seam-hit" x1={seg[0].x} y1={seg[0].y} x2={seg[1].x} y2={seg[1].y} stroke="transparent" strokeWidth={22} onPointerDown={dragSeam} />
          </>
        )}
      </svg>
      {mid && (
        <button
          className="fe404-handle"
          style={{ left: mid.x, top: mid.y }}
          aria-label="Seam. Drag or use arrow keys to move it, shift plus arrows to rotate, Enter to reset."
          onPointerDown={dragSeam}
          onDoubleClick={seamReset}
          onKeyDown={onHandleKey}
        />
      )}
      {knob && <button className="fe404-knob" style={{ left: knob.x, top: knob.y }} aria-label="Rotate the seam" onPointerDown={rotateSeam} tabIndex={-1} />}

      {ending && (
        <div className="fe404-ending" role="dialog" aria-label="Breached">
          <div style={{ maxWidth: 720, width: "100%" }}>
            <pre style={{ margin: 0, fontSize: "clamp(5px,1.35vw,11px)", lineHeight: 1.15, color: "#35ff8f", overflow: "hidden" }}>
              {content.terminal.banner.join("\n")}
            </pre>
            <div style={{ marginTop: 22, fontSize: "clamp(16px,2.4vw,22px)", color: "#ffd23f" }}>felixegan.me // BREACHED</div>
            <div style={{ marginTop: 8, fontSize: 14, color: "#c9ffe0" }}>
              total time: {progress.startedAt && progress.splits.length ? fmtDuration(progress.splits[progress.splits.length - 1] - progress.startedAt) : "--"}
            </div>
            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "4px 18px", fontSize: 12.5, color: "#2f7d4f" }}>
              {progress.splits.map((s, i) => {
                const prev = i === 0 ? progress.startedAt ?? s : progress.splits[i - 1];
                return (
                  <div key={i}>
                    level {String(i + 1).padStart(2, "0")} <span style={{ color: "#7cffb0" }}>{fmtDuration(s - prev)}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 22, display: "flex", gap: 18, fontSize: 13 }}>
              <button className="fe404-termlink" onClick={() => setEnding(false)}>
                [ back to the page ]
              </button>
              <button className="fe404-termlink" onClick={() => go("/")}>
                [ cd ~ ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
