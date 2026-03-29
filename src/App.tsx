
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import Index from "@/pages/Index";
import ProjectPage from "@/pages/ProjectPage";
import HomePage from "@/pages/HomePage";
import CaseStudyPage from "@/pages/CaseStudyPage";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";
import TestimonialsPage from "@/pages/TestimonialsPage";
import NotFound from "./pages/NotFound";
import { captureUtmFromLocation } from "@/lib/utm";
import { useEffect } from "react";

const StudioLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};

const AppRoutes = () => {
  useEffect(() => {
    captureUtmFromLocation();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/projects/:projectId" element={<ProjectPage />} />
      <Route path="/studio" element={<StudioLayout />}>
        <Route index element={<HomePage />} />
        <Route path="case-studies/:slug" element={<CaseStudyPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/:slug" element={<BlogPostPage />} />
        <Route path="testimonials" element={<TestimonialsPage />} />
      </Route>
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <HelmetProvider>
      <LanguageProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      </LanguageProvider>
    </HelmetProvider>
  );
};

export default App;
