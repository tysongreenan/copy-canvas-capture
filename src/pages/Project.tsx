
import { Navigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { ProjectContent } from "@/components/project/ProjectContent";
import { ProjectFooter } from "@/components/project/ProjectFooter";

const Project = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  // Move this after hooks declaration but before any other logic
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 container max-w-6xl px-6 md:px-0 py-6">
        <ProjectProvider initialTab={tabParam}>
          <ProjectContent />
        </ProjectProvider>
      </main>
      
      <ProjectFooter />
    </div>
  );
};

export default Project;
