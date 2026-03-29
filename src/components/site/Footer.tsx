import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LanguageToggle } from "@/components/site/LanguageToggle";

export const Footer = () => {
  const { messages } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-zinc-100">Felix Egan Studio</p>
            <p className="text-sm text-zinc-400">Montreal web development for local SMB growth.</p>
          </div>
          <LanguageToggle />
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
          <Link className="hover:text-zinc-100" to="/studio/blog">
            {messages.nav.blog}
          </Link>
          <Link className="hover:text-zinc-100" to="/studio/testimonials">
            {messages.nav.testimonials}
          </Link>
          <a className="hover:text-zinc-100" href="mailto:hello@felixegan.me">
            hello@felixegan.me
          </a>
        </div>
        <p className="text-xs text-zinc-500">Copyright {year} Felix Egan Studio. All rights reserved.</p>
      </div>
    </footer>
  );
};
