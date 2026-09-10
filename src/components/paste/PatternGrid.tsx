import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";

const GRID_SIZE = 4;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;

// Minimum distinct cells required before firing onComplete. This is enforced
// CLIENT-SIDE ONLY: the raw cell sequence never leaves the browser (only a
// SHA-256 digest of it does, see authApi.hashPatternClient), so the server
// has no way to verify how many cells were actually drawn from a hash alone.
// A user (or a modified client) could submit a hash of a shorter sequence;
// the entropy trade-off of pattern-only auth is accepted and documented in
// the implementation plan, compensated for server-side by a tight per-IP
// login rate limit and mandatory captcha rather than by anything enforceable
// here.
const MIN_CELLS = 5;

type Point = { x: number; y: number };

export type PatternGridProps = {
  onComplete: (cells: number[]) => void;
  disabled?: boolean;
};

/**
 * Hand-rolled 4x4 pointer-driven pattern lock, in the style of a phone's
 * pattern unlock. No gesture/canvas library exists anywhere in this repo, so
 * this is built with plain divs + pointer events + an SVG overlay for the
 * trail line, matching how this codebase hand-rolls other small interactive
 * bits rather than reaching for a dependency.
 */
export function PatternGrid({ onComplete, disabled = false }: PatternGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Array<HTMLDivElement | null>>([]);
  const visitedRef = useRef<number[]>([]);

  const [visited, setVisited] = useState<number[]>([]);
  const [dragging, setDragging] = useState(false);
  const [pointerPos, setPointerPos] = useState<Point | null>(null);

  // Center of a cell, in coordinates relative to the container (same space
  // the overlay <svg> renders in, since it has no viewBox and spans the
  // container exactly via `inset-0`).
  const cellCenter = useCallback((index: number): Point | null => {
    const container = containerRef.current;
    const cell = cellRefs.current[index];
    if (!container || !cell) return null;
    const containerRect = container.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    return {
      x: cellRect.left - containerRect.left + cellRect.width / 2,
      y: cellRect.top - containerRect.top + cellRect.height / 2,
    };
  }, []);

  // Nearest-dot-within-radius, not strict per-cell rectangle bounds. A
  // straight diagonal drag between two dots passes exactly through the
  // corner where four cell rectangles meet — with rectangle-based hit
  // testing, a pixel's worth of jitter right at that corner flips which
  // rect "contains" the point, so fast diagonal strokes would register the
  // wrong dot (or momentarily nothing) even when the intended dot was
  // clearly closer. Real pattern-lock implementations (e.g. Android's) use
  // proximity to the dot center for exactly this reason. The radius cap
  // just keeps a stray pointer well outside the whole grid from snapping to
  // whatever dot happens to be nearest.
  const hitTest = useCallback(
    (clientX: number, clientY: number): number | null => {
      const container = containerRef.current;
      if (!container) return null;
      const containerRect = container.getBoundingClientRect();
      const x = clientX - containerRect.left;
      const y = clientY - containerRect.top;

      let nearestIndex: number | null = null;
      let nearestDist = Infinity;
      for (let index = 0; index < CELL_COUNT; index += 1) {
        const center = cellCenter(index);
        if (!center) continue;
        const dist = Math.hypot(x - center.x, y - center.y);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIndex = index;
        }
      }

      const cellSize = containerRect.width / GRID_SIZE;
      if (nearestIndex === null || nearestDist > cellSize * 0.75) return null;
      return nearestIndex;
    },
    [cellCenter],
  );

  const updatePointerPos = (event: ReactPointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setPointerPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const hit = hitTest(event.clientX, event.clientY);
    visitedRef.current = hit === null ? [] : [hit];
    setVisited(visitedRef.current);
    setDragging(true);
    updatePointerPos(event);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || !dragging) return;
    updatePointerPos(event);
    const hit = hitTest(event.clientX, event.clientY);
    if (hit !== null && !visitedRef.current.includes(hit)) {
      visitedRef.current = [...visitedRef.current, hit];
      setVisited(visitedRef.current);
    }
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    setPointerPos(null);
    const finished = visitedRef.current;
    // Always clear the drawn trail on release, whether it completed or was
    // too short — either way the user redraws from scratch next time.
    visitedRef.current = [];
    setVisited([]);
    if (finished.length >= MIN_CELLS) onComplete(finished);
  };

  const visitedPoints = visited.map((index) => cellCenter(index)).filter((point): point is Point => point !== null);
  const lastPoint = visited.length > 0 ? cellCenter(visited[visited.length - 1]) : null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={containerRef}
        className={cn(
          "relative aspect-square w-56 touch-none select-none rounded-xl border border-zinc-800 bg-zinc-950/60 p-4",
          disabled && "pointer-events-none opacity-40",
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          {visitedPoints.length > 1 && (
            <polyline
              points={visitedPoints.map((point) => `${point.x},${point.y}`).join(" ")}
              fill="none"
              stroke="rgb(251 191 36 / 0.85)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {dragging && pointerPos && lastPoint && (
            <line
              x1={lastPoint.x}
              y1={lastPoint.y}
              x2={pointerPos.x}
              y2={pointerPos.y}
              stroke="rgb(251 191 36 / 0.45)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          )}
        </svg>

        <div className="grid h-full w-full grid-cols-4 grid-rows-4 place-items-center">
          {Array.from({ length: CELL_COUNT }, (_, index) => {
            const isVisited = visited.includes(index);
            return (
              <div
                key={index}
                ref={(el) => {
                  cellRefs.current[index] = el;
                }}
                className="flex h-full w-full items-center justify-center"
              >
                <div
                  className={cn(
                    "h-3 w-3 rounded-full border transition-colors",
                    isVisited ? "border-amber-400 bg-amber-400" : "border-zinc-700 bg-zinc-800",
                  )}
                />
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-[11px] text-zinc-500">
        {visited.length > 0 && visited.length < MIN_CELLS
          ? `${visited.length}/${MIN_CELLS} minimum — keep going`
          : "Draw a pattern connecting at least 5 dots"}
      </p>
    </div>
  );
}
