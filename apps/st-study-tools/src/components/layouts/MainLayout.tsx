
import React, { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Tool {
  id: string;
  name: string;
  component: React.ComponentType<any>;
}

interface MainLayoutProps {
  children: React.ReactNode;
  tools: Tool[];
  activeTool: string | null;
  onToolSelect: (toolId: string) => void;
  title?: string;
}

const MainLayout = ({ children, tools, activeTool, onToolSelect, title = "SF2 Study Tools" }: MainLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when a tool is selected
  useEffect(() => {
    if (activeTool && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [activeTool, isMobileMenuOpen]);

  // Add custom highlight.js styles for GitHub theme
  useEffect(() => {
    // Load highlight.js GitHub theme if not already loaded
    if (typeof window !== "undefined") {
      const linkId = "highlightjs-github-theme";
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css";
        document.head.appendChild(link);
      }
      
      // Load highlight.js and Python language support
      const scriptIds = ["highlightjs", "highlightjs-python"];
      if (!document.getElementById(scriptIds[0])) {
        const script1 = document.createElement("script");
        script1.id = scriptIds[0];
        script1.src = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js";
        
        const script2 = document.createElement("script");
        script2.id = scriptIds[1];
        script2.src = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/languages/python.min.js";
        
        // Load scripts sequentially
        document.body.appendChild(script1);
        script1.onload = () => {
          document.body.appendChild(script2);
          script2.onload = () => {
            // Initialize highlighting
            (window as any).hljs.highlightAll();
          };
        };
      }
    }
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-20 p-2 bg-gray-800 text-white rounded"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "w-full md:w-64 bg-gray-800 text-white md:min-h-screen z-10 transition-all duration-300",
          isMobileMenuOpen 
            ? "fixed inset-0 flex flex-col" 
            : "hidden md:flex md:flex-col"
        )}
      >
        <div className="p-4 text-center relative">
          <button 
            onClick={() => navigate('/')}
            className="absolute left-4 top-4 p-1 hover:bg-gray-700 rounded-full transition-colors"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm text-gray-400 mt-1">Made by Felix - {title.split(' ')[0]} / 2025</p>
        </div>
        <Separator className="bg-gray-700" />
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {tools.map((tool) => (
              <li key={tool.id}>
                <button
                  className={cn(
                    "w-full text-left px-4 py-2 rounded transition-colors",
                    activeTool === tool.id
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-700"
                  )}
                  onClick={() => onToolSelect(tool.id)}
                >
                  {tool.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
