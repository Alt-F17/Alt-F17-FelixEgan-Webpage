import { Link } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import { blogPosts } from "@/content/blog";
import { useLanguage } from "@/i18n/LanguageProvider";

const BlogPage = () => {
  const { locale, messages } = useLanguage();
  const posts = [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <Seo
        title={`Blog | Felix Egan Studio`}
        description="Website, local SEO, and conversion insights for local business owners."
        canonicalPath="/studio/blog"
      />
      <h1 className="text-3xl font-semibold text-zinc-100">{messages.blog.title}</h1>
      <p className="mt-2 text-zinc-400">{messages.blog.subtitle}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to={`/studio/blog/${post.slug}`}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-600"
          >
            <p className="text-xs text-zinc-500">{post.publishedAt}</p>
            <h2 className="mt-2 text-lg font-semibold text-zinc-100">{post.title[locale]}</h2>
            <p className="mt-2 text-sm text-zinc-400">{post.excerpt[locale]}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
};

export default BlogPage;
