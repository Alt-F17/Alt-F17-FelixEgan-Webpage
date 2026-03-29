import { Link } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";

const NotFound = () => {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-4 text-center">
      <Seo title="Page not found | Felix Egan Studio" description="Requested page was not found." canonicalPath="/404" />
      <p className="text-sm uppercase tracking-[0.14em] text-zinc-500">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-zinc-100">Page not found</h1>
      <p className="mt-3 text-zinc-400">The page you requested does not exist or has moved.</p>
      <Link to="/" className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
        Return home
      </Link>
    </main>
  );
};

export default NotFound;
