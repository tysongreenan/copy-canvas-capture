
import { useState, useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentService, SavedProject } from "@/services/ContentService";
import { ChevronLeft } from "lucide-react";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { AccountMenu } from "@/components/AccountMenu";
import { AIPromptContainer } from "@/components/chat/AIPromptContainer";

const Chat = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<SavedProject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string}>>([]);

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
  
  const handleSendMessage = (message: string, response: string) => {
    setChatMessages(prev => [
      ...prev, 
      { role: 'user', content: message },
      { role: 'assistant', content: response }
    ]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header />
      
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />

      <main className="flex-1 container max-w-6xl px-6 md:px-0 py-6 z-10">
        {/* Back button and Account Menu */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="pl-0 text-white/70 hover:text-white hover:bg-white/5">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <AccountMenu />
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-[250px] bg-white/5" />
            <Skeleton className="h-[600px] w-full bg-white/5" />
          </div>
        ) : error ? (
          <div className="text-center py-12 backdrop-blur-xl bg-black/30 rounded-xl border border-white/5 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
            <p className="text-white/60">{error}</p>
            <Link to="/dashboard" className="mt-4 inline-block">
              <Button variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-white/10">Return to Dashboard</Button>
            </Link>
          </div>
        ) : project ? (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Chat with {project.title}</h1>
            
            <div className="backdrop-blur-lg bg-black/30 rounded-xl border border-white/10 p-6">
              {chatMessages.length > 0 ? (
                <div className="mb-6 space-y-6">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`max-w-[80%] rounded-lg p-4 ${
                          msg.role === 'user' 
                            ? 'bg-blue-600/50 text-white' 
                            : 'bg-white/10 text-white/90'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-white/60">
                  <p className="text-lg">Ask anything about your project!</p>
                </div>
              )}
              
              <AIPromptContainer 
                onSendMessage={handleSendMessage} 
                projectId={project.id} 
              />
            </div>
            
            <ChatContainer project={project} />
          </div>
        ) : (
          <div className="text-center py-12 backdrop-blur-xl bg-black/30 rounded-xl border border-white/5 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-2">Project Not Found</h2>
            <p className="text-white/60">The requested project could not be found.</p>
            <Link to="/dashboard" className="mt-4 inline-block">
              <Button variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-white/10">Return to Dashboard</Button>
            </Link>
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-sm text-white/30 border-t border-white/5">
        <div className="container">
          <p>Lumen © {new Date().getFullYear()} • Designed for web professionals</p>
        </div>
      </footer>
    </div>
  );
};

export default Chat;
