import type { Locale } from "@/i18n/types";

type ByLocale = Record<Locale, string>;

export const portfolioCopy = {
  header: {
    nav: {
      home: { en: "Home", fr: "Accueil" } satisfies ByLocale,
      about: { en: "About", fr: "À propos" } satisfies ByLocale,
      skills: { en: "Skills", fr: "Compétences" } satisfies ByLocale,
      projects: { en: "Projects", fr: "Projets" } satisfies ByLocale,
      contact: { en: "Contact", fr: "Contact" } satisfies ByLocale,
      studio: { en: "Studio", fr: "Studio" } satisfies ByLocale,
    },
  },
  hero: {
    eyebrow: { en: "Hi, my name is", fr: "Salut, je m'appelle" } satisfies ByLocale,
    role: {
      en: "Freelance Web Developer — Montreal",
      fr: "Développeur Web Freelance — Montréal",
    } satisfies ByLocale,
    description: {
      en: "I build fast, bilingual websites for local Montreal businesses — trades, contractors, health & wellness, and professional services. Hand-coded in React and Next.js with a broader passion for AI, cybersecurity, and open-source tools.",
      fr: "Je crée des sites web rapides et bilingues pour les entreprises locales de Montréal — construction, santé, services professionnels. Codés à la main en React et Next.js, avec une passion pour l'IA, la cybersécurité et les outils open source.",
    } satisfies ByLocale,
    viewProjects: { en: "View My Projects", fr: "Voir mes projets" } satisfies ByLocale,
    contact: { en: "Contact Me", fr: "Me contacter" } satisfies ByLocale,
    studio: { en: "Studio", fr: "Studio" } satisfies ByLocale,
  },
  about: {
    title: { en: "About Me", fr: "À propos de moi" } satisfies ByLocale,
    paragraphs: {
      en: [
        "I'm Felix — a developer and designer driven by a passion for crafting seamless, aesthetically refined digital experiences. I care deeply about the details: clean interfaces, fluid interactions, and code that's built to last.",
        "Currently pursuing a Computer Science degree at UBC's Okanagan campus, I bring a strong foundation in software engineering, AI, and cybersecurity to every project I take on.",
        "I started programming in 2019 and haven't looked back. From building performant React and Next.js applications to exploring machine learning and MCP orchestration, I'm always pushing the boundaries of what I can create.",
        "I believe great technology should feel invisible — intuitive, fast, and purposeful. That philosophy drives everything I build, whether it's a client website, an open-source tool, or a personal experiment.",
      ],
      fr: [
        "Je suis Félix — développeur et designer animé par une passion pour la création d'expériences numériques fluides et esthétiquement soignées. Je porte une attention particulière aux détails : interfaces épurées, interactions fluides et code durable.",
        "Présentement en baccalauréat en informatique à l'UBC campus Okanagan, j'apporte une solide formation en génie logiciel, IA et cybersécurité à chacun de mes projets.",
        "J'ai commencé à programmer en 2019 et je n'ai jamais arrêté. De la création d'applications React et Next.js performantes à l'exploration de l'apprentissage machine et de l'orchestration MCP, je repousse constamment mes limites.",
        "Je crois que la bonne technologie doit être invisible — intuitive, rapide et intentionnelle. Cette philosophie guide tout ce que je construis, qu'il s'agisse d'un site client, d'un outil open source ou d'une expérience personnelle.",
      ],
    },
    labels: {
      age: { en: "age", fr: "âge" } satisfies ByLocale,
      education: { en: "education", fr: "formation" } satisfies ByLocale,
      focus: { en: "focus", fr: "focus" } satisfies ByLocale,
      hobbies: { en: "hobbies", fr: "loisirs" } satisfies ByLocale,
    },
    values: {
      focus: {
        en: "Web Development, AI, Cybersecurity",
        fr: "Développement web, IA, Cybersécurité",
      } satisfies ByLocale,
      hobbies: {
        en: "Rock Climbing, Music, Design",
        fr: "Escalade, Musique, Design",
      } satisfies ByLocale,
    },
  },
  skills: {
    title: { en: "Skills & Interests", fr: "Compétences et intérêts" } satisfies ByLocale,
    subtitle: { en: "What I bring to the table", fr: "Ce que j'apporte" } satisfies ByLocale,
    focusTitle: {
      en: "Current Focus & Aspirations",
      fr: "Focus actuel et aspirations",
    } satisfies ByLocale,
    focusItems: {
      en: [
        "Building fast React and Next.js websites for local service businesses.",
        "Designing bilingual French and English site structures for Montreal customers.",
        "Keeping projects hand-coded, maintainable, and free from WordPress page-builder bloat.",
        "Active in the Dawson College community, including developer mentorship and DawsHacks.",
      ],
      fr: [
        "Création de sites React et Next.js rapides pour les entreprises de services locales.",
        "Conception de structures bilingues français et anglais pour les clients de Montréal.",
        "Projets codés à la main, maintenables et sans lourdeur de page builder WordPress.",
        "Actif dans la communauté du Collège Dawson, notamment en mentorat développeur et avec DawsHacks.",
      ],
    },
  },
  projects: {
    title: { en: "Projects", fr: "Projets" } satisfies ByLocale,
    subtitle: { en: "What I've been working on", fr: "Ce sur quoi je travaille" } satisfies ByLocale,
    inProgress: { en: "In Progress", fr: "En cours" } satisfies ByLocale,
    github: { en: "GitHub", fr: "GitHub" } satisfies ByLocale,
  },
  contact: {
    title: { en: "Contact", fr: "Contact" } satisfies ByLocale,
    subtitle: { en: "Let's get in touch", fr: "Parlons-en" } satisfies ByLocale,
    sendMessage: { en: "Send me a message", fr: "Envoyez-moi un message" } satisfies ByLocale,
    yourName: { en: "Your Name", fr: "Votre nom" } satisfies ByLocale,
    yourEmail: { en: "Your Email", fr: "Votre email" } satisfies ByLocale,
    message: { en: "Message", fr: "Message" } satisfies ByLocale,
    messagePlaceholder: {
      en: "Feel free to reach out with any questions or just to say hi!",
      fr: "N'hésitez pas à me contacter pour toute question ou simplement pour dire bonjour.",
    } satisfies ByLocale,
    send: { en: "Send Message", fr: "Envoyer" } satisfies ByLocale,
    sending: { en: "Sending...", fr: "Envoi..." } satisfies ByLocale,
    connect: { en: "Connect with me", fr: "Me rejoindre" } satisfies ByLocale,
    support: { en: "Support My Work", fr: "Soutenir mon travail" } satisfies ByLocale,
    sentTitle: { en: "Message Sent!", fr: "Message envoyé!" } satisfies ByLocale,
    sentBody: {
      en: "Thanks for reaching out. I'll get back to you soon.",
      fr: "Merci pour votre message. Je reviens vers vous rapidement.",
    } satisfies ByLocale,
    errorTitle: { en: "Message not sent", fr: "Message non envoyé" } satisfies ByLocale,
    errorBody: {
      en: "Please try again or email me directly at felix.egan.dev@gmail.com.",
      fr: "Veuillez réessayer ou m'écrire directement à felix.egan.dev@gmail.com.",
    } satisfies ByLocale,
    buyCoffee: { en: "Buy Me A Coffee:", fr: "Acheter un café:" } satisfies ByLocale,
  },
  footer: {
    description: {
      en: "Freelance web developer in Montreal building fast, bilingual websites for local businesses.",
      fr: "Développeur web freelance à Montréal, je crée des sites rapides et bilingues pour les entreprises locales.",
    } satisfies ByLocale,
    quickLinks: { en: "Quick Links", fr: "Liens rapides" } satisfies ByLocale,
    aboutMe: { en: "About Me", fr: "À propos" } satisfies ByLocale,
    skills: { en: "Skills", fr: "Compétences" } satisfies ByLocale,
    projects: { en: "Projects", fr: "Projets" } satisfies ByLocale,
    contact: { en: "Contact", fr: "Contact" } satisfies ByLocale,
    connect: { en: "Connect", fr: "Réseaux" } satisfies ByLocale,
  },
};
