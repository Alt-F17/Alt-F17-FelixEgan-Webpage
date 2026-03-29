import { Link, Navigate, useParams } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import { useLanguage } from "@/i18n/LanguageProvider";
import { getCaseStudyBySlug } from "@/content/caseStudies";

const CaseStudyPage = () => {
  const { slug = "" } = useParams();
  const { locale } = useLanguage();
  const caseStudy = getCaseStudyBySlug(slug);

  if (!caseStudy) {
    return <Navigate to="/404" replace />;
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Seo
        title={`${caseStudy.title[locale]} | Felix Egan Studio`}
        description={caseStudy.excerpt[locale]}
        canonicalPath={`/studio/case-studies/${slug}`}
      />
      <Link to="/studio" className="text-sm text-blue-300 hover:text-blue-200">
        Back to studio home
      </Link>
      <article className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-7">
        <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{caseStudy.industry[locale]}</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-100">{caseStudy.title[locale]}</h1>
        <p className="mt-3 text-zinc-300">{caseStudy.excerpt[locale]}</p>
        <dl className="mt-8 grid gap-4 text-sm text-zinc-300 sm:grid-cols-2">
          <div>
            <dt className="text-zinc-500">Timeline</dt>
            <dd className="mt-1">{caseStudy.timeline}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Tools</dt>
            <dd className="mt-1">{caseStudy.tools.join(", ")}</dd>
          </div>
        </dl>
        <section className="mt-8 space-y-6 text-sm text-zinc-300">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Problem</h2>
            <p className="mt-2">{caseStudy.problem[locale]}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Scope</h2>
            <p className="mt-2">{caseStudy.scope[locale]}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Solution</h2>
            <p className="mt-2">{caseStudy.solution[locale]}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Result</h2>
            <p className="mt-2">{caseStudy.result[locale]}</p>
          </div>
        </section>
      </article>
    </main>
  );
};

export default CaseStudyPage;
