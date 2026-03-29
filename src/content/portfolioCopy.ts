import type { Locale } from "@/i18n/types";

type ByLocale = Record<Locale, string>;

export const portfolioCopy = {
  header: {
    nav: {
      home: { en: "Home", fr: "Accueil" } satisfies ByLocale,
      about: { en: "About", fr: "A propos" } satisfies ByLocale,
      skills: { en: "Skills", fr: "Competences" } satisfies ByLocale,
      projects: { en: "Projects", fr: "Projets" } satisfies ByLocale,
      contact: { en: "Contact", fr: "Contact" } satisfies ByLocale,
      studio: { en: "Studio", fr: "Studio" } satisfies ByLocale,
      resume: { en: "Resume", fr: "CV" } satisfies ByLocale,
    },
  },
  hero: {
    eyebrow: { en: "Hi, my name is", fr: "Salut, je m'appelle" } satisfies ByLocale,
    role: {
      en: "Python Developer & ML Enthusiast",
      fr: "Developpeur Python et passionne de ML",
    } satisfies ByLocale,
    description: {
      en: "I'm an 18-year-old developer passionate about creating innovative solutions to real-world problems. Currently studying Science, Computer Science, and Mathematics at Dawson College in Montreal and working on various projects.",
      fr: "Je suis un developpeur de 18 ans passionne par la creation de solutions innovantes a des problemes reels. J'etudie presentement en sciences, informatique et mathematiques au College Dawson a Montreal et je travaille sur plusieurs projets.",
    } satisfies ByLocale,
    viewProjects: { en: "View My Projects", fr: "Voir mes projets" } satisfies ByLocale,
    contact: { en: "Contact Me", fr: "Me contacter" } satisfies ByLocale,
  },
  about: {
    title: { en: "About Me", fr: "A propos de moi" } satisfies ByLocale,
    paragraphs: {
      en: [
        "I'm Felix, a software developer with a passion for creating fun, new solutions to real-world problems. I love making fun projects that help people and aim to make the world more innovative, efficient, and technologically accessible to all.",
        "Currently studying Science, Computer Science, and Mathematics at Dawson College in Montreal, I'm helping the next generation of developers through mentorship and events like DawsHacks.",
        "My journey in programming began in 2019, where I discovered my passion for coding through Python during the pandemic. Since then, I've expanded my skills to web development, machine learning, MCP orchestration, and cybersecurity.",
        "When I'm not coding, I'm probably rock climbing, making music, creating content on my social media page, or riding through the city on my OneWheel. I believe that tech can create a positive change in the world and I am committed to using my skills to contribute to that vision.",
      ],
      fr: [
        "Je suis Felix, un developpeur logiciel passionne par la creation de nouvelles solutions a des problemes concrets. J'aime creer des projets utiles qui aident les gens et rendent la technologie plus accessible.",
        "Je suis presentement en sciences, informatique et mathematiques au College Dawson a Montreal, et j'aide la prochaine generation de developpeurs via du mentorat et des evenements comme DawsHacks.",
        "Mon parcours en programmation a commence en 2019 avec Python pendant la pandemie. Depuis, j'ai elargi mes competences en developpement web, apprentissage machine, orchestration MCP et cybers securite.",
        "Quand je ne code pas, je fais souvent de l'escalade, de la musique, du contenu web ou des rides en OneWheel. Je crois que la technologie peut avoir un impact positif et je veux contribuer a cette vision.",
      ],
    },
    labels: {
      age: { en: "age", fr: "age" } satisfies ByLocale,
      education: { en: "education", fr: "education" } satisfies ByLocale,
      focus: { en: "focus", fr: "focus" } satisfies ByLocale,
      hobbies: { en: "hobbies", fr: "loisirs" } satisfies ByLocale,
    },
  },
  skills: {
    title: { en: "Skills & Interests", fr: "Competences et interets" } satisfies ByLocale,
    subtitle: { en: "What I bring to the table", fr: "Ce que j'apporte" } satisfies ByLocale,
    focusTitle: {
      en: "Current Focus & Aspirations",
      fr: "Focus actuel et aspirations",
    } satisfies ByLocale,
    focusItems: {
      en: [
        "Working on PLUTO - a personal AI assistant that's local, open-source, customizable, and privacy-focused.",
        "Daily work on improving ethical hacking and cybersecurity skills through HackTheBox Academy.",
        "Aspiring to become a part-time ethical hacker (HTB Academy certified) and machine learning engineer.",
        "Active in Dawson College community, working on founding Dawson Coding & DawsHack Dawson Hackathon clubs.",
      ],
      fr: [
        "Travail sur PLUTO - un assistant IA personnel, local, open-source, personnalisable et axe sur la vie privee.",
        "Travail quotidien pour ameliorer mes competences en cybers securite via HackTheBox Academy.",
        "Objectif de devenir hacker ethique a temps partiel (certifie HTB Academy) et ingenieur en apprentissage machine.",
        "Actif dans la communaute du College Dawson, avec Dawson Coding et DawsHack.",
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
      fr: "N'hesitez pas a me contacter pour toute question ou simplement pour dire bonjour.",
    } satisfies ByLocale,
    send: { en: "Send Message", fr: "Envoyer" } satisfies ByLocale,
    connect: { en: "Connect with me", fr: "Me rejoindre" } satisfies ByLocale,
    support: { en: "Support My Work", fr: "Soutenir mon travail" } satisfies ByLocale,
    sentTitle: { en: "Message Sent!", fr: "Message envoye!" } satisfies ByLocale,
    sentBody: {
      en: "Thanks for reaching out. I'll get back to you soon.",
      fr: "Merci pour votre message. Je reviens vers vous rapidement.",
    } satisfies ByLocale,
    buyCoffee: { en: "Buy Me A Coffee:", fr: "Buy Me A Coffee:" } satisfies ByLocale,
  },
  footer: {
    description: {
      en: "Python Developer & ML Enthusiast based in Montreal, creating innovative solutions to real-world problems.",
      fr: "Developpeur Python et passionne de ML a Montreal, je cree des solutions innovantes a des problemes reels.",
    } satisfies ByLocale,
    quickLinks: { en: "Quick Links", fr: "Liens rapides" } satisfies ByLocale,
    aboutMe: { en: "About Me", fr: "A propos" } satisfies ByLocale,
    skills: { en: "Skills", fr: "Competences" } satisfies ByLocale,
    projects: { en: "Projects", fr: "Projets" } satisfies ByLocale,
    contact: { en: "Contact", fr: "Contact" } satisfies ByLocale,
    connect: { en: "Connect", fr: "Reseaux" } satisfies ByLocale,
  },
};
