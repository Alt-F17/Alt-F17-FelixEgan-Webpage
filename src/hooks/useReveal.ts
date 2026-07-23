import { useEffect } from "react";

/**
 * Scroll-reveal: fades/slides in every [data-reveal] element as it enters view.
 * Honors an optional data-delay (ms). Ported 1:1 from the design's setupReveal().
 * Pass `ready` = true once the content-driven DOM has rendered.
 */
export function useReveal(ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const el = en.target as HTMLElement;
            const d = el.getAttribute("data-delay") || "0";
            el.style.transitionDelay = d + "ms";
            el.style.opacity = "1";
            el.style.transform = "none";
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    const t = window.setTimeout(
      () => document.querySelectorAll("[data-reveal]").forEach((el) => obs.observe(el)),
      60
    );
    return () => {
      window.clearTimeout(t);
      obs.disconnect();
    };
  }, [ready]);
}
