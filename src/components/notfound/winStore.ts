import { useSyncExternalStore } from "react";
export type Rect = { x: number; y: number; w: number; h: number };

/**
 * Window positions live outside React state so a drag re-renders only the two
 * skins of the window being moved, not the whole stage (and not the shell).
 */
export type WinPos = Rect & { z: number };

const positions = new Map<string, WinPos>();
const listeners = new Set<() => void>();
const inertia = new Map<string, number>();
let topZ = 10;

const emit = () => listeners.forEach((l) => l());

export const winStore = {
  get: (id: string) => positions.get(id),
  set(id: string, p: Partial<WinPos>) {
    const prev = positions.get(id);
    if (!prev && !(p.w && p.h)) return;
    positions.set(id, { x: 0, y: 0, w: 0, h: 0, z: ++topZ, ...prev, ...p });
    emit();
  },
  /** Place a window only if it hasn't been placed yet. */
  ensure(id: string, r: Rect) {
    if (!positions.has(id)) positions.set(id, { ...r, z: ++topZ });
  },
  front(id: string) {
    const p = positions.get(id);
    if (p && p.z !== topZ) winStore.set(id, { z: ++topZ });
  },
  reset(rects: Record<string, Rect>) {
    inertia.forEach((raf) => cancelAnimationFrame(raf));
    inertia.clear();
    positions.clear();
    Object.entries(rects).forEach(([id, r]) => positions.set(id, { ...r, z: ++topZ }));
    emit();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useWin(id: string) {
  return useSyncExternalStore(winStore.subscribe, () => positions.get(id));
}

const clampPos = (x: number, y: number, w: number) => ({
  x: Math.min(Math.max(x, -w + 90), window.innerWidth - 90),
  y: Math.min(Math.max(y, 0), window.innerHeight - 36),
});

/** Pointer drag with throw inertia. Attach to a window's title bar. */
export function startDrag(e: React.PointerEvent, id: string) {
  if (e.button !== 0) return;
  const start = positions.get(id);
  if (!start) return;
  e.preventDefault();
  const el = e.currentTarget as HTMLElement;
  el.setPointerCapture(e.pointerId);
  cancelAnimationFrame(inertia.get(id) ?? 0);
  winStore.front(id);
  const ox = e.clientX - start.x;
  const oy = e.clientY - start.y;
  const samples: { x: number; y: number; t: number }[] = [{ x: e.clientX, y: e.clientY, t: performance.now() }];

  const move = (ev: PointerEvent) => {
    const p = positions.get(id);
    if (!p) return;
    winStore.set(id, clampPos(ev.clientX - ox, ev.clientY - oy, p.w));
    samples.push({ x: ev.clientX, y: ev.clientY, t: performance.now() });
    if (samples.length > 6) samples.shift();
  };
  const up = () => {
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerup", up);
    el.removeEventListener("pointercancel", up);
    const now = performance.now();
    const recent = samples.filter((s) => now - s.t < 90);
    if (recent.length < 2) return;
    const a = recent[0];
    const b = recent[recent.length - 1];
    const dt = Math.max(1, b.t - a.t);
    let vx = ((b.x - a.x) / dt) * 16;
    let vy = ((b.y - a.y) / dt) * 16;
    const step = () => {
      const p = positions.get(id);
      if (!p) return;
      let x = p.x + vx;
      let y = p.y + vy;
      const maxX = window.innerWidth - p.w;
      const maxY = window.innerHeight - p.h;
      if (x < 0 || x > maxX) {
        vx *= -0.45;
        x = Math.min(Math.max(x, 0), Math.max(0, maxX));
      }
      if (y < 0 || y > maxY) {
        vy *= -0.45;
        y = Math.min(Math.max(y, 0), Math.max(0, maxY));
      }
      winStore.set(id, { x, y });
      vx *= 0.92;
      vy *= 0.92;
      if (Math.hypot(vx, vy) > 0.35) inertia.set(id, requestAnimationFrame(step));
      else inertia.delete(id);
    };
    if (Math.hypot(vx, vy) > 1.2) inertia.set(id, requestAnimationFrame(step));
  };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", up);
}
