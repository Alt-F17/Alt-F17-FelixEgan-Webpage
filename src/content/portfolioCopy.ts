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
        "I'm Felix, a software developer with a passion for creating fun, new solutions to real-world problems. I love making fun projects that help people and aim to make the world more innovative, efficient, and technologically accessible to all.",
        "Currently studying Science, Computer Science, and Mathematics at Dawson College in Montreal, I'm helping the next generation of developers through mentorship and events like DawsHacks.",
        "My journey in programming began in 2019, where I discovered my passion for coding through Python during the pandemic. Since then, I've expanded my skills to web development, machine learning, MCP orchestration, and cybersecurity.",
        "When I'm not coding, I'm probably rock climbing, making music, creating content on my social media page, or riding through the city on my OneWheel. I believe that tech can create a positive change in the world and I am committed to using my skills to contribute to that vision.",
      ],
      fr: [
        "Je suis Félix, un développeur logiciel passionné par la création de nouvelles solutions à des problèmes concrets. J'aime créer des projets utiles qui aident les gens et rendent la technologie plus accessible.",
        "Je suis présentement en sciences, informatique et mathématiques au Collège Dawson à Montréal, et j'aide la prochaine génération de développeurs via du mentorat et des événements comme DawsHacks.",
        "Mon parcours en programmation a commencé en 2019 avec Python pendant la pandémie. Depuis, j'ai élargi mes compétences en développement web, apprentissage machine, orchestration MCP et cybersécurité.",
        "Quand je ne code pas, je fais souvent de l'escalade, de la musique, du contenu web ou des rides en OneWheel. Je crois que la technologie peut avoir un impact positif et je veux contribuer à cette vision.",
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
        en: "React, Next.js, Web Development",
        fr: "React, Next.js, développement web",
      } satisfies ByLocale,
      hobbies: {
        en: "Rock Climbing, Music, Writing",
        fr: "Escalade, Musique, Écriture",
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
