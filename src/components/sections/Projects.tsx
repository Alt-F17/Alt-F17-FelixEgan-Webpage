import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageProvider';
import { portfolioCopy } from '@/content/portfolioCopy';

type Project = {
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  image?: string;
  status: 'completed' | 'in-progress';
  id: string; // Added ID for routing
};

const projects: Project[] = [
  {
    title: "PLUTO AI Assistant",
    description: "Personal AI assistant that is fully local, open-source, customizable, and privacy-focused.",
    technologies: ["Python", "Machine Learning", "Natural Language Processing"],
    githubUrl: "https://github.com/Alt-F17/PLUTO",
    status: "in-progress",
    id: "pluto-ai"
  },
  {
    title: "Portfolio Website",
    description: "A space-themed portfolio website showcasing my projects and skills using Three.js and React.",
    technologies: ["React", "Vite", "Three.js", "Tailwind CSS"],
    status: "completed",
    id: "portfolio-website"
  },
  {
    title: "Cybersecurity Tools",
    description: "Collection of ethical hacking and security assessment tools developed during my HTB Academy training.",
    technologies: ["Python", "Bash", "Networking"],
    status: "in-progress",
    id: "cybersecurity-tools"
  },
  {
    title: "DawsHacks Website",
    description: "Website for DawsHacks, a hackathon event at Dawson College, showcasing event details, schedules, and registration.",
    technologies: ["React", "Next.js", "Tailwind CSS"],
    status: "in-progress",
    id: "dawshacks-website"
  },
  {
    title: "STM stat.us",
    description: "Online social platform where users can report real-time downtimes on the STM (Société de transport de Montréal) network, providing a community-driven solution for public transit issues.",
    technologies: ["React", "Node.js", "Express", "MongoDB"],
    status: "in-progress",
    id: "stm-status",
    githubUrl: "https://github.com/Alt-F17/stm-status"
  },
  {
    title: "SF Study Tools",
    description: "A collection of study tools for Dawson College's Science, Computer Science, and Mathematics students to help with their studies, including flashcards, quizzes, and resources.",
    technologies: ["React", "Next.js", "Tailwind CSS"],
    status: "completed",
    id: "sf-study-tools",
    githubUrl: "https://github.com/Alt-F17/sf-study-tools"
  }
];

export const Projects = () => {
  const projectsRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const { locale } = useLanguage();
  const copy = portfolioCopy.projects;

  const addToCardRefs = (el: HTMLDivElement) => {
    if (el && !cardRefs.current.includes(el)) {
      cardRefs.current.push(el);
    }
  };

  const handleTiltMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotX = ((y - rect.height / 2) / (rect.height / 2)) * -7;
    const rotY = ((x - rect.width / 2) / (rect.width / 2)) * 7;
    el.style.transitionDelay = '0ms';
    el.style.transition = 'transform 0.1s ease-out';
    el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    const glow = el.querySelector<HTMLDivElement>('.card-glow');
    if (glow) {
      glow.style.background = `radial-gradient(300px circle at ${x}px ${y}px, rgba(59,130,246,0.15), transparent 70%)`;
    }
  };

  const handleTiltLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.transitionDelay = '0ms';
    el.style.transition = 'transform 0.4s ease-out';
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    const glow = el.querySelector<HTMLDivElement>('.card-glow');
    if (glow) {
      glow.style.background = 'transparent';
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    if (projectsRef.current) observer.observe(projectsRef.current);
    cardRefs.current.forEach(card => observer.observe(card));

    return () => {
      if (projectsRef.current) observer.unobserve(projectsRef.current);
      cardRefs.current.forEach(card => observer.unobserve(card));
    };
  }, []);

  return (
    <section id="projects" className="section">
      <div className="container-padding max-w-5xl mx-auto">
        <div 
          ref={projectsRef}
          className="opacity-0 transform translate-y-4 transition-all duration-700"
        >
          <h2 className="section-title">
            <span className="text-space-accent">/</span> {copy.title[locale]}
          </h2>
          <p className="section-subtitle">{copy.subtitle[locale]}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
          {projects.map((project, index) => (
            <div
              key={project.title}
              ref={addToCardRefs}
              className="opacity-0 transform translate-y-4 transition-all duration-700 group"
              style={{ transitionDelay: `${index * 150}ms` }}
              onMouseMove={handleTiltMove}
              onMouseLeave={handleTiltLeave}
            >
              <Link to={`/projects/${project.id}`} className="block h-full">
                <Card className="h-full border-2 border-[#3b82f6]/20 bg-space-darker hover:border-[#3b82f6]/50 transition-colors duration-300 relative overflow-hidden">
                  <div className="card-glow absolute inset-0 pointer-events-none transition-none" />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      {project.status === "in-progress" && (
                        <span className="text-xs py-1 px-2 rounded bg-[#3b82f6]/20 text-[#3b82f6] border-2 border-[#3b82f6]/30">
                          {copy.inProgress[locale]}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-space-text/70 mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map(tech => (
                        <span 
                          key={tech} 
                          className="text-xs py-1 px-2 rounded bg-space-darker border-2 border-[#3b82f6]/30 text-space-text/80"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-start gap-4">
                    {project.githubUrl && (
                      <Button 
                        variant="ghost"
                        className="text-[#3b82f6] hover:bg-[#3b82f6]/20"
                        asChild
                      >
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                          </svg>
                          {copy.github[locale]}
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
