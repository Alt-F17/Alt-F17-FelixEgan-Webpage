import type { AppMessages } from "@/i18n/types";

export const frMessages: AppMessages = {
  localeLabel: "Langue",
  nav: {
    home: "Accueil",
    services: "Services",
    process: "Processus",
    caseStudies: "Études de cas",
    blog: "Blog",
    testimonials: "Témoignages",
    contact: "Contact",
  },
  cta: {
    bookCall: "Réserver un appel",
    requestQuote: "Demander un devis",
    emailDirect: "Email direct",
    viewCaseStudies: "Voir les études de cas",
    readBlog: "Lire le blog",
    submit: "Envoyer",
  },
  hero: {
    eyebrow: "Felix Egan Studio",
    title: "Des sites web qui aident les entreprises locales à gagner plus de clients",
    subtitle: "Modèle hybride personnel + studio pour les PME",
    description:
      "Je crée des sites web axés sur la conversion pour les entreprises locales à Montréal et ailleurs. Livraison rapide, processus clair et support continu.",
  },
  services: {
    title: "Forfaits",
    subtitle: "Trois offres claires plus option personnalisée",
    items: [
      {
        name: "Starter",
        description: "Lancer rapidement un site crédible.",
        price: "CAD $1,200-$1,800",
        timeline: "2-3 semaines",
        deliverables: [
          "Jusqu'à 5 pages",
          "SEO de base",
          "Design mobile-first",
        ],
      },
      {
        name: "Growth",
        description: "Générer plus de leads avec un meilleur tunnel.",
        price: "CAD $2,000-$2,800",
        timeline: "3-5 semaines",
        deliverables: [
          "Jusqu'à 12 pages",
          "Mise en place du funnel",
          "Analytics et suivi des événements",
        ],
      },
      {
        name: "Premium",
        description: "Système complet pour évoluer.",
        price: "CAD $3,000-$4,500",
        timeline: "4-7 semaines",
        deliverables: [
          "Intégrations personnalisées",
          "Architecture SEO avancée",
          "Performance et maintenance",
        ],
      },
      {
        name: "Custom",
        description: "Mandat adapté aux contraintes spécifiques.",
        price: "À partir de CAD $1,200",
        timeline: "Portée personnalisée",
        deliverables: [
          "Portée flexible",
          "Conseil technique",
          "Feuille de route par phases",
        ],
      },
    ],
  },
  process: {
    title: "Processus",
    subtitle: "Simple, transparent et adapté aux équipes occupées",
    steps: [
      {
        title: "1. Découverte",
        description: "Objectifs, audience et positionnement de l'offre.",
      },
      {
        title: "2. Production",
        description: "Design et développement en cycles courts.",
      },
      {
        title: "3. Lancement",
        description: "QA, base SEO, analytics et remise.",
      },
      {
        title: "4. Optimisation",
        description: "Amélioration continue avec données réelles.",
      },
    ],
  },
  caseStudies: {
    title: "Études de cas",
    subtitle: "Travaux récents présentés avec résultats business",
  },
  blog: {
    title: "Conseils pour les PME locales",
    subtitle: "Notes pratiques sur web, SEO et conversion",
  },
  testimonials: {
    title: "Témoignages",
    subtitle: "Preuves sociales en préparation",
    comingSoon:
      "Les témoignages clients sont en cours de collecte et de validation. Vous pouvez soumettre une recommandation ci-dessous.",
    intakeTitle: "Soumettre une recommandation",
  },
  contact: {
    title: "Démarrer un projet",
    subtitle: "Demandez un appel de découverte et je vous reviens avec les prochaines étapes.",
    napTitle: "Informations entreprise",
    napBody: "Felix Egan Studio - Montréal, QC - felix.egan.dev@gmail.com",
    serviceArea: "Zone de service: Montréal, Laval, Longueuil, et projets à distance.",
  },
  leadForm: {
    title: "Demande d'appel de découverte",
    subtitle: "Les propriétaires d'entreprise et les particuliers peuvent utiliser ce formulaire.",
    fullName: "Nom complet",
    email: "Email",
    company: "Entreprise (optionnel)",
    phone: "Téléphone",
    preferredContact: "Contact préféré",
    websiteUrl: "Site actuel",
    budgetRange: "Budget",
    timeline: "Échéancier",
    services: "Services souhaités",
    message: "Détails du projet",
    optionEmail: "Email",
    optionPhone: "Téléphone",
    success: "Merci. Votre demande d'appel de découverte a été envoyée.",
    failure: "Échec de l'envoi. Veuillez réessayer.",
  },
};
