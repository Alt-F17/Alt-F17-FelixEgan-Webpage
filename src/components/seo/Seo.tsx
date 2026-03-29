import { Helmet } from "react-helmet-async";

type SeoProps = {
  title: string;
  description: string;
  canonicalPath?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
};

export const Seo = ({ title, description, canonicalPath = "/", jsonLd }: SeoProps) => {
  const canonical = `https://felixegan.me${canonicalPath}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      {jsonLd ? <script type="application/ld+json">{JSON.stringify(jsonLd)}</script> : null}
    </Helmet>
  );
};
