import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import { useSiteContent, type Project, type HeroAction } from "@/content/siteContent";
import { Starfield } from "@/components/portfolio/Starfield";
import { SiteNav } from "@/components/portfolio/SiteNav";
import { SiteFooter } from "@/components/portfolio/SiteFooter";
import { useReveal } from "@/hooks/useReveal";
import ScrambledText from "@/components/ScrambledText";
import "@/components/portfolio/portfolio.css";

const mono = "'IBM Plex Mono',monospace";
const press = "'Press Start 2P'";
const revealStyle: React.CSSProperties = {
  opacity: 0,
  transform: "translateY(26px)",
  transition: "opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1)",
};

const getInitialLoadingState = () => sessionStorage.getItem("homeAnimationPlayed") !== "true";

/** Original intro: "$/Alt-F17/" scrambles into "Felix Egan". Plays once per session. */
const IntroLoader = ({ onDone }: { onDone: () => void }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      background: "#05060a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div style={{ textAlign: "center" }}>
      <ScrambledText
        initialText="$/Alt-F17/"
        targetText="Felix Egan"
        className="fe-intro-text"
        scrambleChars={["⣀", "⣤", "⣶", "⣿", "⠿", "⠛", "⠉"]}
        speed={75}
        onComplete={onDone}
      />
      <div style={{ width: 192, height: 4, background: "#111726", margin: "18px auto 0", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", background: "var(--ac,#3b82f6)", animation: "fe-pulse 1.2s ease-in-out infinite" }} />
      </div>
    </div>
  </div>
);

const SectionHeader = ({
  index,
  label,
  heading,
  subhead,
  center = false,
}: {
  index: string;
  label: string;
  heading: string;
  subhead?: string;
  center?: boolean;
}) => (
  <div data-reveal style={revealStyle}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: center ? "center" : "flex-start",
        gap: 14,
        marginBottom: center ? 16 : 14,
      }}
    >
      <span style={{ fontFamily: press, fontSize: 11, color: "var(--ac,#3b82f6)" }}>{index}</span>
      <span style={{ fontFamily: mono, fontSize: 12, letterSpacing: 3, color: "#5f6b85" }}>{label}</span>
      {!center && <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(59,130,246,.4),transparent)" }} />}
    </div>
    <h2
      style={{
        fontSize: center ? "clamp(36px,6vw,68px)" : "clamp(34px,5vw,60px)",
        fontWeight: 800,
        letterSpacing: center ? "-.025em" : "-.02em",
        margin: "0 0 6px",
        color: "#fff",
        textAlign: center ? "center" : "left",
      }}
    >
      {heading}
    </h2>
    {subhead && <p style={{ margin: 0, fontSize: 17, color: "#8a93a8", fontFamily: mono }}>{subhead}</p>}
  </div>
);

const HeroButton = ({ a }: { a: HeroAction }) => {
  const common: React.CSSProperties = { display: "inline-flex", alignItems: "center", fontSize: "15.5px", fontWeight: 700 };
  if (a.variant === "primary")
    return (
      <a
        href={a.href}
        className="fe-btn-primary"
        style={{ ...common, gap: 10, padding: "15px 26px", background: "var(--ac,#3b82f6)", color: "#05060a", boxShadow: "0 0 24px rgba(59,130,246,.45)" }}
      >
        {a.label} {a.trailing && <span style={{ fontFamily: mono }}>{a.trailing}</span>}
      </a>
    );
  if (a.variant === "outline")
    return (
      <a
        href={a.href}
        className="fe-btn-outline"
        style={{ ...common, padding: "15px 26px", border: "1px solid rgba(124,179,255,.4)", color: "#c4ccdd", fontWeight: 600 }}
      >
        {a.label}
      </a>
    );
  return (
    <a
      href={a.href}
      className="fe-btn-ghost"
      style={{ ...common, gap: 7, padding: "15px 22px", color: "#8a93a8", fontWeight: 500 }}
    >
      {a.label} {a.trailing && <span style={{ fontSize: 13 }}>{a.trailing}</span>}
    </a>
  );
};

const ProjectCard = ({ p, delay }: { p: Project; delay: number }) => {
  const navigate = useNavigate();
  const go = () => navigate(`/projects/${p.slug}`);
  return (
    <article
      data-reveal
      data-delay={delay}
      className="fe-projcard"
      role="link"
      tabIndex={0}
      onClick={go}
      onKeyDown={(e) => {
        if (e.key === "Enter") go();
      }}
      style={{
        ...revealStyle,
        transform: "translateY(30px)",
        display: "flex",
        flexDirection: "column",
        border: "1px solid rgba(124,179,255,.16)",
        background: "linear-gradient(180deg,rgba(11,16,30,.7),rgba(8,11,22,.55))",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          position: "relative",
          height: 130,
          overflow: "hidden",
          borderBottom: "1px solid rgba(124,179,255,.14)",
          background:
            "linear-gradient(135deg,rgba(59,130,246,.14),rgba(8,11,22,.2)),repeating-linear-gradient(0deg,rgba(255,255,255,.045) 0,rgba(255,255,255,.045) 1px,transparent 1px,transparent 7px),repeating-linear-gradient(90deg,rgba(255,255,255,.045) 0,rgba(255,255,255,.045) 1px,transparent 1px,transparent 7px)",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 12,
            left: 14,
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: 1.5,
            color: "var(--ac,#3b82f6)",
            textTransform: "uppercase",
            background: "rgba(5,6,10,.55)",
            padding: "3px 8px",
          }}
        >
          {p.category}
        </span>
        <span style={{ position: "absolute", top: 12, right: 14, fontFamily: mono, fontSize: 11, color: "#5f6b85" }}>{p.year}</span>
        <span style={{ position: "absolute", left: 16, bottom: 8, fontFamily: press, fontSize: 38, color: "rgba(124,179,255,.14)", letterSpacing: 2 }}>
          {p.glyph}
        </span>
        <span style={{ position: "absolute", right: 14, bottom: 12, fontFamily: mono, fontSize: 12, color: "var(--green,#35ff8f)", opacity: 0.8 }}>
          {p.status}
        </span>
      </div>
      <div style={{ padding: "20px 20px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={{ margin: "0 0 9px", fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-.01em" }}>{p.title}</h3>
        <p style={{ margin: "0 0 16px", fontSize: "14.5px", lineHeight: 1.6, color: "#9aa3b8", flex: 1 }}>{p.overview}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
          {p.tech.map((t) => (
            <span
              key={t}
              style={{
                fontFamily: mono,
                fontSize: "11.5px",
                color: "var(--acb,#7cb3ff)",
                padding: "4px 9px",
                border: "1px solid rgba(124,179,255,.2)",
                background: "rgba(59,130,246,.06)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, paddingTop: 14, borderTop: "1px solid rgba(124,179,255,.1)" }}>
          {p.links.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="fe-projlink"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: mono, fontSize: 13, color: "#aeb6c9" }}
            >
              {l.icon} {l.label}
            </a>
          ))}
        </div>
      </div>
    </article>
  );
};

const Index = () => {
  const { content } = useSiteContent();
  const [role, setRole] = useState("");
  const [scrollIdle, setScrollIdle] = useState(false);
  const [isLoading, setIsLoading] = useState(getInitialLoadingState);
  const idleTimer = useRef<number | undefined>(undefined);
  const finishIntro = () => {
    sessionStorage.setItem("homeAnimationPlayed", "true");
    setIsLoading(false);
  };

  useReveal(!!content);

  // role scramble-in — hold until the intro loader has finished
  useEffect(() => {
    if (!content || isLoading) return;
    const target = content.hero.role;
    const chars = "!<>-_\\/[]{}=+*^?#01ABCDEF$%&@";
    let p = 0;
    const iv = window.setInterval(() => {
      p += 0.6;
      const r = Math.floor(p);
      let out = "";
      for (let i = 0; i < target.length; i++) {
        if (i < r || target[i] === " ") out += target[i];
        else out += chars[(Math.random() * chars.length) | 0];
      }
      setRole(out);
      if (r >= target.length) {
        window.clearInterval(iv);
        setRole(target);
      }
    }, 34);
    return () => window.clearInterval(iv);
  }, [content, isLoading]);

  // scroll hint idle timer
  useEffect(() => {
    if (!content) return;
    const arm = () => {
      window.clearTimeout(idleTimer.current);
      setScrollIdle(false);
      if (window.scrollY < 40)
        idleTimer.current = window.setTimeout(() => {
          if (window.scrollY < 40) setScrollIdle(true);
        }, 5000);
    };
    window.addEventListener("scroll", arm, { passive: true });
    arm();
    return () => {
      window.removeEventListener("scroll", arm);
      window.clearTimeout(idleTimer.current);
    };
  }, [content]);

  if (!content) {
    return (
      <div className="fe-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        {isLoading ? (
          <IntroLoader onDone={finishIntro} />
        ) : (
          <span style={{ fontFamily: mono, color: "#3b82f6", fontSize: 15 }}>
            loading<span style={{ animation: "fe-blink 1.05s step-end infinite" }}>_</span>
          </span>
        )}
      </div>
    );
  }

  const { hero, about, skills, work, contact } = content;

  return (
    <div className="fe-root" id="top">
      <Seo title={content.meta.title} description={content.meta.description} canonicalPath="/" />
      {isLoading && <IntroLoader onDone={finishIntro} />}
      <Starfield theme={content.theme} />
      <SiteNav nav={content.nav} home />

      {/* scroll hint */}
      <div
        style={{
          position: "fixed",
          top: 76,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 39,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 7,
          pointerEvents: "none",
          opacity: scrollIdle ? 0.9 : 0,
          transition: "opacity .8s ease",
        }}
      >
        <span style={{ fontFamily: press, fontSize: 7, letterSpacing: 2, color: "#6b7590" }}>{content.scrollHint}</span>
        <span style={{ color: "var(--ac,#3b82f6)", fontFamily: mono, fontSize: 15, animation: "fe-bob 2.4s ease-in-out infinite" }}>▼</span>
      </div>

      <main style={{ position: "relative", zIndex: 2, width: "100%" }}>
        {/* HERO */}
        <section id="hero" style={{ minHeight: "100svh", display: "flex", alignItems: "center", padding: "118px clamp(20px,6vw,80px) 90px" }}>
          <div style={{ width: "100%", maxWidth: 1360, margin: "0 auto" }}>
            <div style={{ maxWidth: 1000 }}>
              <p style={{ fontFamily: mono, color: "var(--ac,#3b82f6)", fontSize: 16, margin: "0 0 14px", letterSpacing: ".5px" }}>{hero.greeting}</p>
              <h1 style={{ fontSize: "clamp(56px,12vw,150px)", lineHeight: 0.9, fontWeight: 800, letterSpacing: "-.035em", margin: "0 0 20px", color: "#fff" }}>
                {hero.name}
              </h1>
              <h2
                style={{
                  minHeight: "1.3em",
                  fontSize: "clamp(20px,2.9vw,36px)",
                  fontWeight: 600,
                  color: "#c4ccdd",
                  margin: "0 0 26px",
                  fontFamily: mono,
                }}
              >
                {role}
                <span style={{ color: "var(--ac,#3b82f6)", animation: "fe-blink 1.05s step-end infinite" }}>_</span>
              </h2>
              <p style={{ maxWidth: "46rem", fontSize: "clamp(16px,1.6vw,19px)", lineHeight: 1.66, color: "#9aa3b8", margin: "0 0 36px" }}>
                {hero.tagline}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                {hero.actions.map((a) => (
                  <HeroButton key={a.label} a={a} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" style={{ padding: "clamp(70px,10vw,130px) clamp(18px,5vw,56px)" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <SectionHeader index={about.index} label={about.label} heading={about.heading} />
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr .9fr", gap: "clamp(24px,4vw,56px)", marginTop: 40, alignItems: "start" }} className="fe-about-grid">
              <div data-reveal data-delay={80} style={{ ...revealStyle, display: "flex", flexDirection: "column", gap: 20 }}>
                {about.paragraphs.map((para, i) => (
                  <p key={i} style={{ margin: 0, fontSize: "clamp(15px,1.5vw,17.5px)", lineHeight: 1.75, color: i === 0 ? "#c4ccdd" : "#9aa3b8" }}>
                    {para}
                  </p>
                ))}
              </div>
              <div
                data-reveal
                data-delay={160}
                style={{
                  ...revealStyle,
                  border: "1px solid rgba(124,179,255,.2)",
                  background: "linear-gradient(180deg,rgba(11,16,30,.75),rgba(8,11,22,.6))",
                  padding: 6,
                }}
              >
                <div style={{ border: "1px solid rgba(124,179,255,.1)", padding: 22 }}>
                  <div style={{ fontFamily: press, fontSize: 8, letterSpacing: 1, color: "#5f6b85", marginBottom: 18 }}>{about.profile.title}</div>
                  <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                    {about.profile.fields.map((f) => (
                      <div key={f.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <dt style={{ fontFamily: mono, fontSize: 11, letterSpacing: 1, color: "var(--ac,#3b82f6)", textTransform: "uppercase" }}>{f.label}</dt>
                        <dd style={{ margin: 0, fontSize: 15, color: "#e8ecf5" }}>{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SKILLS */}
        <section id="skills" style={{ padding: "clamp(70px,10vw,130px) clamp(18px,5vw,56px)" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <SectionHeader index={skills.index} label={skills.label} heading={skills.heading} subhead={skills.subhead} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 16, marginTop: 40 }}>
              {skills.groups.map((g, gi) => (
                <div
                  key={g.name}
                  data-reveal
                  data-delay={gi * 60}
                  className="fe-skillcard"
                  style={{
                    ...revealStyle,
                    border: "1px solid rgba(124,179,255,.16)",
                    background: "linear-gradient(180deg,rgba(11,16,30,.66),rgba(8,11,22,.5))",
                    padding: "20px 20px 22px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
                    <span style={{ color: "var(--ac,#3b82f6)", fontFamily: mono, fontSize: 15 }}>{g.icon}</span>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>{g.name}</h3>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {g.items.map((it) => (
                      <span
                        key={it}
                        className="fe-skilltag"
                        style={{
                          fontFamily: mono,
                          fontSize: "12.5px",
                          color: "#c4ccdd",
                          padding: "6px 11px",
                          border: "1px solid rgba(124,179,255,.18)",
                          background: "rgba(124,179,255,.04)",
                        }}
                      >
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div
              data-reveal
              data-delay={120}
              style={{
                ...revealStyle,
                marginTop: 16,
                borderLeft: "2px solid var(--ac,#3b82f6)",
                background: "linear-gradient(90deg,rgba(59,130,246,.08),transparent)",
                padding: "22px 24px",
              }}
            >
              <div style={{ fontFamily: press, fontSize: 9, letterSpacing: 1, color: "var(--ac,#3b82f6)", marginBottom: 16 }}>{skills.focus.title}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
                {skills.focus.items.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                    <span style={{ color: "var(--green,#35ff8f)", fontFamily: mono, fontSize: 13, marginTop: 2 }}>▹</span>
                    <span style={{ fontSize: "14.5px", lineHeight: 1.55, color: "#b3bccf" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* WORK */}
        <section id="work" style={{ padding: "clamp(70px,10vw,130px) clamp(18px,5vw,56px)" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <SectionHeader index={work.index} label={work.label} heading={work.heading} subhead={work.subhead} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 18, marginTop: 44 }}>
              {work.projects.map((p, i) => (
                <ProjectCard key={p.slug} p={p} delay={i * 60} />
              ))}
            </div>
            <div data-reveal data-delay={80} style={{ ...revealStyle, marginTop: 34, textAlign: "center" }}>
              <a
                href={work.cta.href}
                target="_blank"
                rel="noreferrer"
                className="fe-ghostbtn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "13px 26px",
                  border: "1px solid rgba(124,179,255,.35)",
                  color: "#c4ccdd",
                  fontFamily: mono,
                  fontSize: 14,
                }}
              >
                {work.cta.label}
              </a>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" style={{ padding: "clamp(70px,10vw,130px) clamp(18px,5vw,56px) clamp(80px,9vw,120px)" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
            <div data-reveal style={revealStyle}>
              <SectionHeaderInline index={contact.index} label={contact.label} />
              <h2 style={{ fontSize: "clamp(36px,6vw,68px)", fontWeight: 800, letterSpacing: "-.025em", margin: "0 0 18px", color: "#fff" }}>{contact.heading}</h2>
              <p style={{ maxWidth: "34rem", margin: "0 auto 40px", fontSize: "clamp(15px,1.6vw,18px)", lineHeight: 1.7, color: "#9aa3b8" }}>{contact.body}</p>
              <a
                href={`mailto:${contact.email}`}
                className="fe-btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "16px 30px",
                  background: "var(--ac,#3b82f6)",
                  color: "#05060a",
                  fontWeight: 700,
                  fontSize: 16,
                  boxShadow: "0 0 30px rgba(59,130,246,.5)",
                  marginBottom: 44,
                }}
              >
                <span style={{ fontFamily: mono }}>{contact.cta.prefix}</span> {contact.cta.label}
              </a>
            </div>
            <div data-reveal data-delay={120} style={{ ...revealStyle, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
              {contact.socials.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="fe-social"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 18px",
                    border: "1px solid rgba(124,179,255,.2)",
                    background: "linear-gradient(180deg,rgba(11,16,30,.6),rgba(8,11,22,.4))",
                    fontFamily: mono,
                    fontSize: "13.5px",
                    color: "#c4ccdd",
                  }}
                >
                  <span style={{ color: "var(--ac,#3b82f6)", fontSize: 15 }}>{s.icon}</span> {s.handle}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter content={content} />
    </div>
  );
};

const SectionHeaderInline = ({ index, label }: { index: string; label: string }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 16 }}>
    <span style={{ fontFamily: press, fontSize: 11, color: "var(--ac,#3b82f6)" }}>{index}</span>
    <span style={{ fontFamily: mono, fontSize: 12, letterSpacing: 3, color: "#5f6b85" }}>{label}</span>
  </div>
);

export default Index;
