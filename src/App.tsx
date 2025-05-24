
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Project from "./pages/Project";
import Sitemap from "./pages/Sitemap";
import ScrapCopy from "./pages/ScrapCopy";
import BrandingDetails from "./pages/BrandingDetails";
import AdminKnowledge from "./pages/AdminKnowledge";
import { ChatDemo } from "./components/chat/ChatDemo";
import ProjectWizard from "./pages/ProjectWizard";

// Update document title
document.title = "Beggor - Extract Website Content Like a Pro";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <div className="min-h-screen w-full flex flex-col bg-background text-foreground">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/project/:id" element={<Project />} />
              <Route path="/project/new" element={<ProjectWizard />} />
              <Route path="/branding/:id" element={<BrandingDetails />} />
              <Route path="/sitemap" element={<Sitemap />} />
              <Route path="/scrapcopy" element={<ScrapCopy />} />
              <Route path="/chat" element={<ChatDemo />} />
              <Route path="/chat/:id" element={<ChatDemo />} />
              <Route path="/admin/knowledge" element={<AdminKnowledge />} />
              {/* Redirect /dashboard to /chat */}
              <Route path="/dashboard" element={<Navigate to="/chat" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
