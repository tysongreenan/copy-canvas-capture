import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { FileIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmbeddingService } from "@/services/EmbeddingService";
import { Document } from "langchain/document";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { MarkdownLoader } from "langchain/document_loaders/fs/markdown";
import { ContentService } from "@/services/ContentService";

interface FileUploadProps {
  projectId: string;
  onSuccess: () => void;
}

export function FileUpload({ projectId, onSuccess }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);
  
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    accept: {
      'text/markdown': ['.md', '.markdown'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx', '.doc'],
      'text/plain': ['.txt']
    },
    maxSize: 10000000, // 10MB
    multiple: false
  })
  
  const handleRemoveFile = (fileToRemove: File) => {
    setFiles((existingFiles) =>
      existingFiles.filter((file) => file !== fileToRemove)
    );
  };
  
  const clearAllFiles = () => {
    setFiles([]);
  };
  
  const uploadFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    
    try {
      for (const file of files) {
        let loader;
        
        if (file.type === 'text/markdown' || file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
          loader = new MarkdownLoader(file);
        } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          loader = new PDFLoader(file);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
          loader = new DocxLoader(file);
        } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          loader = new TextLoader(file);
        } else {
          toast({
            title: "Unsupported file type",
            description: "Please upload a PDF, DOCX, MD, or TXT file",
            variant: "destructive",
          });
          setUploading(false);
          return;
        }
        
        const docs = await loader.load();
        
        if (projectId) {
          // Process embeddings for the document
          const success = await EmbeddingService.processDocument(projectId, docs);
          
          if (success) {
            toast({
              title: "File uploaded and processed",
              description: `${file.name} uploaded and processed successfully`,
            });
            onSuccess();
          } else {
            toast({
              title: "Embedding failed",
              description: `Failed to process embeddings for ${file.name}`,
              variant: "destructive",
            });
          }
          
          // Extract content for saving to the database
          const extractedHeadings: { text: string; tag: string }[] = [];
          const extractedParagraphs: string[] = [];
          const extractedListItems: string[] = [];
          
          docs.forEach((doc: Document) => {
            const content = doc.pageContent;
            
            // Basic parsing - improve this as needed
            const lines = content.split('\n');
            lines.forEach(line => {
              line = line.trim();
              if (line.startsWith('#')) {
                // This is a heading
                const tag = 'h' + line.lastIndexOf('#')
                extractedHeadings.push({ text: line.substring(line.lastIndexOf('#') + 1).trim(), tag: tag });
              } else if (line.startsWith('-') || line.startsWith('*')) {
                // This is a list item
                extractedListItems.push(line.substring(1).trim());
              } else if (line.length > 0) {
                // This is a paragraph
                extractedParagraphs.push(line);
              }
            });
          });
          
          // Save the processed content to the scraped_content table
          try {
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
            title: "Project ID missing",
            description: "Please select a project before uploading files",
            variant: "destructive",
          });
        }
      }
      
      clearAllFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <div 
        {...getRootProps()}
        className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
      >
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p>Drop the files here ...</p> :
            <p>Drag 'n' drop some files here, or click to select files</p>
        }
      </div>
      
      {files.length > 0 && (
        <div className="mt-4">
          <ul>
            {files.map((file: File) => (
              <li key={file.name} className="flex items-center justify-between p-2 rounded-md bg-gray-100 dark:bg-gray-800 mt-2">
                <div className="flex items-center">
                  <FileIcon className="mr-2 h-4 w-4" />
                  <span>{file.name} ({Math.round(file.size/1000)} KB)</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(file)}>
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
          <div className="flex justify-end mt-4">
            <Button 
              variant="secondary" 
              onClick={clearAllFiles}
              className="mr-2"
            >
              Clear All
            </Button>
            <Button 
              onClick={uploadFiles}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Files"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
