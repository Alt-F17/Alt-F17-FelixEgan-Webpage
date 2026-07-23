import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import { useSiteContent, resolveProjectSlug } from "@/content/siteContent";
import { Starfield } from "@/components/portfolio/Starfield";
import { SiteNav } from "@/components/portfolio/SiteNav";
import { SiteFooter } from "@/components/portfolio/SiteFooter";
import { useReveal } from "@/hooks/useReveal";
import "@/components/portfolio/portfolio.css";

const mono = "'IBM Plex Mono',monospace";
const press = "'Press Start 2P'";
const revealStyle: React.CSSProperties = {
  opacity: 0,
  transform: "translateY(26px)",
  transition: "opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1)",
};

const panel: React.CSSProperties = {
  border: "1px solid rgba(124,179,255,.2)",
  background: "linear-gradient(180deg,rgba(11,16,30,.75),rgba(8,11,22,.6))",
  padding: "26px 26px 28px",
};

const Label = ({ n, t }: { n: string; t: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
    <span style={{ fontFamily: press, fontSize: 10, color: "var(--ac,#3b82f6)" }}>{n}</span>
    <span style={{ fontFamily: mono, fontSize: 12, letterSpacing: 3, color: "#5f6b85" }}>{t}</span>
    <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(59,130,246,.4),transparent)" }} />
  </div>
);

const ProjectPage = () => {
  const { projectId = "" } = useParams<{ projectId: string }>();
  const { content } = useSiteContent();

  useEffect(() => {
    sessionStorage.setItem("visitedSubpage", "true");
    window.scrollTo(0, 0);
  }, [projectId]);

  const detail = content ? content.projectDetails[resolveProjectSlug(content, projectId)] : undefined;
  useReveal(!!content);

  if (!content) {
    return (
      <div className="fe-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <span style={{ fontFamily: mono, color: "#3b82f6", fontSize: 15 }}>
          loading<span style={{ animation: "fe-blink 1.05s step-end infinite" }}>_</span>
        </span>
      </div>
    );
  }

  return (
    <div className="fe-root" id="top">
      <Seo
        title={detail ? `${detail.title} — Felix Egan` : "Project not found — Felix Egan"}
        description={detail ? detail.overview.slice(0, 160) : "Project detail."}
        canonicalPath={`/projects/${projectId}`}
      />
      <Starfield theme={content.theme} />
      <SiteNav nav={content.nav} home={false} />

      <main style={{ position: "relative", zIndex: 2, width: "100%", padding: "128px clamp(18px,5vw,56px) 40px" }}>
        <div style={{ maxWidth: 940, margin: "0 auto" }}>
          {detail ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* header */}
              <div data-reveal style={revealStyle}>
                <Link
                  to="/#work"
                  className="fe-projlink"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: mono, fontSize: 13, color: "#aeb6c9", marginBottom: 22 }}
                >
                  ← back to work
                </Link>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginBottom: 10, fontFamily: mono, fontSize: 12 }}>
                  <span style={{ letterSpacing: 1.5, color: "var(--ac,#3b82f6)", textTransform: "uppercase" }}>{detail.category}</span>
                  <span style={{ color: "#5f6b85" }}>{detail.year}</span>
                  <span style={{ color: "var(--green,#35ff8f)", opacity: 0.85 }}>{detail.status}</span>
                </div>
                <h1 style={{ fontSize: "clamp(38px,7vw,74px)", lineHeight: 0.95, fontWeight: 800, letterSpacing: "-.03em", margin: 0, color: "#fff" }}>
                  {detail.title}
                </h1>
              </div>

              {/* overview */}
              <div data-reveal data-delay={80} style={{ ...revealStyle, ...panel }}>
                <Label n="01" t="// OVERVIEW" />
                <p style={{ margin: 0, fontSize: "clamp(15px,1.5vw,17.5px)", lineHeight: 1.75, color: "#c4ccdd" }}>{detail.overview}</p>
              </div>

              {/* tech stack */}
              <div data-reveal data-delay={120} style={{ ...revealStyle, ...panel }}>
                <Label n="02" t="// TECH STACK" />
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {detail.techStack.map((tech) => (
                    <div key={tech.name} style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 12 }}>
                      <span
                        style={{
                          fontFamily: mono,
                          fontSize: "12.5px",
                          color: "var(--acb,#7cb3ff)",
                          padding: "5px 10px",
                          border: "1px solid rgba(124,179,255,.2)",
                          background: "rgba(59,130,246,.06)",
                          whiteSpace: "nowrap",
                          marginTop: 2,
                        }}
                      >
                        {tech.name}
                      </span>
                      <p style={{ margin: 0, flex: 1, minWidth: 220, fontSize: 14.5, lineHeight: 1.6, color: "#9aa3b8" }}>{tech.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* challenges */}
              <div data-reveal data-delay={160} style={{ ...revealStyle, ...panel }}>
                <Label n="03" t="// CHALLENGES & SOLUTIONS" />
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {detail.challenges.map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                      <span style={{ color: "var(--green,#35ff8f)", fontFamily: mono, fontSize: 13, marginTop: 3 }}>▹</span>
                      <span style={{ fontSize: 15, lineHeight: 1.65, color: "#b3bccf" }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* links */}
              <div data-reveal data-delay={200} style={{ ...revealStyle, ...panel }}>
                <Label n="04" t="// LINKS & RESOURCES" />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {detail.links.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className={l.type === "github" ? "fe-ghostbtn" : "fe-btn-primary"}
                      style={
                        l.type === "github"
                          ? {
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "12px 22px",
                              border: "1px solid rgba(124,179,255,.35)",
                              color: "#c4ccdd",
                              fontFamily: mono,
                              fontSize: 14,
                            }
                          : {
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "12px 22px",
                              background: "var(--ac,#3b82f6)",
                              color: "#05060a",
                              fontWeight: 700,
                              fontSize: 14,
                              boxShadow: "0 0 20px rgba(59,130,246,.4)",
                            }
                      }
                    >
                      {l.type === "github" ? "⌥" : "↗"} {l.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div data-reveal style={{ ...revealStyle, ...panel, textAlign: "center", padding: "60px 26px" }}>
              <div style={{ fontFamily: press, fontSize: 11, color: "var(--ac,#3b82f6)", marginBottom: 18 }}>404</div>
              <h1 style={{ fontSize: "clamp(30px,5vw,52px)", fontWeight: 800, margin: "0 0 14px", color: "#fff" }}>Project not found</h1>
              <p style={{ margin: "0 auto 30px", maxWidth: "32rem", color: "#9aa3b8", lineHeight: 1.7 }}>
                This project page doesn't exist yet.
              </p>
              <Link
                to="/#work"
                className="fe-btn-primary"
                style={{ display: "inline-flex", padding: "13px 26px", background: "var(--ac,#3b82f6)", color: "#05060a", fontWeight: 700, fontSize: 15 }}
              >
                ← Back to Portfolio
              </Link>
            </div>
          )}
        </div>
      </main>

      <SiteFooter content={content} />
    </div>
  );
};

export default ProjectPage;
