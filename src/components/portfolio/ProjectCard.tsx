import { useNavigate } from "react-router-dom";
import type { Project } from "@/content/siteContent";

const mono = "'IBM Plex Mono',monospace";
const press = "'Press Start 2P'";
const revealStyle: React.CSSProperties = {
  opacity: 0,
  transform: "translateY(26px)",
  transition: "opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1)",
};

export const SectionHeader = ({
  index,
  label,
  heading,
  subhead,
  center = false,
  as = "h2",
}: {
  index: string;
  label: string;
  heading: string;
  subhead?: string;
  center?: boolean;
  as?: "h1" | "h2";
}) => {
  const Heading = as;
  return (
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
      <Heading
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
      </Heading>
      {subhead && <p style={{ margin: 0, fontSize: 17, color: "#8a93a8", fontFamily: mono }}>{subhead}</p>}
    </div>
  );
};

export const ProjectCard = ({ p, delay, rank }: { p: Project; delay: number; rank?: number }) => {
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
        <span style={{ position: "absolute", top: 12, right: 14, fontFamily: mono, fontSize: 11, color: "#5f6b85" }}>
          {rank !== undefined && <span style={{ color: "var(--acb,#7cb3ff)" }}>#{String(rank).padStart(2, "0")} · </span>}
          {p.year}
        </span>
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
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: p.links.length ? 16 : 0 }}>
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
        {p.links.length > 0 && (
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
        )}
      </div>
    </article>
  );
};
