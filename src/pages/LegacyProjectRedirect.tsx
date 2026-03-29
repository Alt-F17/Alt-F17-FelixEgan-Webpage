import { Navigate, useParams } from "react-router-dom";

const redirectMap: Record<string, string> = {
  "dawshacks-website": "dawshacks-event-site",
  "sf-study-tools": "sf-study-tools-platform",
  "portfolio-website": "portfolio-to-studio-shift",
  "stm-status": "portfolio-to-studio-shift",
  "pluto-ai": "portfolio-to-studio-shift",
  "cybersecurity-tools": "portfolio-to-studio-shift",
};

const LegacyProjectRedirect = () => {
  const { projectId = "" } = useParams();
  const slug = redirectMap[projectId] ?? "portfolio-to-studio-shift";
  return <Navigate to={`/case-studies/${slug}`} replace />;
};

export default LegacyProjectRedirect;
