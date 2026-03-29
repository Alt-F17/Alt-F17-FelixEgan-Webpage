import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarEmbed } from "@/components/lead/CalendarEmbed";
import { LeadForm } from "@/components/lead/LeadForm";
import { Seo } from "@/components/seo/Seo";
import { useLanguage } from "@/i18n/LanguageProvider";
import { trackEvent } from "@/lib/plausible";
import { caseStudies } from "@/content/caseStudies";
import { blogPosts } from "@/content/blog";
import { marketStats } from "@/content/marketStats";

const siteJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Felix Egan Studio",
    url: "https://felixegan.me",
    email: "hello@felixegan.me",
    areaServed: ["Montreal", "Laval", "Longueuil"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Montreal",
      addressRegion: "QC",
      addressCountry: "CA",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Small business website design and development",
    provider: {
      "@type": "Organization",
      name: "Felix Egan Studio",
    },
    areaServed: "Montreal",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much does a business website cost in Montreal?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most starter brochure projects begin around CAD 1,200 and growth builds usually start around CAD 2,000.",
        },
      },
      {
        "@type": "Question",
        name: "Do you offer bilingual websites?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Projects can be delivered in English and French with language switching and SEO-ready structure.",
        },
      },
    ],
  },
];

const byNewest = (a: { publishedAt: string }, b: { publishedAt: string }) =>
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

const HomePage = () => {
  const { locale, messages } = useLanguage();
  const [showCallFallback, setShowCallFallback] = useState(false);

  const featuredCases = useMemo(() => caseStudies.slice(0, 2), []);
  const featuredPosts = useMemo(() => [...blogPosts].sort(byNewest).slice(0, 3), []);

  return (
    <>
      <Seo
        title="Felix Egan Studio | Montreal Website Development for SMBs"
        description="Bilingual websites for local Montreal businesses. Book a discovery call, request a quote, and launch a conversion-focused site."
        canonicalPath="/studio"
        jsonLd={siteJsonLd}
      />
      <main>
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-20 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-[0_0_80px_-30px_rgba(59,130,246,0.45)]">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-blue-300">{messages.hero.eyebrow}</p>
            <h1 className="text-3xl font-semibold text-zinc-100 sm:text-5xl">{messages.hero.title}</h1>
            <p className="mt-4 text-lg text-zinc-300">{messages.hero.subtitle}</p>
            <p className="mt-4 max-w-3xl text-zinc-400">{messages.hero.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                id="book-call"
                href="#book-call-panel"
                onClick={() => trackEvent("cta_book_call_click", { placement: "hero" })}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                {messages.cta.bookCall}
              </a>
              <a
                href="#contact"
                onClick={() => trackEvent("cta_quote_click", { placement: "hero" })}
                className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 hover:border-zinc-500"
              >
                {messages.cta.requestQuote}
              </a>
              <a
                href="mailto:hello@felixegan.me"
                className="rounded-md border border-transparent px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-zinc-100"
              >
                {messages.cta.emailDirect}
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Local market</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-100">{marketStats.montrealSmallBusinesses}</p>
              <p className="text-sm text-zinc-400">Estimated small businesses in greater Montreal</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Underserved pool</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-100">{marketStats.underservedWebsitePool}</p>
              <p className="text-sm text-zinc-400">Potential businesses needing modern websites</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Retainer baseline</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-100">{marketStats.monthlyRetainerRangeCad}</p>
              <p className="text-sm text-zinc-400">Monthly maintenance pricing target</p>
            </div>
          </div>
        </section>

        <section id="services" className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-zinc-100 sm:text-3xl">{messages.services.title}</h2>
          <p className="mt-2 text-zinc-400">{messages.services.subtitle}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {messages.services.items.map((item) => (
              <article key={item.name} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-zinc-100">{item.name}</h3>
                  <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-200">{item.timeline}</span>
                </div>
                <p className="mt-2 text-sm text-zinc-300">{item.description}</p>
                <p className="mt-3 text-sm font-semibold text-blue-300">{item.price}</p>
                <ul className="mt-3 space-y-1 text-sm text-zinc-400">
                  {item.deliverables.map((deliverable) => (
                    <li key={deliverable}>- {deliverable}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="process" className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-zinc-100 sm:text-3xl">{messages.process.title}</h2>
          <p className="mt-2 text-zinc-400">{messages.process.subtitle}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {messages.process.steps.map((step) => (
              <div key={step.title} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                <h3 className="text-base font-semibold text-zinc-100">{step.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="case-studies" className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-100 sm:text-3xl">{messages.caseStudies.title}</h2>
              <p className="mt-2 text-zinc-400">{messages.caseStudies.subtitle}</p>
            </div>
            <Link className="text-sm text-blue-300 hover:text-blue-200" to="/studio/case-studies/portfolio-to-studio-shift">
              {messages.cta.viewCaseStudies}
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {featuredCases.map((item) => (
              <Link
                key={item.slug}
                to={`/studio/case-studies/${item.slug}`}
                onClick={() => trackEvent("case_study_open", { slug: item.slug })}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-600"
              >
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{item.industry[locale]}</p>
                <h3 className="mt-2 text-lg font-semibold text-zinc-100">{item.title[locale]}</h3>
                <p className="mt-2 text-sm text-zinc-400">{item.excerpt[locale]}</p>
              </Link>
            ))}
          </div>
        </section>

        <section id="testimonials-preview" className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-zinc-100 sm:text-3xl">{messages.testimonials.title}</h2>
          <p className="mt-2 max-w-2xl text-zinc-400">{messages.testimonials.comingSoon}</p>
          <Link to="/studio/testimonials" className="mt-4 inline-flex text-sm text-blue-300 hover:text-blue-200">
            {messages.nav.testimonials}
          </Link>
        </section>

        <section id="blog" className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-100 sm:text-3xl">{messages.blog.title}</h2>
              <p className="mt-2 text-zinc-400">{messages.blog.subtitle}</p>
            </div>
            <Link to="/studio/blog" className="text-sm text-blue-300 hover:text-blue-200">
              {messages.cta.readBlog}
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {featuredPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/studio/blog/${post.slug}`}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-600"
              >
                <p className="text-xs text-zinc-500">{post.publishedAt}</p>
                <h3 className="mt-2 text-lg font-semibold text-zinc-100">{post.title[locale]}</h3>
                <p className="mt-2 text-sm text-zinc-400">{post.excerpt[locale]}</p>
              </Link>
            ))}
          </div>
        </section>

        <section id="contact" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-zinc-100 sm:text-3xl">{messages.contact.title}</h2>
          <p className="mt-2 text-zinc-400">{messages.contact.subtitle}</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div id="book-call-panel" className="space-y-4">
              <CalendarEmbed />
              <button
                type="button"
                onClick={() => setShowCallFallback((prev) => !prev)}
                className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-500"
              >
                {showCallFallback ? "Hide fallback form" : "Use fallback call request form"}
              </button>
              {showCallFallback ? <LeadForm leadType="discovery_call" submitLabel={messages.cta.bookCall} /> : null}
            </div>
            <div className="space-y-4">
              <LeadForm leadType="quote" submitLabel={messages.cta.requestQuote} />
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
                  {messages.contact.napTitle}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">{messages.contact.napBody}</p>
                <p className="mt-2 text-sm text-zinc-400">{messages.contact.serviceArea}</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Founding client discount: {marketStats.foundingClientDiscount}
                </p>
                <a className="mt-3 inline-flex text-sm text-blue-300 hover:text-blue-200" href="mailto:hello@felixegan.me">
                  hello@felixegan.me
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default HomePage;
