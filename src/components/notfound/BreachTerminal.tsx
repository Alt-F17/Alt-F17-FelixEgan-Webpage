import { useEffect, useMemo, useState } from "react";
import type { SiteContent } from "@/content/siteContent";
import { FloatWindow } from "./FloatWindow";
import { BreachShell, type ShellApi } from "./BreachShell";
import { CipherWheel, CodeView, FlashCanvas, MorseLed, type Flash } from "./widgets";
import { winStore, type Rect } from "./winStore";
import { LEAKED_SOURCE, PAYLOAD, SESSION_KEY, VALIDATOR_SOURCE, guestSession, unmask, type Level, type LevelWidget } from "./breach/levels";
import { fmtDuration, type Progress } from "./breach/progress";
import "./notfound.css";

const mono = "'IBM Plex Mono',monospace";

const ASCII_404 = [
  "██╗  ██╗ ██████╗ ██╗  ██╗",
  "██║  ██║██╔═████╗██║  ██║",
  "███████║██║██╔██║███████║",
  "╚════██║████╔╝██║╚════██║",
  "     ██║╚██████╔╝     ██║",
  "     ╚═╝ ╚═════╝      ╚═╝",
].join("\n");

type WidgetWin = "cipher" | "leak" | "flash" | "validator";
const WIDGET_WIN: Record<LevelWidget, WidgetWin> = { cipher: "cipher", leak: "leak", trace: "flash", validator: "validator" };
const WIDGET_SIZE: Record<WidgetWin, { w: number; h: number }> = {
  cipher: { w: 300, h: 360 },
  leak: { w: 470, h: 430 },
  flash: { w: 380, h: 200 },
  validator: { w: 470, h: 360 },
};

/**
 * Desktop: shell on the left, a free area on the right where 404.log (with the
 * first key under it) and the level tools float. Phones: 404.log on top, shell
 * below, and tools open over the top while leaving the tap bar visible.
 */
function regions(W: number, H: number, mobile: boolean) {
  if (mobile) {
    const top = 48;
    const w404 = { x: 12, y: top, w: W - 24, h: 150 };
    return { mobile, w404, shell: { x: 0, y: top + 150 + 12, w: W, h: H - (top + 150 + 12) }, stageX: 0, stageW: W };
  }
  const sw = Math.min(760, Math.round(W * 0.58));
  const w = Math.min(320, W - sw - 32);
  return { mobile, w404: { x: sw + (W - sw - w) / 2, y: 92, w, h: 180 }, shell: { x: 12, y: 44, w: sw - 12, h: H - 44 }, stageX: sw, stageW: W - sw };
}

function widgetRect(W: number, H: number, id: WidgetWin): Rect {
  const size = WIDGET_SIZE[id];
  const r = regions(W, H, W < 720);
  if (r.mobile) {
    const y = 48;
    const reserve = id === "flash" ? 240 : 150;
    return { x: 10, y, w: W - 20, h: Math.max(140, Math.min(size.h, H - reserve - y)) };
  }
  const w = Math.min(size.w, r.stageW - 24);
  const h = Math.min(size.h, H - 24);
  return { x: r.stageX + (r.stageW - w) / 2, y: Math.max(56, (H - h) / 2), w, h };
}

