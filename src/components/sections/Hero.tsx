import { useRef, useEffect } from 'react';
import { Link } from 'react-scroll';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { portfolioCopy } from '@/content/portfolioCopy';
import ScrambledText from '@/components/ScrambledText';

export const Hero = () => {
  const textRef = useRef<HTMLDivElement>(null);
  const { locale } = useLanguage();
  const copy = portfolioCopy.hero;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      },
      { threshold: 0.1 }
    );

    if (textRef.current) {
      observer.observe(textRef.current);
    }

    return () => {
      if (textRef.current) {
        observer.unobserve(textRef.current);
      }
    };
  }, []);

  return (
    <section id="hero" className="section min-h-[100svh] flex items-center relative">
      <div className="container-padding max-w-5xl mx-auto">
        <div 
          ref={textRef} 
          className="opacity-0 transform translate-y-4 transition-all duration-1000 border-4 border-[#3b82f6]/20 p-5 sm:p-8 rounded-lg bg-space-darker/50 backdrop-blur-sm"
        >
          <p className="text-[#3b82f6] mb-4 font-mono text-sm sm:text-base">{copy.eyebrow[locale]}</p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 text-white">
            Felix Egan
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-6 text-space-text/80">
            <span className="hidden lg:inline">
              <ScrambledText
                key={locale}
                initialText=""
                targetText={copy.role[locale]}
                speed={40}
              />
            </span>
            <span className="lg:hidden">{copy.role[locale]}</span>
          </h2>
          <p className="max-w-2xl text-base sm:text-lg mb-8 text-space-text/70">
            {copy.description[locale]}
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
            <Button 
              className="bg-[#3b82f6] hover:bg-[#3b82f6]/80 text-white w-full sm:w-auto"
              size="lg"
            >
              <Link to="projects" spy={true} smooth={true} duration={800} offset={-100}>
                {copy.viewProjects[locale]}
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className="border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6] hover:text-white w-full sm:w-auto"
              size="lg"
            >
              <Link to="contact" spy={true} smooth={true} duration={800} offset={-100}>
                {copy.contact[locale]}
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <Link to="about" spy={true} smooth={true} duration={800} offset={-100} className="cursor-pointer">
          <ArrowDown className="h-6 w-6 text-[#3b82f6]" />
        </Link>
      </div>
    </section>
  );
};

export default Hero;
