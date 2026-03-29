import { Link } from 'react-scroll';
import { FaGithub, FaInstagram, FaDiscord, FaEnvelope } from 'react-icons/fa';
import { useLanguage } from '@/i18n/LanguageProvider';
import { portfolioCopy } from '@/content/portfolioCopy';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { locale } = useLanguage();
  const copy = portfolioCopy.footer;
  
  return (
    <footer className="bg-space-darker py-8">
      <div className="container-padding max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="hero" spy={true} smooth={true} duration={500} className="cursor-pointer">
              <h2 className="text-xl font-bold text-white mb-4">
                Felix Egan
              </h2>
            </Link>
            <p className="text-space-text/70">
              {copy.description[locale]}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">{copy.quickLinks[locale]}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="about"
                  spy={true}
                  smooth={true}
                  duration={500}
                  className="text-space-text/70 hover:text-space-accent transition-colors cursor-pointer"
                >
                  {copy.aboutMe[locale]}
                </Link>
              </li>
              <li>
                <Link
                  to="skills"
                  spy={true}
                  smooth={true}
                  duration={500}
                  className="text-space-text/70 hover:text-space-accent transition-colors cursor-pointer"
                >
                  {copy.skills[locale]}
                </Link>
              </li>
              <li>
                <Link
                  to="projects"
                  spy={true}
                  smooth={true}
                  duration={500}
                  className="text-space-text/70 hover:text-space-accent transition-colors cursor-pointer"
                >
                  {copy.projects[locale]}
                </Link>
              </li>
              <li>
                <Link
                  to="contact"
                  spy={true}
                  smooth={true}
                  duration={500}
                  className="text-space-text/70 hover:text-space-accent transition-colors cursor-pointer"
                >
                  {copy.contact[locale]}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">{copy.connect[locale]}</h3>
            <div className="flex space-x-4">
              <a href="https://github.com/Alt-F17" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-space-darker border-4 border-space-accent/30 flex items-center justify-center text-space-accent hover:bg-space-accent hover:text-white transition-colors">
                <FaGithub className="w-5 h-5" />
              </a>

              <a href="https://instagram.com/felix.idk.tbh" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-space-darker border-4 border-space-accent/30 flex items-center justify-center text-space-accent hover:bg-space-accent hover:text-white transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
              
              <a href="https://discord.com/users/707956607123718174" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-space-darker border-4 border-space-accent/30 flex items-center justify-center text-space-accent hover:bg-space-accent hover:text-white transition-colors">
                <FaDiscord className="w-5 h-5" />
              </a>
              
              <a href="mailto:felix.egan@icloud.com" className="w-10 h-10 rounded-full bg-space-darker border-4 border-space-accent/30 flex items-center justify-center text-space-accent hover:bg-space-accent hover:text-white transition-colors">
                <FaEnvelope className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 text-center text-space-text/60">
          <p>© {currentYear} Felix Egan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
