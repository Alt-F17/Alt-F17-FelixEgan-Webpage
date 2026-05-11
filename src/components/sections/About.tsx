import { useRef, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { portfolioCopy } from '@/content/portfolioCopy';
import { getAge } from '@/lib/utils';

export const About = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const { locale } = useLanguage();
  const copy = portfolioCopy.about;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (textRef.current) observer.observe(textRef.current);
    if (imageRef.current) observer.observe(imageRef.current);

    return () => {
      if (textRef.current) observer.unobserve(textRef.current);
      if (imageRef.current) observer.unobserve(imageRef.current);
    };
  }, []);

  return (
    <section id="about" className="section" ref={sectionRef}>
      <div className="container-padding max-w-5xl mx-auto">
        <h2 className="section-title relative">
          <span className="text-[#3b82f6]">/</span> {copy.title[locale]}
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          <div 
            ref={textRef}
            className="lg:col-span-7 opacity-0 transform translate-y-4 transition-all duration-1000 border-4 border-[#3b82f6]/20 p-6 rounded-lg bg-space-darker"
          >
            {copy.paragraphs[locale].map((paragraph, index) => (
              <p key={index} className={`text-base sm:text-lg ${index === copy.paragraphs[locale].length - 1 ? "" : "mb-6"}`}>
                {paragraph}
              </p>
            ))}
          </div>
          
          <div 
            ref={imageRef}
            className="lg:col-span-5 opacity-0 transform translate-y-4 transition-all duration-1000 delay-200"
          >
            <div className="relative">
              <div className="aspect-square rounded-md bg-space-darker border-4 border-[#3b82f6]/20 p-4">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 mx-auto rounded-full overflow-hidden border-4 border-[#3b82f6]/30">
                      <img src="pfp.JPEG" alt="Felix Egan" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="mt-4 text-xl font-medium">Felix Egan</h3>
                    <p className="text-space-text/70">Montreal, Canada</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -z-10 top-4 left-4 w-full h-full rounded-md border-4 border-[#3b82f6]"></div>
            </div>
            
            <div className="mt-8 space-y-2 border-4 border-[#3b82f6]/20 p-4 rounded-lg bg-space-darker">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[#3b82f6]">{copy.labels.age[locale]}:</span>
                <span>{getAge()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[#3b82f6]">{copy.labels.education[locale]}:</span>
                <span>Dawson College</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[#3b82f6]">{copy.labels.focus[locale]}:</span>
                <span>Python, Machine Learning</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[#3b82f6]">{copy.labels.hobbies[locale]}:</span>
                <span>Rock Climbing, Music, Writing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
