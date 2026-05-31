import type { Locale } from "@/i18n/types";

type LocalizedString = Record<Locale, string>;

export type BlogPost = {
  slug: string;
  title: LocalizedString;
  excerpt: LocalizedString;
  body: LocalizedString;
  locale: Locale;
  publishedAt: string;
  tags: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "local-smb-homepage-checklist",
    title: {
      en: "Homepage Checklist for Local SMB Sites",
      fr: "Checklist page d'accueil pour sites PME locales",
    },
    excerpt: {
      en: "The five sections that usually matter most for local lead generation.",
      fr: "Les cinq sections qui comptent le plus pour la génération de leads locaux.",
    },
    body: {
      en: "For local companies, your homepage should answer five things quickly: who you help, what you offer, why trust you, what to do next, and where you operate.",
      fr: "Pour les entreprises locales, la page d'accueil doit répondre rapidement à cinq points: qui vous aidez, ce que vous offrez, pourquoi vous faire confiance, quoi faire ensuite, et où vous opérez.",
    },
    locale: "en",
    publishedAt: "2026-02-20",
    tags: ["smb", "conversion", "homepage"],
  },
  {
    slug: "small-business-seo-basics",
    title: {
      en: "Small Business SEO Basics You Can Ship This Week",
      fr: "SEO de base pour petite entreprise à déployer cette semaine",
    },
    excerpt: {
      en: "A practical baseline for indexing, local search, and service intent pages.",
      fr: "Une base pratique pour l'indexation, la recherche locale et les pages de services.",
    },
    body: {
      en: "Most local SEO wins come from consistency: clear service pages, location context, fast pages, and basic schema. Do those before chasing advanced tactics.",
      fr: "La plupart des gains SEO locaux viennent de la constance: pages de services claires, contexte géographique, pages rapides, et schéma de base. Faites cela avant les tactiques avancées.",
    },
    locale: "en",
    publishedAt: "2026-02-21",
    tags: ["seo", "local", "technical"],
  },
  {
    slug: "when-to-redesign-company-site",
    title: {
      en: "When Should You Redesign Your Company Website?",
      fr: "Quand refaire le site web de votre entreprise?",
    },
    excerpt: {
      en: "Signal-based triggers that suggest your current site is costing you leads.",
      fr: "Signaux concrets indiquant que votre site actuel vous coûte des leads.",
    },
    body: {
      en: "If your site cannot communicate value in under ten seconds or fails basic mobile tasks, a redesign is usually cheaper than continuing with lost opportunities.",
      fr: "Si votre site n'explique pas votre valeur en moins de dix secondes ou échoue sur mobile, une refonte coûte souvent moins cher que la perte d'opportunités.",
    },
    locale: "en",
    publishedAt: "2026-02-22",
    tags: ["redesign", "ux", "sales"],
  },
];

export const getBlogPostBySlug = (slug: string) =>
  blogPosts.find((post) => post.slug === slug);
