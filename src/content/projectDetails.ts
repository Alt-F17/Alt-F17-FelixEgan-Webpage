import type { Locale } from "@/i18n/types";

type ByLocale = Record<Locale, string>;
type ByLocaleList = Record<Locale, string[]>;

export type ProjectDetail = {
  title: string;
  overview: ByLocale;
  techStack: { name: string; reason: ByLocale }[];
  challenges: ByLocaleList;
  links: { label: string; url: string; type: "github" | "live" }[];
};

export const projectDetails: Record<string, ProjectDetail> = {
  nputella: {
    title: "NPUtella",
    overview: {
      en: "Local NPU-powered speech-to-text for Snapdragon Windows PCs. Hold Ctrl+Win, speak, release — your words are transcribed offline and pasted instantly. Supports English, French, and bilingual dictation with no cloud dependency, zero latency, and total privacy. Built as a native Rust application using ONNX Runtime with Qualcomm's QNN Execution Provider to run Whisper directly on the NPU.",
      fr: "Transcription vocale locale propulsée par NPU pour les PC Windows Snapdragon. Maintenez Ctrl+Win, parlez, relâchez — vos mots sont transcrits hors ligne et collés instantanément. Supporte la dictée en anglais, français et bilingue, sans dépendance cloud, sans latence et en toute confidentialité. Construit en Rust natif avec ONNX Runtime et le QNN Execution Provider de Qualcomm pour exécuter Whisper directement sur le NPU.",
    },
    techStack: [
      { name: "Rust", reason: { en: "Native Windows app with direct hardware access and zero startup latency", fr: "Application Windows native avec accès direct au matériel et démarrage instantané" } },
      { name: "ONNX Runtime + QNN", reason: { en: "Routes Whisper inference to Qualcomm's NPU in FP16 burst mode", fr: "Achemine l'inférence Whisper vers le NPU de Qualcomm en mode burst FP16" } },
      { name: "Whisper Base", reason: { en: "Multilingual speech recognition model, exported via Qualcomm AI Hub", fr: "Modèle de reconnaissance vocale multilingue, exporté via Qualcomm AI Hub" } },
      { name: "WiX Toolset", reason: { en: "Standalone MSI installer — no dependencies on end-user machines", fr: "Installateur MSI autonome — aucune dépendance sur les machines utilisateurs" } },
    ],
    challenges: {
      en: [
        "Getting Whisper to run on Qualcomm's NPU required ONNX model export through Qualcomm AI Hub with device-specific tensor layouts and context binaries.",
        "Rewrote the entire app from Python to native Rust to eliminate startup latency and enable direct cpal audio capture and SendInput paste.",
        "Built a borderless always-on-top overlay that stays visible across all apps while remaining unobtrusive — with recording, transcribing, and error states.",
        "Implemented local post-processing for bilingual punctuation, code formatting, dictionary expansion, and snippet triggers — all without a network call.",
      ],
      fr: [
        "Faire tourner Whisper sur le NPU de Qualcomm a nécessité l'export du modèle ONNX via Qualcomm AI Hub avec des layouts tensoriels spécifiques à l'appareil.",
        "Réécriture complète de Python vers Rust natif pour éliminer la latence de démarrage et permettre la capture audio directe et le collage via SendInput.",
        "Création d'un overlay sans bordure toujours au premier plan, visible dans toutes les applications tout en restant discret — avec états d'enregistrement, transcription et erreur.",
        "Post-traitement local pour la ponctuation bilingue, le formatage de code, l'expansion de dictionnaire et les déclencheurs de snippets — le tout sans appel réseau.",
      ],
    },
    links: [
      { label: "GitHub", url: "https://github.com/Alt-F17/NPUtella", type: "github" },
      { label: "nputella.app", url: "https://nputella.app", type: "live" },
    ],
  },

  "pluto-ai": {
    title: "PLUTO AI Assistant",
    overview: {
      en: "Personal & Logical Utility Task Organizer — a fully local, open-source AI assistant built with privacy at its core. PLUTO handles personal tasks, reminders, and information retrieval without sending a single byte to external servers. Designed as an extensible framework for anyone who wants an AI assistant they actually own.",
      fr: "Personal & Logical Utility Task Organizer — un assistant IA entièrement local et open source, conçu avec la vie privée comme priorité. PLUTO gère les tâches personnelles, les rappels et la recherche d'information sans envoyer le moindre octet vers des serveurs externes. Conçu comme un cadre extensible pour quiconque veut un assistant IA qu'il possède vraiment.",
    },
    techStack: [
      { name: "Python", reason: { en: "Rapid prototyping and access to the NLP/AI ecosystem", fr: "Prototypage rapide et accès à l'écosystème NLP/IA" } },
      { name: "NLP Libraries", reason: { en: "Natural language understanding for task parsing and intent recognition", fr: "Compréhension du langage naturel pour l'analyse de tâches et la reconnaissance d'intentions" } },
      { name: "Local Inference", reason: { en: "All processing stays on-device — no cloud APIs, no data leaks", fr: "Tout le traitement reste sur l'appareil — pas d'API cloud, pas de fuite de données" } },
    ],
    challenges: {
      en: [
        "Building a genuinely useful assistant that runs entirely locally without relying on cloud APIs like GPT or Claude.",
        "Balancing capability with privacy — local models are smaller and less capable, so the architecture has to compensate with smart task routing.",
        "Designing an extensible plugin system so new capabilities can be added without rewriting core logic.",
      ],
      fr: [
        "Construire un assistant réellement utile qui fonctionne entièrement en local sans dépendre d'API cloud comme GPT ou Claude.",
        "Équilibrer les capacités et la confidentialité — les modèles locaux sont plus petits, donc l'architecture doit compenser avec un routage de tâches intelligent.",
        "Concevoir un système de plugins extensible pour ajouter de nouvelles capacités sans réécrire la logique de base.",
      ],
    },
    links: [
      { label: "GitHub", url: "https://github.com/Alt-F17/P.L.U.T.O.-Personal-Assistant", type: "github" },
      { label: "Report", url: "https://felixegan.me/pluto-report.html", type: "live" },
    ],
  },

  "aura-robot": {
    title: "AURA — Unity Robot Analysis",
    overview: {
      en: "Final robotics project exploring autonomous robot training through reinforcement learning in Unity. Robots learn to navigate and perform tasks in simulated environments using ML-Agents, with reward-driven behavior shaping their decisions over thousands of training iterations. A full Python analysis pipeline handles model mutation, performance parsing, and success-rate visualization.",
      fr: "Projet final de robotique explorant l'entraînement de robots autonomes par apprentissage par renforcement dans Unity. Les robots apprennent à naviguer et accomplir des tâches dans des environnements simulés via ML-Agents, avec un comportement guidé par récompenses qui façonne leurs décisions au fil de milliers d'itérations. Un pipeline d'analyse Python complet gère la mutation de modèles, l'analyse de performance et la visualisation du taux de réussite.",
    },
    techStack: [
      { name: "C# / Unity", reason: { en: "Simulated 3D environments for training and testing robot behaviors", fr: "Environnements 3D simulés pour l'entraînement et le test des comportements robotiques" } },
      { name: "ML-Agents", reason: { en: "Unity's reinforcement learning toolkit for training autonomous agents", fr: "Boîte à outils d'apprentissage par renforcement de Unity pour entraîner des agents autonomes" } },
      { name: "Python", reason: { en: "Model mutation, training data parsing, and performance visualization", fr: "Mutation de modèles, analyse des données d'entraînement et visualisation de performance" } },
      { name: "Reinforcement Learning", reason: { en: "Reward-shaped behavior — agents improve through trial and error, not hardcoded rules", fr: "Comportement façonné par récompenses — les agents s'améliorent par essai-erreur, pas par règles codées en dur" } },
    ],
    challenges: {
      en: [
        "Designing reward functions that produce meaningful robot behaviors without over-fitting to exploitable shortcuts.",
        "Iterating on model mutations across multiple generations to evolve better-performing agents — visible in the project's mutation pipeline.",
        "Parsing and visualizing training data to identify which models actually learned versus which got lucky in specific scenarios.",
        "Bridging Unity's C# simulation environment with Python analysis scripts for a seamless train-evaluate-mutate loop.",
      ],
      fr: [
        "Concevoir des fonctions de récompense qui produisent des comportements robotiques significatifs sans surapprentissage de raccourcis exploitables.",
        "Itérer sur les mutations de modèles à travers plusieurs générations pour faire évoluer des agents plus performants — visible dans le pipeline de mutation du projet.",
        "Analyser et visualiser les données d'entraînement pour identifier les modèles qui ont réellement appris versus ceux qui ont eu de la chance.",
        "Relier l'environnement de simulation C# de Unity avec les scripts d'analyse Python pour une boucle entraîner-évaluer-muter fluide.",
      ],
    },
    links: [
      { label: "GitHub", url: "https://github.com/Alt-F17/Automatic-Unity-Robot-Analysis", type: "github" },
      { label: "Website", url: "https://aura-project-monorepo.vercel.app/", type: "live" },
      { label: "ONNX Breakdown", url: "https://felixegan.me/netronizer.html", type: "live" },
    ],
  },

  cloudsource: {
    title: "CloudSource",
    overview: {
      en: "A globe-first AI travel planner built during a hackathon with my girlfriend. The entire experience orbits around a 3D Cesium globe — panels for flights, culture, hotels, budget, notes, and an AI assistant called Nimbus slide into view as you explore destinations. AI-generated trip plans give you a structured starting point, and shared client-side state keeps everything in sync as you plan.",
      fr: "Un planificateur de voyage IA centré sur un globe, construit lors d'un hackathon avec ma copine. Toute l'expérience gravite autour d'un globe Cesium 3D — des panneaux pour les vols, la culture, les hôtels, le budget, les notes et un assistant IA nommé Nimbus apparaissent au fil de l'exploration. Les plans de voyage générés par IA offrent un point de départ structuré, et l'état partagé côté client garde tout synchronisé.",
    },
    techStack: [
      { name: "Next.js 15 + React 19", reason: { en: "Latest full-stack React framework with server actions and streaming", fr: "Dernier framework React full-stack avec actions serveur et streaming" } },
      { name: "Cesium", reason: { en: "3D globe rendering with flight route visualization and airport markers", fr: "Rendu de globe 3D avec visualisation de routes aériennes et marqueurs d'aéroports" } },
      { name: "Google AI", reason: { en: "Structured trip plan generation with validated JSON output", fr: "Génération de plans de voyage structurés avec sortie JSON validée" } },
      { name: "Framer Motion", reason: { en: "Smooth panel transitions and orbital UI animations", fr: "Transitions de panneaux fluides et animations d'interface orbitale" } },
    ],
    challenges: {
      en: [
        "Integrating a full 3D Cesium globe into a multi-panel React app under hackathon time pressure.",
        "Keeping trip state synchronized across globe navigation, flight search, budget tracking, and AI chat — all in shared client-side state.",
        "Building the AI trip generator to return structured, Zod-validated JSON that the planning flow could consume without manual parsing.",
      ],
      fr: [
        "Intégrer un globe Cesium 3D complet dans une application React multi-panneaux sous la pression d'un hackathon.",
        "Garder l'état du voyage synchronisé entre la navigation sur le globe, la recherche de vols, le suivi du budget et le chat IA — le tout en état partagé côté client.",
        "Construire le générateur de voyage IA pour retourner du JSON structuré et validé par Zod, consommable par le flux de planification sans parsing manuel.",
      ],
    },
    links: [
      { label: "GitHub", url: "https://github.com/Alt-F17/CloudSource", type: "github" },
      { label: "Live", url: "https://cloud-source-eta.vercel.app/", type: "live" },
    ],
  },

  "portfolio-website": {
    title: "Portfolio Website",
    overview: {
      en: "This website — a space-themed developer portfolio built with React, Vite, and Three.js. Features a real-time 3D starfield background, bilingual French/English support with i18n routing, tilt-on-hover project cards, and smooth scroll-triggered animations throughout.",
      fr: "Ce site web — un portfolio développeur à thème spatial construit avec React, Vite et Three.js. Comprend un arrière-plan de champ d'étoiles 3D en temps réel, un support bilingue français/anglais avec routage i18n, des cartes de projets avec effet de tilt au survol, et des animations déclenchées au défilement.",
    },
    techStack: [
      { name: "React + Vite", reason: { en: "Fast builds, instant HMR, and a lean production bundle", fr: "Builds rapides, HMR instantané et bundle de production léger" } },
      { name: "Three.js", reason: { en: "Real-time 3D starfield that responds to scroll and mouse movement", fr: "Champ d'étoiles 3D en temps réel qui réagit au défilement et au mouvement de la souris" } },
      { name: "Tailwind CSS", reason: { en: "Utility-first styling with consistent spacing and responsive breakpoints", fr: "Stylisation utilitaire avec espacement cohérent et points de rupture responsive" } },
      { name: "i18n", reason: { en: "Full bilingual FR/EN content with locale-aware routing", fr: "Contenu bilingue FR/EN complet avec routage sensible à la langue" } },
    ],
    challenges: {
      en: [
        "Performance-tuning Three.js animations to stay smooth on mobile devices without draining battery.",
        "Implementing bilingual content that goes beyond simple string replacement — proper routing, locale persistence, and natural-sounding copy in both languages.",
        "Keeping the space theme visually cohesive across all sections without sacrificing readability or accessibility.",
      ],
      fr: [
        "Optimiser les animations Three.js pour rester fluides sur mobile sans vider la batterie.",
        "Implémenter du contenu bilingue qui va au-delà du simple remplacement de chaînes — routage correct, persistance de la langue et textes naturels dans les deux langues.",
        "Garder le thème spatial visuellement cohérent dans toutes les sections sans sacrifier la lisibilité ou l'accessibilité.",
      ],
    },
    links: [
      { label: "GitHub", url: "https://github.com/Alt-F17/Alt-F17-FelixEgan-Webpage", type: "github" },
    ],
  },

  "sf-study-tools": {
    title: "SF Study Tools",
    overview: {
      en: "A study platform for science, computer science, and mathematics students. Features interactive quizzes with instant feedback, flashcard decks, a searchable code snippet library, debugging challenges, data structure exercises, and algorithm complexity analysis — all designed to make studying active instead of passive.",
      fr: "Une plateforme d'étude pour les étudiants en sciences, informatique et mathématiques. Comprend des quiz interactifs avec rétroaction instantanée, des jeux de flashcards, une bibliothèque de code consultable, des défis de débogage, des exercices sur les structures de données et l'analyse de complexité algorithmique — le tout conçu pour rendre l'étude active plutôt que passive.",
    },
    techStack: [
      { name: "React + TypeScript", reason: { en: "Component-based UI with type safety for complex quiz logic", fr: "Interface à composants avec typage pour la logique de quiz complexe" } },
      { name: "Next.js", reason: { en: "Server-side rendering for fast initial loads and SEO on study content", fr: "Rendu côté serveur pour un chargement initial rapide et le SEO du contenu d'étude" } },
      { name: "Node.js + Express", reason: { en: "Backend for quiz state, progress tracking, and content delivery", fr: "Backend pour l'état des quiz, le suivi de progression et la livraison de contenu" } },
    ],
    challenges: {
      en: [
        "Designing interactive exercises that give meaningful instant feedback — not just right/wrong, but explanations of why.",
        "Organizing diverse content types (flashcards, code snippets, quizzes, debugging challenges) into a cohesive learning flow.",
        "Building session persistence so students don't lose progress when they close the browser.",
      ],
      fr: [
        "Concevoir des exercices interactifs avec une rétroaction instantanée significative — pas juste correct/incorrect, mais des explications du pourquoi.",
        "Organiser des types de contenu variés (flashcards, extraits de code, quiz, défis de débogage) dans un parcours d'apprentissage cohérent.",
        "Construire la persistance de session pour que les étudiants ne perdent pas leur progression en fermant le navigateur.",
      ],
    },
    links: [
      { label: "GitHub", url: "https://github.com/Alt-F17/sf-study-tools", type: "github" },
      { label: "Live", url: "https://sf-study-tools.com", type: "live" },
    ],
  },
};
