import type { ReactNode } from "react";
import { startDrag, useWin, winStore } from "./winStore";

const mono = "'IBM Plex Mono',monospace";

/** A draggable, throwable terminal window floating over the BREACH shell. */
export function FloatWindow({
  id,
  title,
  children,
  className,
  layer = 0,
}: {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
  /** Added to the z-index to keep a window above the free-floating ones. */
  layer?: number;
}) {
  const p = useWin(id);
  if (!p) return null;
  return (
    <section
      className={`fe404-win ${className ?? ""}`}
      aria-label={title}
      onPointerDown={() => winStore.front(id)}
      style={{ left: p.x, top: p.y, width: p.w, height: p.h, zIndex: 50 + layer + p.z }}
    >
      <header className="fe404-winbar" onPointerDown={(e) => startDrag(e, id)}>
        <span style={{ fontFamily: mono }}>[ {title} ]</span>
        <span aria-hidden className="fe404-grip">
          ▓▒░
        </span>
      </header>
      <div className="fe404-winbody">{children}</div>
    </section>
  );
}
