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
          <Link
            to="/qr"
            aria-label="Share via QR code"
            className="flex items-center justify-center rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
          </Link>
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
