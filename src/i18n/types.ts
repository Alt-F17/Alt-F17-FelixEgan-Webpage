export type Locale = "en" | "fr";

export type NavMessages = {
  home: string;
  services: string;
  process: string;
  caseStudies: string;
  blog: string;
  testimonials: string;
  contact: string;
};

export type CtaMessages = {
  bookCall: string;
  requestQuote: string;
  emailDirect: string;
  viewCaseStudies: string;
  readBlog: string;
  submit: string;
};

export type HeroMessages = {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
};

export type ServiceItem = {
  name: string;
  description: string;
  price: string;
  timeline: string;
  deliverables: string[];
};

export type ProcessStep = {
  title: string;
  description: string;
};

export type LeadFormMessages = {
  title: string;
  subtitle: string;
  fullName: string;
  email: string;
  company: string;
  phone: string;
  preferredContact: string;
  websiteUrl: string;
  budgetRange: string;
  timeline: string;
  services: string;
  message: string;
  optionEmail: string;
  optionPhone: string;
  success: string;
  failure: string;
};

export type AppMessages = {
  localeLabel: string;
  nav: NavMessages;
  cta: CtaMessages;
  hero: HeroMessages;
  services: {
    title: string;
    subtitle: string;
    items: ServiceItem[];
  };
  process: {
    title: string;
    subtitle: string;
    steps: ProcessStep[];
  };
  caseStudies: {
    title: string;
    subtitle: string;
  };
  blog: {
    title: string;
    subtitle: string;
  };
  testimonials: {
    title: string;
    subtitle: string;
    comingSoon: string;
    intakeTitle: string;
  };
  contact: {
    title: string;
    subtitle: string;
    napTitle: string;
    napBody: string;
    serviceArea: string;
  };
  leadForm: LeadFormMessages;
};
