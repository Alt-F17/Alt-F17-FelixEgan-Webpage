import type { AppMessages } from "@/i18n/types";

export const enMessages: AppMessages = {
  localeLabel: "Language",
  nav: {
    home: "Home",
    services: "Services",
    process: "Process",
    caseStudies: "Case Studies",
    blog: "Blog",
    testimonials: "Testimonials",
    contact: "Contact",
  },
  cta: {
    bookCall: "Book Discovery Call",
    requestQuote: "Request Quote",
    emailDirect: "Email Direct",
    viewCaseStudies: "View Case Studies",
    readBlog: "Read the Blog",
    submit: "Submit",
  },
  hero: {
    eyebrow: "Felix Egan Studio",
    title: "Websites That Help Local Companies Win More Customers",
    subtitle: "Hybrid personal + studio delivery for SMB growth",
    description:
      "I build conversion-focused websites for local businesses in Montreal and beyond. Fast delivery, clear process, and ongoing support.",
  },
  services: {
    title: "Service Packages",
    subtitle: "Three clear offers plus custom scope",
    items: [
      {
        name: "Starter",
        description: "Launch a credible website fast.",
        price: "CAD $1,200-$1,800",
        timeline: "2-3 weeks",
        deliverables: [
          "Up to 5 pages",
          "Core SEO setup",
          "Mobile-first design",
        ],
      },
      {
        name: "Growth",
        description: "Drive more leads with better conversion flows.",
        price: "CAD $2,000-$2,800",
        timeline: "3-5 weeks",
        deliverables: [
          "Up to 12 pages",
          "Lead funnel setup",
          "Analytics and event tracking",
        ],
      },
      {
        name: "Premium",
        description: "Full-site system for scaling operations.",
        price: "CAD $3,000-$4,500",
        timeline: "4-7 weeks",
        deliverables: [
          "Custom integrations",
          "Advanced SEO architecture",
          "Performance and maintenance",
        ],
      },
      {
        name: "Custom",
        description: "Tailored engagement for unusual constraints.",
        price: "From CAD $1,200",
        timeline: "Custom scope",
        deliverables: [
          "Flexible scope",
          "Technical consulting",
          "Phased roadmap",
        ],
      },
    ],
  },
  process: {
    title: "Delivery Process",
    subtitle: "Simple, transparent, and built for busy teams",
    steps: [
      {
        title: "1. Discovery",
        description: "Business goals, audience, and offer positioning.",
      },
      {
        title: "2. Build",
        description: "Design and development in short feedback cycles.",
      },
      {
        title: "3. Launch",
        description: "QA, SEO baseline, analytics, and handoff.",
      },
      {
        title: "4. Improve",
        description: "Iteration with data-driven updates and support.",
      },
    ],
  },
  caseStudies: {
    title: "Case Studies",
    subtitle: "Recent work reframed around business outcomes",
  },
  blog: {
    title: "Insights for Local SMB Teams",
    subtitle: "Practical website, SEO, and conversion notes",
  },
  testimonials: {
    title: "Testimonials",
    subtitle: "Social proof in progress",
    comingSoon:
      "Client testimonials are being collected and reviewed. You can submit an endorsement below.",
    intakeTitle: "Submit an Endorsement",
  },
  contact: {
    title: "Start a Project",
    subtitle: "Book a call, request a quote, or email directly",
    napTitle: "Business Details",
    napBody: "Felix Egan Studio - Montreal, QC - hello@felixegan.me",
    serviceArea: "Service area: Montreal, Laval, Longueuil, and remote projects.",
  },
  leadForm: {
    title: "Project Intake",
    subtitle: "Tell me about your business and goals.",
    fullName: "Full Name",
    email: "Email",
    company: "Company",
    phone: "Phone",
    preferredContact: "Preferred Contact",
    websiteUrl: "Current Website",
    budgetRange: "Budget Range",
    timeline: "Timeline",
    services: "Services Needed",
    message: "Project Details",
    optionEmail: "Email",
    optionPhone: "Phone",
    success: "Thanks. Your request was sent.",
    failure: "Submission failed. Please try again.",
  },
};
