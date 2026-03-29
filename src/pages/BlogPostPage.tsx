import { Link, Navigate, useParams } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import { getBlogPostBySlug } from "@/content/blog";
import { useLanguage } from "@/i18n/LanguageProvider";

const BlogPostPage = () => {
  const { slug = "" } = useParams();
  const { locale } = useLanguage();
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return <Navigate to="/404" replace />;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Seo
        title={`${post.title[locale]} | Felix Egan Studio`}
        description={post.excerpt[locale]}
        canonicalPath={`/studio/blog/${slug}`}
      />
      <Link to="/studio/blog" className="text-sm text-blue-300 hover:text-blue-200">
        Back to blog
      </Link>
      <article className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-7">
        <p className="text-xs text-zinc-500">{post.publishedAt}</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-100">{post.title[locale]}</h1>
        <p className="mt-6 text-base leading-7 text-zinc-300">{post.body[locale]}</p>
      </article>
    </main>
  );
};

export default BlogPostPage;