export function BreachTerminal({
  content,
  levels,
  mobile,
  progress,
  start,
  advance,
  reset,
  onExit,
  navigate,
}: {
  content: SiteContent;
  levels: Level[];
  mobile: boolean;
  progress: Progress;
  start: () => void;
  advance: () => void;
  reset: () => void;
  onExit: () => void;
  navigate: (path: string) => void;
}) {
  const [vp] = useState(() => ({ W: window.innerWidth, H: window.innerHeight }));
  const reg = regions(vp.W, vp.H, mobile);
  const [flash, setFlash] = useState<Flash>(null);
  const [ending, setEnding] = useState(false);
  const started = progress.startedAt !== null;
  const level = levels[progress.level - 1];
  const widget = started && level?.widget ? WIDGET_WIN[level.widget] : null;
  const behindKey = useMemo(() => unmask(PAYLOAD.behind), []);

  useState(() => winStore.reset({ w404: reg.w404 }));

  useEffect(() => {
    if (widget && !winStore.get(widget)) winStore.set(widget, widgetRect(vp.W, vp.H, widget));
  }, [widget, vp.W, vp.H]);

  useEffect(() => {
    if (!started || level?.kind !== "privilege") return;
    try {
      if (!localStorage.getItem(SESSION_KEY)) localStorage.setItem(SESSION_KEY, guestSession());
    } catch {
      /* storage blocked */
    }
  }, [started, level?.kind]);

  const tidy = () => {
    const rects: Record<string, Rect> = { w404: reg.w404 };
    if (widget) rects[widget] = widgetRect(vp.W, vp.H, widget);
    winStore.reset(rects);
  };

  const api: ShellApi = { progress, start, advance, reset, tidy, exit: onExit, navigate, setFlash, win: () => setEnding(true) };
  // on phones a window dragged onto the shell would bury its tap bar, so the shell stays on top
  const pinTools = mobile ? 6000 : 0;

  return (
    <>
      <div style={{ position: "absolute", top: 18, left: 20, zIndex: 7000 }}>
        <MorseLed active={started && level?.kind === "signal"} big={mobile} />
      </div>

      <span
        aria-hidden
        style={{ position: "absolute", left: reg.w404.x + reg.w404.w / 2, top: reg.w404.y + reg.w404.h / 2, transform: "translate(-50%,-50%)", zIndex: 10, fontFamily: mono, fontSize: 14, color: "#c9ffe0", whiteSpace: "nowrap" }}
      >
        {behindKey}
      </span>

      <div
        style={{
          position: "absolute",
          left: reg.shell.x,
          top: reg.shell.y,
          width: reg.shell.w,
          height: reg.shell.h,
          zIndex: mobile ? 5000 : 20,
          background: mobile ? "#000208" : undefined,
          borderTop: mobile ? "1px solid rgba(53,255,143,.22)" : undefined,
        }}
      >
        <BreachShell key={mobile ? "mobile" : "desktop"} content={content} api={api} levels={levels} mobile={mobile} />
      </div>

      <FloatWindow id="w404" title="404.log">
        <div style={{ padding: "12px 16px", fontFamily: mono }}>
          <pre style={{ margin: 0, fontSize: mobile ? 8.5 : 11, lineHeight: 1.12, color: "#35ff8f" }}>{ASCII_404}</pre>
          <div style={{ marginTop: 10, fontSize: 12, color: "#ff5f57" }}>ERR_ROUTE_NOT_FOUND</div>
        </div>
      </FloatWindow>

      {widget === "cipher" && (
        <FloatWindow id="cipher" title="dial" layer={pinTools}>
          <CipherWheel size={Math.max(150, Math.min(236, (winStore.get("cipher")?.h ?? 360) - 116))} />
        </FloatWindow>
      )}
      {widget === "leak" && (
        <FloatWindow id="leak" title="leaked: auth/session.js" layer={pinTools}>
          <CodeView source={LEAKED_SOURCE} />
        </FloatWindow>
      )}
      {widget === "flash" && (
        <FloatWindow id="flash" title="trace" layer={pinTools} className={flash?.code ? "fe404-jitter" : undefined}>
          <FlashCanvas flash={flash} />
        </FloatWindow>
      )}
      {widget === "validator" && (
        <FloatWindow id="validator" title="v(s)" layer={pinTools}>
          <CodeView source={VALIDATOR_SOURCE} />
        </FloatWindow>
      )}

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
                [ back to the terminal ]
              </button>
              <button className="fe404-termlink" onClick={onExit}>
                [ exit ]
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
