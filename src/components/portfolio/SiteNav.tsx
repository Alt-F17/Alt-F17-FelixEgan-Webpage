import type { SiteContent } from "@/content/siteContent";

const mono = "'IBM Plex Mono',monospace";
const press = "'Press Start 2P'";

/**
 * Fixed top navigation. On the home page, anchor links jump to sections;
 * on subpages they point back to /#section. Ported from the design's <nav>.
 */
export function SiteNav({ nav, home = true }: { nav: SiteContent["nav"]; home?: boolean }) {
  const base = home ? "" : "/";
  const logoHref = home ? "#top" : "/";
  // Anchor links (#about) are section jumps — prefix with base so they work from
  // subpages (/#about). Absolute links (/studio, https://…) are used verbatim.
  const resolve = (href: string) => (href.startsWith("#") ? base + href : href);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "13px clamp(16px,4vw,44px)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        background: "linear-gradient(180deg,rgba(5,6,10,.82),rgba(5,6,10,.32))",
        borderBottom: "1px solid rgba(59,130,246,.15)",
      }}
    >
      <a href={logoHref} style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            border: "2px solid var(--ac,#3b82f6)",
            background: "rgba(59,130,246,.08)",
            boxShadow: "0 0 0 1px rgba(5,6,10,.9),0 0 14px rgba(59,130,246,.35)",
            fontFamily: press,
            fontSize: 9,
            color: "var(--ac,#3b82f6)",
          }}
        >
          {nav.logo}
        </span>
        <span style={{ fontFamily: press, fontSize: 11, letterSpacing: 1, color: "#e8ecf5" }}>
          {nav.wordmark.pre}
          <span style={{ color: "var(--ac,#3b82f6)" }}>{nav.wordmark.sep}</span>
          {nav.wordmark.post}
        </span>
      </a>
      <div style={{ display: "flex", alignItems: "center", gap: "clamp(14px,2.4vw,30px)" }}>
        {nav.links.map((l) => (
          <a
            key={l.href}
            href={resolve(l.href)}
            className="fe-navlink"
            style={{ fontFamily: mono, fontSize: 13, color: "#aeb6c9", letterSpacing: ".5px" }}
          >
            {l.label}
          </a>
        ))}
        <a
          href={resolve(nav.cta.href)}
          className="fe-btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: mono,
            fontSize: 13,
            color: "#05060a",
            background: "var(--ac,#3b82f6)",
            padding: "9px 15px",
            fontWeight: 600,
            boxShadow: "0 0 18px rgba(59,130,246,.4)",
          }}
        >
          {nav.cta.label}
        </a>
      </div>
    </nav>
  );
}
