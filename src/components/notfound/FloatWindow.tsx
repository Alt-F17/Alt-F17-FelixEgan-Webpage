import type { ReactNode } from "react";
import { startDrag, useWin, winStore } from "./winStore";

export type Skin = "site" | "term";

const mono = "'IBM Plex Mono',monospace";

/**
 * One window, drawn once per layer at the same shared position. The terminal
 * layer's clip-path decides which skin is visible where, so a window dragged
 * across the seam converts half and half with no extra logic.
 */
export function FloatWindow({
  id,
  skin,
  title,
  children,
  className,
}: {
  id: string;
  skin: Skin;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const p = useWin(id);
  if (!p) return null;
  const term = skin === "term";
  return (
    <section
      className={`fe404-win ${term ? "fe404-win-term" : "fe404-win-site"} ${className ?? ""}`}
      aria-label={title}
      onPointerDown={() => winStore.front(id)}
      style={{ left: p.x, top: p.y, width: p.w, height: p.h, zIndex: 50 + p.z }}
    >
      <header className="fe404-winbar" onPointerDown={(e) => startDrag(e, id)} onDoubleClick={() => winStore.front(id)}>
        <span style={{ fontFamily: mono }}>{term ? `[ ${title} ]` : `// ${title.toUpperCase()}`}</span>
        <span aria-hidden className="fe404-grip">
          {term ? "▓▒░" : "⠿"}
        </span>
      </header>
      <div className="fe404-winbody">{children}</div>
    </section>
  );
}
