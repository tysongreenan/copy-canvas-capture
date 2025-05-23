import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { FileIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmbeddingService } from "@/services/EmbeddingService";
import { ContentService } from "@/services/ContentService";
interface FileUploadProps {
  projectId: string;
  onSuccess: () => void;
}
export function FileUpload({
  projectId,
  onSuccess
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const {
    toast
  } = useToast();
  const [uploading, setUploading] = useState(false);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);
  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    onDrop,
    accept: {
      'text/markdown': ['.md', '.markdown'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx', '.doc'],
      'text/plain': ['.txt']
    },
    maxSize: 10000000,
    // 10MB
    multiple: false
  });
  const handleRemoveFile = (fileToRemove: File) => {
    setFiles(existingFiles => existingFiles.filter(file => file !== fileToRemove));
  };
  const clearAllFiles = () => {
    setFiles([]);
  };
  const uploadFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }
    setUploading(true);
    try {
      for (const file of files) {
        if (projectId) {
          // Use our existing processFile method instead of processDocument
          const success = await EmbeddingService.processFile(file, projectId);
          if (success) {
            toast({
              title: "File uploaded and processed",
              description: `${file.name} uploaded and processed successfully`
            });
            onSuccess();
            try {
              // Extract simple content from file for database
              const fileText = await file.text();

              // Basic extraction of content
              const extractedHeadings: {
                text: string;
                tag: string;
              }[] = [];
              const extractedParagraphs: string[] = [];
              const extractedListItems: string[] = [];

              // Simple parsing of the content
              const lines = fileText.split('\n');
              lines.forEach(line => {
                line = line.trim();
                if (line.startsWith('#')) {
                  // This is a heading
                  const level = (line.match(/^#+/) || [''])[0].length;
                  const tag = `h${level}`;
                  extractedHeadings.push({
                    text: line.replace(/^#+\s+/, ''),
                    tag: tag
                  });
                } else if (line.startsWith('-') || line.startsWith('*')) {
                  // This is a list item
                  extractedListItems.push(line.substring(1).trim());
                } else if (line.length > 0) {
                  // This is a paragraph
                  extractedParagraphs.push(line);
                }
              });

              // Save the processed content to the scraped_content table
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
          } else {
            toast({
              title: "Processing failed",
              description: `Failed to process ${file.name}`,
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Project ID missing",
            description: "Please select a project before uploading files",
            variant: "destructive"
          });
        }
      }
      clearAllFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the file",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  return <div>
      
      
      {files.length > 0 && <div className="mt-4">
          <ul>
            {files.map((file: File) => <li key={file.name} className="flex items-center justify-between p-2 rounded-md bg-gray-100 dark:bg-gray-800 mt-2">
                <div className="flex items-center">
                  <FileIcon className="mr-2 h-4 w-4" />
                  <span>{file.name} ({Math.round(file.size / 1000)} KB)</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(file)}>
                  <X className="h-4 w-4" />
                </Button>
              </li>)}
          </ul>
          <div className="flex justify-end mt-4">
            <Button variant="secondary" onClick={clearAllFiles} className="mr-2">
              Clear All
            </Button>
            <Button onClick={uploadFiles} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload Files"}
            </Button>
          </div>
        </div>}
    </div>;
}