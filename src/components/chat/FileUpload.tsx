
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, AlertCircle, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmbeddingService } from "@/services/EmbeddingService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FileUploadProps {
  projectId: string;
  onSuccess?: () => void;
}

export function FileUpload({ projectId, onSuccess }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showKnowledgeConfirmation, setShowKnowledgeConfirmation] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type (expanded supported file types)
    const supportedTypes = [
      'application/pdf', // PDF
      'text/plain', // TXT
      'text/markdown', // MD
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    ];
    
    if (!supportedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Supported file types: PDF, TXT, MD, DOCX",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }
    
    // Store the file and show confirmation
    setSelectedFile(file);
    setShowKnowledgeConfirmation(true);
  };
  
  const processFile = async (addToKnowledgeBase: boolean) => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setShowKnowledgeConfirmation(false);
    
    try {
      // Process the file with the EmbeddingService
      const success = await EmbeddingService.processFile(selectedFile, projectId);
      
      if (success) {
        toast({
          title: "Success",
          description: addToKnowledgeBase 
            ? "File uploaded, processed, and added to knowledge base" 
            : "File uploaded and processed successfully",
        });
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: "Error",
          description: "Failed to process the file",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      // Reset the file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };
  
  const cancelFileUpload = () => {
    setShowKnowledgeConfirmation(false);
    setSelectedFile(null);
    // Reset the file input
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  
  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="h-4 w-4 mr-2" />;
    
    return <File className="h-4 w-4 mr-2" />;
  };
  
  const getFileTypeLabel = (file: File | null) => {
    if (!file) return "";
    
    if (file.type === 'application/pdf') return "PDF";
    if (file.type === 'text/plain') return "TXT";
    if (file.type === 'text/markdown') return "MD";
    if (file.type.includes('wordprocessingml')) return "DOCX";
    
    return file.type.split('/')[1]?.toUpperCase() || "File";
  };
  
  return (
    <div>
      <input
        type="file"
        id="file-upload"
        accept=".pdf,.txt,.md,.docx"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      <label htmlFor="file-upload">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          disabled={isUploading}
          asChild
        >
          <span>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                {getFileIcon()}
                {selectedFile ? `${getFileTypeLabel(selectedFile)}: ${selectedFile.name}` : "Upload File"}
              </>
            )}
          </span>
        </Button>
      </label>
      
      {showKnowledgeConfirmation && selectedFile && (
        <div className="mt-4 mb-2">
          <Alert 
            className="mb-4" 
            variant="info"
            icon={<AlertCircle className="h-4 w-4" />}
          >
            <AlertTitle>Add to Knowledge Base?</AlertTitle>
            <AlertDescription className="mt-1">
              Would you like to add "{selectedFile.name}" to the knowledge base and vectorize it for AI to search?
            </AlertDescription>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={() => processFile(true)}>
                Yes, add to knowledge base
              </Button>
              <Button size="sm" variant="outline" onClick={() => processFile(false)}>
                No, just upload
              </Button>
              <Button size="sm" variant="ghost" onClick={cancelFileUpload}>
                Cancel
              </Button>
            </div>
          </Alert>
        </div>
      )}
    </div>
  );
}
