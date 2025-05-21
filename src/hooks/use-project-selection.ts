
import { useState, useEffect } from "react";
import { SavedProject, ContentService } from "@/services/ContentService";
import { ChatConversation, ChatService } from "@/services/ChatService";
import { useNavigate } from "react-router-dom";

export function useProjectSelection(projectId?: string) {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<SavedProject | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const navigate = useNavigate();
  
  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const userProjects = await ContentService.getUserProjects();
        setProjects(userProjects);
        
        // If we have a project ID in the URL, select that project
        if (projectId) {
          const project = userProjects.find(p => p.id === projectId);
          if (project) {
            setSelectedProject(project);
          }
        } else if (userProjects.length > 0) {
          // Auto-select first project if none is specified
          setSelectedProject(userProjects[0]);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    
    fetchProjects();
  }, [projectId]);
  
  // Fetch conversations when project changes
  useEffect(() => {
    const fetchConversations = async () => {
      if (!selectedProject) {
        setConversations([]);
        setSelectedConversationId(undefined);
        return;
      }
      
      try {
        const projectConversations = await ChatService.getConversations(selectedProject.id);
        setConversations(projectConversations);
        
        // Auto-select the most recent conversation if available
        if (projectConversations.length > 0 && !selectedConversationId) {
          setSelectedConversationId(projectConversations[0].id);
        } else {
          setSelectedConversationId(undefined);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    
    fetchConversations();
  }, [selectedProject]);

  const handleProjectSelect = (project: SavedProject) => {
    setSelectedProject(project);
    setSelectedConversationId(undefined); // Reset conversation when switching projects
    // Update URL to reflect the selected project
    navigate(`/chat/${project.id}`);
  };
  
  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };
  
  const handleConversationCreated = async (conversationId: string) => {
    try {
      if (!selectedProject) return;
      
      // Create the conversation in the database
      const newConversationId = await ChatService.createConversation(
        selectedProject.id, 
        "New Conversation"  // Default title
      );
      
      // Refresh the conversations list
      const updatedConversations = await ChatService.getConversations(selectedProject.id);
      setConversations(updatedConversations);
      
      // Select the newly created conversation
      setSelectedConversationId(newConversationId);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  return {
    projects,
    selectedProject,
    selectedConversationId,
    conversations,
    handleProjectSelect,
    handleConversationSelect,
    handleConversationCreated
  };
}
