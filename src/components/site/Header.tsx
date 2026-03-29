import { Link, NavLink } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LanguageToggle } from "@/components/site/LanguageToggle";
import { trackEvent } from "@/lib/plausible";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm transition-colors ${isActive ? "text-white" : "text-zinc-300 hover:text-white"}`;

export const Header = () => {
  const { messages } = useLanguage();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-100">
          Felix Egan Studio
        </Link>
        <nav className="hidden items-center gap-5 md:flex">
          <NavLink to="/studio" className={navLinkClass}>
            {messages.nav.home}
          </NavLink>
          <a href="/studio#services" className="text-sm text-zinc-300 hover:text-white">
            {messages.nav.services}
          </a>
          <NavLink to="/studio/blog" className={navLinkClass}>
            {messages.nav.blog}
          </NavLink>
          <NavLink to="/studio/testimonials" className={navLinkClass}>
            {messages.nav.testimonials}
          </NavLink>
          <a href="/studio#contact" className="text-sm text-zinc-300 hover:text-white">
            {messages.nav.contact}
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <a
            href="/studio#book-call"
            onClick={() => trackEvent("cta_book_call_click", { placement: "header" })}
            className="hidden rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 sm:inline-flex"
          >
            {messages.cta.bookCall}
          </a>
          <a
            href="/studio#contact"
            onClick={() => trackEvent("cta_quote_click", { placement: "header" })}
            className="rounded-md border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-100 hover:border-zinc-500"
          >
            {messages.cta.requestQuote}
          </a>
        </div>
      </div>
    </header>
  );
};
