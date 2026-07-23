import { useEffect, useRef } from "react";
import type { SiteContent } from "@/content/siteContent";

/**
 * Fixed parallax starfield + gradient/scanline overlays behind every portfolio page.
 * Also publishes the theme accent/green as CSS variables (--ac, --acb, --green).
 * Canvas logic ported 1:1 from the design's initStars().
 */
export function Starfield({ theme }: { theme: SiteContent["theme"] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--ac", theme.accent);
    root.style.setProperty("--acb", theme.accentBright);
    root.style.setProperty("--green", theme.terminalGreen);
  }, [theme]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const density = theme.starDensity ?? 1;
    let w = 0;
    let h = 0;
    let stars: { x: number; y: number; z: number; s: number; t: number; blue: boolean }[] = [];
    let mx = 0;
    let scrollY = 0;
    let raf = 0;

    const make = () => {
      const n = Math.floor(((w * h) / 8200) * density);
      stars = [];
      for (let i = 0; i < n; i++)
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: Math.random(),
          s: Math.random() < 0.14 ? 2 : 1,
          t: Math.random() * Math.PI * 2,
          blue: Math.random() < 0.24,
        });
    };
    const resize = () => {
      w = c.width = window.innerWidth;
      h = c.height = window.innerHeight;
      make();
    };
    resize();
    const onResize = () => resize();
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    const onMouse = (e: MouseEvent) => {
      mx = e.clientX - window.innerWidth / 2;
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const t = performance.now() / 1000;
      const ac = getComputedStyle(document.documentElement).getPropertyValue("--ac").trim() || "#3b82f6";
      for (const st of stars) {
        const par = 6 + st.z * 22;
        const px = st.x + mx * par * 0.006;
        let py = st.y - scrollY * st.z * 0.18;
        py = ((py % h) + h) % h;
        const tw = 0.5 + 0.5 * Math.sin(t * (0.5 + st.z) + st.t);
        ctx.globalAlpha = (0.22 + st.z * 0.78) * tw;
        ctx.fillStyle = st.blue ? ac : "#dfe8ff";
        const s = st.s + (st.z > 0.86 ? 1 : 0);
        ctx.fillRect((((px % w) + w) % w) | 0, py | 0, s, s);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
    };
  }, [theme.starDensity]);

  return (
    <>
      <canvas
        className="stars"
        ref={canvasRef}
        style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", zIndex: 0, pointerEvents: "none" }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(1100px 560px at 12% -12%,rgba(37,99,235,.34),transparent 55%),radial-gradient(900px 460px at 90% -16%,rgba(56,189,248,.16),transparent 52%),radial-gradient(700px 700px at 82% 12%,rgba(99,102,241,.10),transparent 60%)",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          opacity: 0.5,
          mixBlendMode: "overlay",
          backgroundImage:
            "repeating-linear-gradient(0deg,rgba(255,255,255,.03) 0,rgba(255,255,255,.03) 1px,transparent 1px,transparent 3px)",
        }}
      />
    </>
  );
}
