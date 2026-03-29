import { LeadForm } from "@/components/lead/LeadForm";
import { Seo } from "@/components/seo/Seo";
import { useLanguage } from "@/i18n/LanguageProvider";

const TestimonialsPage = () => {
  const { messages } = useLanguage();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <Seo
        title={`Testimonials | Felix Egan Studio`}
        description="Client testimonials and endorsements for Montreal web development services."
        canonicalPath="/studio/testimonials"
      />
      <h1 className="text-3xl font-semibold text-zinc-100">{messages.testimonials.title}</h1>
      <p className="mt-2 max-w-3xl text-zinc-400">{messages.testimonials.comingSoon}</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-semibold text-zinc-100">{messages.testimonials.intakeTitle}</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Share a short recommendation if we worked together on a project or event.
          </p>
          <div className="mt-4">
            <LeadForm leadType="testimonial" />
          </div>
        </section>
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-sm text-zinc-300">
          <h2 className="text-lg font-semibold text-zinc-100">Moderation Policy</h2>
          <p className="mt-2">
            Submissions are reviewed before publishing. Status flow: <strong>new</strong>,{" "}
            <strong>approved</strong>, <strong>rejected</strong>.
          </p>
          <p className="mt-3">
            Published testimonials may be edited for clarity but never for meaning.
          </p>
        </section>
      </div>
    </main>
  );
};

export default TestimonialsPage;
