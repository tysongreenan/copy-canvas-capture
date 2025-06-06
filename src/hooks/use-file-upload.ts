
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { EmbeddingService } from '@/services/EmbeddingService';
import { ContentService } from '@/services/ContentService';

interface UseFileUploadProps {
  projectId: string;
  onSuccess?: () => void;
}

export function useFileUpload({ projectId, onSuccess }: UseFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();

  const processFile = useCallback(async (file: File) => {
    if (!projectId) {
      toast({
        title: "Project ID missing",
        description: "Please select a project before uploading files",
        variant: "destructive"
      });
      return false;
    }

    try {
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      
      // Use existing processFile method
      const success = await EmbeddingService.processFile(file, projectId);
      
      if (success) {
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        
        toast({
          title: "File uploaded and processed",
          description: `${file.name} uploaded and processed successfully`
        });

        // Extract and save content to database
        try {
          const fileText = await file.text();
          const extractedHeadings: { text: string; tag: string; }[] = [];
          const extractedParagraphs: string[] = [];
          const extractedListItems: string[] = [];

          const lines = fileText.split('\n');
          lines.forEach(line => {
            line = line.trim();
            if (line.startsWith('#')) {
              const level = (line.match(/^#+/) || [''])[0].length;
              const tag = `h${level}`;
              extractedHeadings.push({
                text: line.replace(/^#+\s+/, ''),
                tag: tag
              });
            } else if (line.startsWith('-') || line.startsWith('*')) {
              extractedListItems.push(line.substring(1).trim());
            } else if (line.length > 0) {
              extractedParagraphs.push(line);
            }
          });

          await ContentService.saveContent({
            url: `file://${file.name}`,
            title: file.name,
            headings: extractedHeadings,
            paragraphs: extractedParagraphs,
            links: [],
            listItems: extractedListItems,
            metaDescription: null,
            metaKeywords: null,
            projectId
          });
        } catch (error) {
          console.error("Error saving file content to database:", error);
        }

        onSuccess?.();
        return true;
      } else {
        toast({
          title: "Processing failed",
          description: `Failed to process ${file.name}`,
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the file",
        variant: "destructive"
      });
      return false;
    } finally {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[file.name];
        return newProgress;
      });
    }
  }, [projectId, toast, onSuccess]);

  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    
    setUploading(true);
    try {
      for (const file of files) {
        await processFile(file);
      }
    } finally {
      setUploading(false);
    }
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: uploadFiles,
    accept: {
      'text/markdown': ['.md', '.markdown'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx', '.doc'],
      'text/plain': ['.txt']
    },
    maxSize: 10000000, // 10MB
    multiple: true,
    noClick: true, // We'll handle click manually
    noKeyboard: true
  });

  return {
    uploading,
    uploadProgress,
    isDragActive,
    uploadFiles,
    openFileDialog: open,
    getRootProps,
    getInputProps
  };
}
