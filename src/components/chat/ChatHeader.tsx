
import { FileUpload } from "./FileUpload";
import { AccountMenu } from "@/components/AccountMenu";
import { useToast } from "@/hooks/use-toast";
import { SavedProject } from "@/services/ContentService";

interface ChatHeaderProps {
  selectedProject: SavedProject;
}

export function ChatHeader({ selectedProject }: ChatHeaderProps) {
  const { toast } = useToast();

  return (
    <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <h1 className="text-lg font-medium text-black">Chat with {selectedProject.title}</h1>
      
      <div className="flex items-center gap-4">
        {/* File upload */}
        <FileUpload 
          projectId={selectedProject.id} 
          onSuccess={() => {
            toast({
              title: "File uploaded",
              description: "Your file has been processed and added to the project.",
            });
          }}
        />
        
        {/* Account Menu */}
        <AccountMenu />
      </div>
    </div>
  );
}
