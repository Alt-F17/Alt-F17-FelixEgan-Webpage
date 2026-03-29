import type { AppMessages } from "@/i18n/types";

export const frMessages: AppMessages = {
  localeLabel: "Langue",
  nav: {
    home: "Accueil",
    services: "Services",
    process: "Processus",
    caseStudies: "Etudes de cas",
    blog: "Blog",
    testimonials: "Temoignages",
    contact: "Contact",
  },
  cta: {
    bookCall: "Reserver un appel",
    requestQuote: "Demander un devis",
    emailDirect: "Email direct",
    viewCaseStudies: "Voir les etudes de cas",
    readBlog: "Lire le blog",
    submit: "Envoyer",
  },
  hero: {
    eyebrow: "Felix Egan Studio",
    title: "Des sites web qui aident les entreprises locales a gagner plus de clients",
    subtitle: "Modele hybride personnel + studio pour les PME",
    description:
      "Je cree des sites web axes sur la conversion pour les entreprises locales a Montreal et ailleurs. Livraison rapide, processus clair et support continu.",
  },
  services: {
    title: "Forfaits",
    subtitle: "Trois offres claires plus option personnalisee",
    items: [
      {
        name: "Starter",
        description: "Lancer rapidement un site credible.",
        price: "CAD $1,200-$1,800",
        timeline: "2-3 semaines",
        deliverables: [
          "Jusqu'a 5 pages",
          "SEO de base",
          "Design mobile-first",
        ],
      },
      {
        name: "Growth",
        description: "Generer plus de leads avec un meilleur tunnel.",
        price: "CAD $2,000-$2,800",
        timeline: "3-5 semaines",
        deliverables: [
          "Jusqu'a 12 pages",
          "Mise en place du funnel",
          "Analytics et suivi des evenements",
        ],
      },
      {
        name: "Premium",
        description: "Systeme complet pour evoluer.",
        price: "CAD $3,000-$4,500",
        timeline: "4-7 semaines",
        deliverables: [
          "Integrations personnalisees",
          "Architecture SEO avancee",
          "Performance et maintenance",
        ],
      },
      {
        name: "Custom",
        description: "Mandat adapte aux contraintes specifiques.",
        price: "A partir de CAD $1,200",
        timeline: "Portee personnalisee",
        deliverables: [
          "Portee flexible",
          "Conseil technique",
          "Feuille de route par phases",
        ],
      },
    ],
  },
  process: {
    title: "Processus",
    subtitle: "Simple, transparent et adapte aux equipes occupees",
    steps: [
      {
        title: "1. Decouverte",
        description: "Objectifs, audience et positionnement de l'offre.",
      },
      {
        title: "2. Production",
        description: "Design et developpement en cycles courts.",
      },
      {
        title: "3. Lancement",
        description: "QA, base SEO, analytics et remise.",
      },
      {
        title: "4. Optimisation",
        description: "Amelioration continue avec donnees reelles.",
      },
    ],
  },
  caseStudies: {
    title: "Etudes de cas",
    subtitle: "Travaux recents presentes avec resultats business",
  },
  blog: {
    title: "Conseils pour les PME locales",
    subtitle: "Notes pratiques sur web, SEO et conversion",
  },
  testimonials: {
    title: "Temoignages",
    subtitle: "Preuves sociales en preparation",
    comingSoon:
      "Les temoignages clients sont en cours de collecte et de validation. Vous pouvez soumettre une recommandation ci-dessous.",
    intakeTitle: "Soumettre une recommandation",
  },
  contact: {
    title: "Demarrer un projet",
    subtitle: "Reserver un appel, demander un devis, ou ecrire par email",
    napTitle: "Informations entreprise",
    napBody: "Felix Egan Studio - Montreal, QC - hello@felixegan.me",
    serviceArea: "Zone de service: Montreal, Laval, Longueuil, et projets a distance.",
  },
  leadForm: {
    title: "Formulaire projet",
    subtitle: "Parlez-moi de votre entreprise et de vos objectifs.",
    fullName: "Nom complet",
    email: "Email",
    company: "Entreprise",
    phone: "Telephone",
    preferredContact: "Contact prefere",
    websiteUrl: "Site actuel",
    budgetRange: "Budget",
    timeline: "Echeancier",
    services: "Services souhaites",
    message: "Details du projet",
    optionEmail: "Email",
    optionPhone: "Telephone",
    success: "Merci. Votre demande a ete envoyee.",
    failure: "Echec de l'envoi. Veuillez reessayer.",
  },
};
