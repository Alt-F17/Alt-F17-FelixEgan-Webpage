import type { Locale } from "@/i18n/types";

type LocalizedString = Record<Locale, string>;

export type CaseStudy = {
  slug: string;
  industry: LocalizedString;
  title: LocalizedString;
  excerpt: LocalizedString;
  problem: LocalizedString;
  scope: LocalizedString;
  solution: LocalizedString;
  result: LocalizedString;
  tools: string[];
  timeline: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "dawshacks-event-site",
    industry: {
      en: "Events",
      fr: "Événements",
    },
    title: {
      en: "DawsHacks Event Website Rebuild",
      fr: "Refonte du site événement DawsHacks",
    },
    excerpt: {
      en: "Repositioned student event pages into a cleaner registration funnel with better mobile completion.",
      fr: "Repositionnement des pages événement avec un tunnel d'inscription plus clair et mobile.",
    },
    problem: {
      en: "The original site made registration details hard to find on mobile.",
      fr: "Le site original rendait les informations d'inscription difficiles à trouver sur mobile.",
    },
    scope: {
      en: "Navigation redesign, content structure cleanup, CTA hierarchy, and performance tuning.",
      fr: "Refonte navigation, restructuration contenu, hiérarchie CTA, et optimisation performance.",
    },
    solution: {
      en: "Built a simpler information architecture with clear deadlines and registration actions.",
      fr: "Création d'une architecture simple avec dates limites claires et actions d'inscription.",
    },
    result: {
      en: "Faster onboarding path for participants and clearer sponsor visibility.",
      fr: "Parcours plus rapide pour les participants et meilleure visibilité des commanditaires.",
    },
    tools: ["React", "Tailwind", "Vite"],
    timeline: "4 weeks",
  },
  {
    slug: "sf-study-tools-platform",
    industry: {
      en: "Education",
      fr: "Éducation",
    },
    title: {
      en: "SF Study Tools Content Platform",
      fr: "Plateforme de contenu SF Study Tools",
    },
    excerpt: {
      en: "Designed a content-heavy platform that remained fast and readable for repeat users.",
      fr: "Conçu une plateforme riche en contenu restant rapide et lisible pour les utilisateurs réguliers.",
    },
    problem: {
      en: "Users needed quick access to specific resources without menu overload.",
      fr: "Les utilisateurs avaient besoin d'accès rapide aux ressources sans surcharge de menu.",
    },
    scope: {
      en: "Taxonomy updates, search-friendly structure, and improved page templates.",
      fr: "Mise à jour taxonomie, structure orientée recherche, et meilleurs gabarits de pages.",
    },
    solution: {
      en: "Organized resources by intent and introduced clearer section wayfinding.",
      fr: "Organisation des ressources par intention et guidage plus clair entre sections.",
    },
    result: {
      en: "Better content discoverability and lower friction for repeat visits.",
      fr: "Meilleure découvrabilité du contenu et friction réduite pour les visites récurrentes.",
    },
    tools: ["React", "TypeScript", "Tailwind"],
    timeline: "6 weeks",
  },
  {
    slug: "portfolio-to-studio-shift",
    industry: {
      en: "Professional Services",
      fr: "Services professionnels",
    },
    title: {
      en: "Personal Portfolio to Lead-Gen Studio Site",
      fr: "Transition portfolio personnel vers site studio orientée leads",
    },
    excerpt: {
      en: "Converted a personal site into a bilingual local-business acquisition channel.",
      fr: "Conversion d'un site personnel en canal bilingue d'acquisition pour entreprises locales.",
    },
    problem: {
      en: "The site signaled student portfolio instead of business-ready delivery.",
      fr: "Le site communiquait un portfolio étudiant au lieu d'une offre entreprise.",
    },
    scope: {
      en: "Rebrand, bilingual UX, SEO architecture, and quote intake backend.",
      fr: "Rebranding, UX bilingue, architecture SEO, et backend de devis.",
    },
    solution: {
      en: "Introduced offer packaging, conversion-first CTAs, and structured case studies.",
      fr: "Introduction de forfaits, CTA orientés conversion, et études de cas structurées.",
    },
    result: {
      en: "Clearer positioning for SMB prospects and stronger outreach readiness.",
      fr: "Positionnement plus clair pour les PME et meilleure préparation outreach.",
    },
    tools: ["React", "Supabase", "Plausible"],
    timeline: "3 weeks",
  },
];

export const getCaseStudyBySlug = (slug: string) =>
  caseStudies.find((item) => item.slug === slug);
