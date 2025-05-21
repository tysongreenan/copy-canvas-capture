
import { useState, useEffect } from "react";
import { SavedProject, ContentService } from "@/services/ContentService";

export function useProjectSelection(projectId?: string) {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<SavedProject | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  
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
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    
    fetchProjects();
  }, [projectId]);

  const handleProjectSelect = (project: SavedProject) => {
    setSelectedProject(project);
    setSelectedConversationId(undefined); // Reset conversation when switching projects
  };
  
  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };
  
  const handleConversationCreated = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  return {
    projects,
    selectedProject,
    selectedConversationId,
    handleProjectSelect,
    handleConversationSelect,
    handleConversationCreated
  };
}
