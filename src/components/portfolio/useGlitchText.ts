import { useEffect, useRef, useState } from "react";

export type GlyphCell = { ch: string; c: string; s: string };

const GLYPHS = "▓▒░#01<>/\\$%*".split("");

/**
 * Per-character flicker used on the footer copyright and the 404's glitch word:
 * a few characters at a time swap to a glyph or flash green; hovering speeds it up.
 */
export function useGlitchText(text: string, base: string) {
  const [cells, setCells] = useState<GlyphCell[]>([]);
  const hover = useRef(false);

  useEffect(() => {
    const green = () => getComputedStyle(document.documentElement).getPropertyValue("--green").trim() || "#35ff8f";
    const tick = () => {
      const gr = green();
      const rate = hover.current ? 0.26 : 0.09;
      const arr: GlyphCell[] = [];
      for (const ch of text) {
        if (ch === " ") {
          arr.push({ ch: " ", c: base, s: "none" });
          continue;
        }
        if (Math.random() < rate) {
          const useGlyph = Math.random() < 0.5;
          arr.push({ ch: useGlyph ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : ch, c: gr, s: "0 0 6px " + gr });
        } else {
          arr.push({ ch, c: Math.random() < 0.06 ? "#c9ffe0" : base, s: "none" });
        }
      }
      setCells(arr);
    };
    tick();
    const iv = window.setInterval(tick, 110);
    return () => window.clearInterval(iv);
  }, [text, base]);

  const setHover = (on: boolean) => {
    hover.current = on;
  };

  return { cells, setHover };
}
