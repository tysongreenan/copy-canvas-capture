
import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentService, SavedProject } from "@/services/ContentService";
import { ChevronLeft } from "lucide-react";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { Link } from "react-router-dom";

const Chat = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<SavedProject | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const projectData = await ContentService.getProjectById(id);
        setProject(projectData);

        if (!projectData) {
          setError("Project not found");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 container max-w-6xl px-6 md:px-0 py-6">
        {/* Back button */}
        <div className="mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="pl-0">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-[250px]" />
            <Skeleton className="h-[600px] w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
            <Link to="/dashboard" className="mt-4">
              <Button>Return to Dashboard</Button>
            </Link>
          </div>
        ) : project ? (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Chat with {project.title}</h1>
            <ChatContainer project={project} />
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Project Not Found</h2>
            <p className="text-gray-600">The requested project could not be found.</p>
            <Link to="/dashboard" className="mt-4">
              <Button>Return to Dashboard</Button>
            </Link>
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-sm text-gray-500 border-t">
        <div className="container">
          <p>Lumen © {new Date().getFullYear()} • Designed for web professionals</p>
        </div>
      </footer>
    </div>
  );
};

export default Chat;
