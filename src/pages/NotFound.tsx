import { Helmet } from "react-helmet-async";
import { Seo } from "@/components/seo/Seo";
import { useSiteContent } from "@/content/siteContent";
import { SplitStage } from "@/components/notfound/SplitStage";
import "@/components/portfolio/portfolio.css";

const NotFound = () => {
  const { content } = useSiteContent();

  return (
    <div className="fe-root">
      <Seo title="404 | Felix Egan" description="This page doesn't exist. Something else does." canonicalPath="/404" />
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>
      {content ? (
        <SplitStage content={content} />
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: "#3b82f6", fontSize: 15 }}>
            loading<span style={{ animation: "fe-blink 1.05s step-end infinite" }}>_</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default NotFound;
