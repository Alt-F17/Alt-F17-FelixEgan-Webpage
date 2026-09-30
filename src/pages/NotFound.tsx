import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import { useSiteContent } from "@/content/siteContent";
import { Starfield } from "@/components/portfolio/Starfield";
import { SiteNav } from "@/components/portfolio/SiteNav";
import { CrtScreen } from "@/components/portfolio/CrtScreen";
import { useCorruption } from "@/components/portfolio/useCorruption";
import { useGlitchText } from "@/components/portfolio/useGlitchText";
import { BreachTerminal } from "@/components/notfound/BreachTerminal";
import { LEVELS, MOBILE_LEVELS, PAYLOAD, unmask } from "@/components/notfound/breach/levels";
import { PROGRESS_KEY, useProgress } from "@/components/notfound/breach/progress";
import { useLanguage } from "@/i18n/LanguageProvider";
import { portfolioCopy } from "@/content/portfolioCopy";
import "@/components/portfolio/portfolio.css";

const mono = "'IBM Plex Mono',monospace";
const press = "'Press Start 2P'";
const MOBILE_BP = 720;

/** The word in the 404 message that flickers like the footer copyright; clicking it breaches into BREACH. */
function GlitchWord({ word, onOpen }: { word: string; onOpen: (origin?: { x: number; y: number }) => void }) {
  const { cells, setHover } = useGlitchText(word, "#c4ccdd");
  const center = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  return (
    <span
      role="button"
      tabIndex={0}
      title="root@alt-f17"
      className="fe404-glitchword"
      onClick={(e) => onOpen({ x: e.clientX, y: e.clientY })}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(center(e.currentTarget));
        }
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ fontFamily: mono }}
    >
      {(cells.length ? cells : [...word].map((ch) => ({ ch, c: "#c4ccdd", s: "none" }))).map((g, i) => (
        <span key={i} style={{ display: "inline-block", width: ".62em", textAlign: "center", color: g.c, textShadow: g.s }}>
          {g.ch}
        </span>
      ))}
    </span>
  );
}

const NotFound = () => {
  const { content } = useSiteContent();
  const { locale } = useLanguage();
  const { pathname } = useLocation();
  const nav = useNavigate();
  const t = portfolioCopy.notFound;

  const [mobile, setMobile] = useState(() => window.innerWidth < MOBILE_BP);
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < MOBILE_BP);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const levels = mobile ? MOBILE_LEVELS : LEVELS;
  const { progress, start, advance, reset } = useProgress(PROGRESS_KEY[mobile ? "mobile" : "desktop"], levels.length);
  const level = levels[progress.level - 1];
  const leftBehind = progress.startedAt !== null && level?.kind === "otherside";
  const leftBehindKey = useMemo(() => `KEY_0${mobile ? 2 : 3} = ${unmask(PAYLOAD.otherSide).split(" = ")[1]}`, [mobile]);

  const fx = useCorruption();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const enter = (origin?: { x: number; y: number }) => {
    if (busy || open) return;
    setBusy(true);
    fx.enter(origin, () => {
      setOpen(true);
      setBusy(false);
    });
  };
  const exit = useCallback(() => {
    if (busy) return;
    setBusy(true);
    setOpen(false);
    fx.leave(() => setBusy(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy]);
  const navigate = (path: string) => {
    setOpen(false);
    document.body.style.overflow = "";
    nav(path);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, exit]);

  const seo = (
    <>
      <Seo title="404 | Felix Egan" description="This page doesn't exist. Something else does." canonicalPath="/404" />
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>
    </>
  );

  if (!content) {
    return (
      <div className="fe-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        {seo}
        <span style={{ fontFamily: mono, color: "#3b82f6", fontSize: 15 }}>
          loading<span style={{ animation: "fe-blink 1.05s step-end infinite" }}>_</span>
        </span>
      </div>
    );
  }

  const [pre, word, post] = t.body[locale];

  return (
    <div className="fe-root" id="top">
      {seo}
      <Starfield theme={content.theme} />
      <SiteNav nav={content.nav} home={false} />

      <main
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px clamp(18px,5vw,56px) 60px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 640,
            border: "1px solid rgba(124,179,255,.2)",
            background: "linear-gradient(180deg,rgba(11,16,30,.75),rgba(8,11,22,.6))",
            padding: "clamp(24px,5vw,40px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, fontFamily: mono, fontSize: 12, letterSpacing: 2, color: "#5f6b85", minWidth: 0 }}>
            <span style={{ fontFamily: press, fontSize: 10, color: "var(--ac,#3b82f6)" }}>404</span>
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>GET {pathname}</span>
          </div>
          <h1 style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "4px 16px", margin: 0 }}>
            <span style={{ fontSize: "clamp(64px,14vw,112px)", fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1, color: "#fff" }}>404</span>
            <span style={{ fontFamily: mono, fontSize: 15, fontWeight: 400, color: "var(--ac,#3b82f6)" }}>{t.title[locale]}</span>
          </h1>
          <p style={{ margin: "18px 0 0", fontSize: "clamp(15px,1.6vw,17.5px)", lineHeight: 1.7, color: "#9aa3b8" }}>
            {pre}
            <GlitchWord word={word} onOpen={enter} />
            {post}
          </p>
          {leftBehind && (
            <div style={{ marginTop: 18, fontFamily: mono, fontSize: 14, color: "#c9ffe0", textShadow: "0 0 12px rgba(53,255,143,.55)" }}>
              <span style={{ color: "#2f7d4f" }}>// {t.leftBehind[locale]}: </span>
              {leftBehindKey}
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
            <Link
              to="/"
              className="fe-btn-primary"
              style={{ display: "inline-flex", padding: "12px 22px", background: "var(--ac,#3b82f6)", color: "#05060a", fontWeight: 700, fontSize: 14, boxShadow: "0 0 20px rgba(59,130,246,.4)" }}
            >
              {t.home[locale]}
            </Link>
            <Link
              to="/#work"
              className="fe-ghostbtn"
              style={{ display: "inline-flex", padding: "12px 22px", border: "1px solid rgba(124,179,255,.35)", color: "#c4ccdd", fontFamily: mono, fontSize: 14 }}
            >
              {t.projects[locale]}
            </Link>
          </div>
        </div>
      </main>

      {fx.overlay}
      {open && (
        <CrtScreen onExit={exit}>
          <BreachTerminal
            content={content}
            levels={levels}
            mobile={mobile}
            progress={progress}
            start={start}
            advance={advance}
            reset={reset}
            onExit={exit}
            navigate={navigate}
          />
        </CrtScreen>
      )}
    </div>
  );
};

export default NotFound;
