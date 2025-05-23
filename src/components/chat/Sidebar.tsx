import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SavedProject } from "@/services/ContentService";
import { ChatService } from "@/services/ChatService";
import { Globe, MessageSquare, Plus, Brush, Dog } from "lucide-react";
import { Link } from "react-router-dom";
interface SidebarProps {
  projects: SavedProject[];
  selectedProject: SavedProject | null;
  onSelectProject: (project: SavedProject) => void;
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
}
export function Sidebar({
  projects,
  selectedProject,
  onSelectProject,
  selectedConversationId,
  onSelectConversation
}: SidebarProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load conversations when a project is selected
  useEffect(() => {
    const loadConversations = async () => {
      if (!selectedProject) return;
      setLoading(true);
      try {
        const fetchedConversations = await ChatService.getConversations(selectedProject.id);
        setConversations(fetchedConversations);
      } catch (error) {
        console.error("Error loading conversations:", error);
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
  }, [selectedProject]);
  const handleNewChat = async () => {
    if (!selectedProject) return;
    try {
      const conversationId = await ChatService.createConversation(selectedProject.id);
      if (conversationId) {
        // Refresh conversations
        const fetchedConversations = await ChatService.getConversations(selectedProject.id);
        setConversations(fetchedConversations);

        // Select the new conversation
        onSelectConversation(conversationId);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };
  return <div className="w-64 bg-cream border-r border-gray-200 flex flex-col h-full">
            {/* Header with logo */}
            <div className="p-4 border-b border-gray-200">
                <Link to="/dashboard" className="flex items-center">
                    <div className="w-8 h-8 mr-2">
                        {/* Beggor Logo */}
                        <Dog className="text-tan" />
                    </div>
                    <h1 className="text-xl font-bold text-charcoal">Beggor</h1>
                </Link>
            </div>
            
            {/* Projects section */}
            <div className="p-3">
                <h2 className="text-sm font-semibold text-gray-500 mb-2 text-left">PROJECTS</h2>
                <ScrollArea className="h-40">
                    {projects.map(project => <div key={project.id} className={`flex items-center gap-2 p-2 rounded-md cursor-pointer mb-1 ${selectedProject?.id === project.id ? "bg-tan/20" : "hover:bg-tan/10"}`} onClick={() => onSelectProject(project)}>
                            <Globe className="h-4 w-4 text-charcoal" />
                            <span className="text-sm text-charcoal truncate">
                                {project.title || "Untitled Project"}
                            </span>
                        </div>)}
                    
                    {projects.length === 0 && <div className="text-center py-2 text-gray-500 text-sm">
                            No projects yet—go ahead, beg for some copy!
                        </div>}
                </ScrollArea>
                
                <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                    <Link to="/project/new">
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                    </Link>
                </Button>
            </div>
            
            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>
            
            {/* Conversations section */}
            <div className="flex-1 overflow-hidden p-3">
                {selectedProject && <>
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-sm font-semibold text-gray-500">CHATS</h2>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleNewChat}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        <ScrollArea className="h-[calc(100%-40px)]">
                            {loading ? <div className="flex justify-center p-4">
                                    <div className="animate-pulse">Loading...</div>
                                </div> : conversations.length === 0 ? <div className="text-center py-2 text-gray-500 text-sm">
                                    No conversations yet
                                </div> : <div className="space-y-1">
                                    {conversations.map(conversation => <div key={conversation.id} className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${selectedConversationId === conversation.id ? "bg-tan/20" : "hover:bg-tan/10"}`} onClick={() => onSelectConversation(conversation.id)}>
                                            <MessageSquare className="h-4 w-4 text-charcoal" />
                                            <span className="text-sm text-charcoal truncate">
                                                {conversation.title || "New Chat"}
                                            </span>
                                        </div>)}
                                </div>}
                        </ScrollArea>
                    </>}
            </div>
            
            {/* Project pages section (when a project is selected) */}
            {selectedProject && <div className="p-3 border-t border-gray-200">
                    <h2 className="text-sm font-semibold text-gray-500 mb-2">BRAND</h2>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link to={`/branding/${selectedProject.id}`}>
                            <Brush className="h-4 w-4 mr-2" />
                            Branding Details
                        </Link>
                    </Button>
                </div>}
            
            {/* User section */}
            <div className="mt-auto p-3 border-t border-gray-200">
                <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                        <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M9 3v18" />
                        </svg>
                        Dashboard
                    </Button>
                </Link>
            </div>
        </div>;
}