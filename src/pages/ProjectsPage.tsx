import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import { useSiteContent } from "@/content/siteContent";
import { Starfield } from "@/components/portfolio/Starfield";
import { SiteNav } from "@/components/portfolio/SiteNav";
import { SiteFooter } from "@/components/portfolio/SiteFooter";
import { ProjectCard, SectionHeader } from "@/components/portfolio/ProjectCard";
import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageProvider";
import { portfolioCopy } from "@/content/portfolioCopy";
import "@/components/portfolio/portfolio.css";

const mono = "'IBM Plex Mono',monospace";
const revealStyle: React.CSSProperties = {
  opacity: 0,
  transform: "translateY(26px)",
  transition: "opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1)",
};

const ProjectsPage = () => {
  const { content } = useSiteContent();
  const { locale } = useLanguage();

  useEffect(() => {
    sessionStorage.setItem("visitedSubpage", "true");
    window.scrollTo(0, 0);
  }, []);

  useReveal(!!content);

  // Card content stays English (no reviewed FR in site.json); only the page chrome is overlaid.
  const chrome = useMemo(() => {
    if (!content) return null;
    const a = content.allProjects;
    if (locale !== "fr") return { ...a, back: "← back to home" };
    return {
      ...a,
      heading: portfolioCopy.projects.allTitle.fr,
      subhead: portfolioCopy.projects.allSubtitle.fr,
      back: "← retour à l'accueil",
    };
  }, [content, locale]);

  if (!content || !chrome) {
    return (
      <div className="fe-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <span style={{ fontFamily: mono, color: "#3b82f6", fontSize: 15 }}>
          loading<span style={{ animation: "fe-blink 1.05s step-end infinite" }}>_</span>
        </span>
      </div>
    );
  }

  const { work } = content;

  return (
    <div className="fe-root" id="top">
      <Seo title={chrome.meta.title} description={chrome.meta.description} canonicalPath="/projects" />
      <Starfield theme={content.theme} />
      <SiteNav nav={content.nav} home={false} />

      <main style={{ position: "relative", zIndex: 2, width: "100%", padding: "128px clamp(18px,5vw,56px) clamp(70px,10vw,130px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div data-reveal style={revealStyle}>
            <Link
              to="/#work"
              className="fe-projlink"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: mono, fontSize: 13, color: "#aeb6c9", marginBottom: 22 }}
            >
              {chrome.back}
            </Link>
          </div>
          <SectionHeader as="h1" index={chrome.index} label={chrome.label} heading={chrome.heading} subhead={chrome.subhead} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 18, marginTop: 44 }}>
            {work.projects.map((p, i) => (
              <ProjectCard key={p.slug} p={p} rank={i + 1} delay={(i % 3) * 60} />
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
      </main>

      <SiteFooter content={content} />
    </div>
  );
};

export default ProjectsPage;
