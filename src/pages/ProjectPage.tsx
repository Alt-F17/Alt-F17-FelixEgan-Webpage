import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SpaceBackground from "@/components/three/SpaceBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/i18n/LanguageProvider";
import { projectDetails } from "@/content/projectDetails";

const ProjectPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { locale } = useLanguage();
  const detail = projectId ? projectDetails[projectId] : undefined;

  useEffect(() => {
    sessionStorage.setItem("visitedSubpage", "true");
  }, []);

  const sectionLabel = {
    overview: { en: "Overview", fr: "Aperçu" },
    techStack: { en: "Tech Stack", fr: "Stack technique" },
    challenges: { en: "Challenges & Solutions", fr: "Défis et solutions" },
    links: { en: "Links & Resources", fr: "Liens et ressources" },
  };

  return (
    <div className="relative">
      <SpaceBackground />
      <div className="relative z-10">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container-padding max-w-4xl mx-auto">
            {detail ? (
              <div className="space-y-8">
                <div>
                  <Button
                    variant="ghost"
                    className="text-space-text/60 hover:text-space-text mb-4"
                    onClick={() => window.history.back()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    {locale === "en" ? "Back" : "Retour"}
                  </Button>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    <span className="text-space-accent">/</span> {detail.title}
                  </h1>
                </div>

                <Card className="bg-space-darker border-space-accent/20 lg:border-4">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-xl font-medium mb-4 text-space-accent">
                      {sectionLabel.overview[locale]}
                    </h2>
                    <p className="text-space-text/80 leading-relaxed">
                      {detail.overview[locale]}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-space-darker border-space-accent/20 lg:border-4">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-xl font-medium mb-4 text-space-accent">
                      {sectionLabel.techStack[locale]}
                    </h2>
                    <div className="space-y-4">
                      {detail.techStack.map((tech) => (
                        <div key={tech.name} className="flex items-start gap-3">
                          <span className="text-sm font-mono py-1 px-2 rounded bg-space-accent/10 border border-space-accent/30 text-space-accent whitespace-nowrap mt-0.5">
                            {tech.name}
                          </span>
                          <p className="text-space-text/70 text-sm">
                            {tech.reason[locale]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-space-darker border-space-accent/20 lg:border-4">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-xl font-medium mb-4 text-space-accent">
                      {sectionLabel.challenges[locale]}
                    </h2>
                    <ul className="space-y-3 list-disc list-inside text-space-text/80">
                      {detail.challenges[locale].map((challenge, i) => (
                        <li key={i}>{challenge}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-space-darker border-space-accent/20 lg:border-4">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-xl font-medium mb-4 text-space-accent">
                      {sectionLabel.links[locale]}
                    </h2>
                    <div className="flex flex-wrap gap-4">
                      {detail.links.map((link) => (
                        <Button
                          key={link.url}
                          className="bg-[#3b82f6] hover:bg-[#3b82f6]/80 text-white"
                          asChild
                        >
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            {link.type === "github" ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                            )}
                            {link.label}
                          </a>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="bg-space-darker bg-opacity-70 backdrop-blur-md rounded-lg p-8 border-4 border-[#3b82f6]/20">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {locale === "en" ? "Project not found" : "Projet introuvable"}
                </h1>
                <p className="mb-8 text-space-text/70">
                  {locale === "en"
                    ? "This project page doesn't exist yet."
                    : "Cette page de projet n'existe pas encore."}
                </p>
                <Button className="bg-[#3b82f6] hover:bg-[#3b82f6]/80 text-white" onClick={() => window.history.back()}>
                  {locale === "en" ? "Back to Portfolio" : "Retour au portfolio"}
                </Button>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default ProjectPage;
