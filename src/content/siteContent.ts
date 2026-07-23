import { useEffect, useState } from "react";

/**
 * Types + loader for the single JSON source of truth (public/content/site.json).
 * Everything the site renders as text/data is fetched from that file at runtime,
 * so editing content never requires a code change.
 */

export type NavLink = { label: string; href: string };
export type HeroAction = { label: string; href: string; variant: "primary" | "outline" | "ghost"; trailing?: string };
export type ProfileField = { label: string; value: string };
export type SkillGroup = { name: string; icon: string; items: string[] };
export type ProjectLink = { label: string; url: string; icon: string };
export type Project = {
  slug: string;
  title: string;
  category: string;
  year: string;
  glyph: string;
  status: string;
  overview: string;
  tech: string[];
  links: ProjectLink[];
};
export type Social = { handle: string; url: string; icon: string };
export type TermLine = { c?: string; t?: string; w?: number; pre?: boolean; banner?: boolean };

export type ProjectDetail = {
  title: string;
  category: string;
  year: string;
  status: string;
  overview: string;
  techStack: { name: string; reason: string }[];
  challenges: string[];
  links: { label: string; url: string; type: "github" | "live" }[];
};

export type SiteContent = {
  meta: { title: string; description: string; author: string; siteUrl: string };
  theme: { accent: string; accentBright: string; terminalGreen: string; starDensity: number };
  nav: {
    logo: string;
    wordmark: { pre: string; sep: string; post: string };
    links: NavLink[];
    cta: NavLink;
  };
  scrollHint: string;
  hero: { greeting: string; name: string; role: string; tagline: string; actions: HeroAction[] };
  about: {
    index: string;
    label: string;
    heading: string;
    paragraphs: string[];
    profile: { title: string; fields: ProfileField[] };
  };
  skills: {
    index: string;
    label: string;
    heading: string;
    subhead: string;
    groups: SkillGroup[];
    focus: { title: string; items: string[] };
  };
  work: {
    index: string;
    label: string;
    heading: string;
    subhead: string;
    cta: NavLink;
    projects: Project[];
  };
  contact: {
    index: string;
    label: string;
    heading: string;
    body: string;
    email: string;
    cta: { label: string; prefix: string };
    socials: Social[];
  };
  footer: { copyright: string; tagline: string; metaLines: string[] };
  terminal: {
    prompt: string;
    banner: string[];
    boot: TermLine[];
    colors: Record<string, string>;
    completions: string[];
    autoRun: string;
    commands: Record<string, TermLine[]>;
  };
  projectDetails: Record<string, ProjectDetail>;
  projectAliases: Record<string, string>;
};

let cached: SiteContent | null = null;
let inflight: Promise<SiteContent> | null = null;

export function loadSiteContent(): Promise<SiteContent> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetch("/content/site.json", { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error(`site.json ${r.status}`);
        return r.json();
      })
      .then((data: SiteContent) => {
        cached = data;
        return data;
      });
  }
  return inflight;
}

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent | null>(cached);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let alive = true;
    loadSiteContent()
      .then((c) => alive && setContent(c))
      .catch((e) => alive && setError(e));
    return () => {
      alive = false;
    };
  }, []);

  return { content, error, loading: !content && !error };
}

/** Resolve a project slug through the alias table (for legacy /projects/:id links). */
export function resolveProjectSlug(content: SiteContent, id: string): string {
  if (content.projectDetails[id]) return id;
  return content.projectAliases[id] ?? id;
}
