import { useCallback, useEffect, useState } from "react";

/** Desktop and phone tracks keep separate progress. */
export const PROGRESS_KEY = { desktop: "fe404.breach", mobile: "fe404.breach.mobile" } as const;

/** level = the level currently being played; total + 1 means breached. */
export type Progress = { level: number; startedAt: number | null; splits: number[] };

const fresh = (): Progress => ({ level: 1, startedAt: null, splits: [] });

function load(key: string, total: number): Progress {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fresh();
    const p = JSON.parse(raw) as Progress;
    if (typeof p.level !== "number" || p.level < 1 || p.level > total + 1 || !Array.isArray(p.splits)) return fresh();
    return p;
  } catch {
    return fresh();
  }
}

function save(key: string, p: Progress) {
  try {
    localStorage.setItem(key, JSON.stringify(p));
  } catch {
    /* private mode or blocked storage: progress just won't persist */
  }
}

export function useProgress(key: string, total: number) {
  const [progress, setProgress] = useState<Progress>(() => load(key, total));

  useEffect(() => {
    setProgress(load(key, total));
  }, [key, total]);

  const update = useCallback(
    (fn: (p: Progress) => Progress) => {
      setProgress((prev) => {
        const next = fn(prev);
        save(key, next);
        return next;
      });
    },
    [key],
  );

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
