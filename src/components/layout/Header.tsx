
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LanguageToggle } from "@/components/site/LanguageToggle";
import { portfolioCopy } from "@/content/portfolioCopy";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { locale } = useLanguage();
  const copy = portfolioCopy.header.nav;

  const navLinks = [
    { name: copy.home[locale], to: 'hero' },
    { name: copy.about[locale], to: 'about' },
    { name: copy.skills[locale], to: 'skills' },
    { name: copy.projects[locale], to: 'projects' },
    { name: copy.contact[locale], to: 'contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 py-4",
        isScrolled ? "bg-space-darker bg-opacity-80 backdrop-blur-md shadow-md" : "bg-transparent"
      )}
    >
      <div className="container-padding max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <ScrollLink to="hero" spy={true} smooth={true} duration={500} className="cursor-pointer">
            <h1 className="text-2xl font-bold text-white">Felix Egan</h1>
          </ScrollLink>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <ScrollLink
              key={link.name}
              to={link.to}
              spy={true}
              smooth={true}
              offset={-100}
              duration={500}
              className="text-space-text hover:text-[#3b82f6] transition-colors cursor-pointer"
              activeClass="text-[#3b82f6] font-medium"
            >
              {link.name}
            </ScrollLink>
          ))}
          <a
            href="/studio"
            className="text-space-text hover:text-[#3b82f6] transition-colors"
          >
            {copy.studio[locale]}
          </a>
          <RouterLink
            to="/qr"
            aria-label="Share via QR code"
            className="flex items-center justify-center rounded-md p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="3" height="3" />
              <rect x="18" y="14" width="3" height="3" />
              <rect x="14" y="18" width="3" height="3" />
              <rect x="18" y="18" width="3" height="3" />
              <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none" />
              <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none" />
              <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none" />
            </svg>
          </RouterLink>
          <LanguageToggle />
          <Button
            variant="outline"
            className="border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6] hover:text-white"
          >
            <a href="/CV.pdf" target="_blank" rel="noopener noreferrer">
              {copy.resume[locale]}
            </a>
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <RouterLink
            to="/qr"
            aria-label="Share via QR code"
            className="flex items-center justify-center rounded-md p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="3" height="3" />
              <rect x="18" y="14" width="3" height="3" />
              <rect x="14" y="18" width="3" height="3" />
              <rect x="18" y="18" width="3" height="3" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none" />
              <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none" />
              <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none" />
            </svg>
          </RouterLink>
          <LanguageToggle />
          <Button
            variant="ghost"
            className="text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-space-darker bg-opacity-95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <ScrollLink
                key={link.name}
                to={link.to}
                spy={true}
                smooth={true}
                offset={-100}
                duration={500}
                className="block text-space-text hover:text-[#3b82f6] py-2 cursor-pointer"
                activeClass="text-[#3b82f6] font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </ScrollLink>
            ))}
            <a href="/studio" className="block text-space-text hover:text-[#3b82f6] py-2">
              {copy.studio[locale]}
            </a>
            <div className="py-1">
              <LanguageToggle />
            </div>
            <Button
              variant="outline"
              className="w-full border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6] hover:text-white mt-2"
            >
              <a href="/resume_template.pdf" target="_blank" rel="noopener noreferrer">
                {copy.resume[locale]}
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
