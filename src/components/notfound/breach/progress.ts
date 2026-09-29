import { useCallback, useState } from "react";

const KEY = "fe404.breach";

/** level = the level currently being played (1-10); 11 means breached. */
export type Progress = { level: number; startedAt: number | null; splits: number[] };

const fresh = (): Progress => ({ level: 1, startedAt: null, splits: [] });

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    const p = JSON.parse(raw) as Progress;
    if (typeof p.level !== "number" || p.level < 1 || p.level > 11 || !Array.isArray(p.splits)) return fresh();
    return p;
  } catch {
    return fresh();
  }
}

function save(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* private mode or blocked storage: progress just won't persist */
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(load);

  const update = useCallback((fn: (p: Progress) => Progress) => {
    setProgress((prev) => {
      const next = fn(prev);
      save(next);
      return next;
    });
  }, []);

  const start = useCallback(() => update((p) => (p.startedAt ? p : { ...p, startedAt: Date.now() })), [update]);
  const advance = useCallback(() => update((p) => ({ ...p, level: p.level + 1, splits: [...p.splits, Date.now()] })), [update]);
  const reset = useCallback(() => update(() => fresh()), [update]);

  return { progress, start, advance, reset };
}

export function fmtDuration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}
