
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, File, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadCardProps {
  onUploadComplete: () => void;
}

export function FileUploadCard({ onUploadComplete }: FileUploadCardProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [contentType, setContentType] = useState("guide");
  const [marketingDomain, setMarketingDomain] = useState("general-marketing");
  const [complexityLevel, setComplexityLevel] = useState("beginner");
  const [tags, setTags] = useState("");
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const allowedTypes = ['.pdf', '.txt', '.md', '.docx'];
    
    const validFiles = selectedFiles.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return allowedTypes.includes(extension);
    });

    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid file types",
        description: "Only PDF, TXT, MD, and DOCX files are allowed",
        variant: "destructive"
      });
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('contentType', contentType);
        formData.append('marketingDomain', marketingDomain);
        formData.append('complexityLevel', complexityLevel);
        formData.append('tags', tags);

        const { data, error } = await supabase.functions.invoke('process-knowledge-file', {
          body: formData
        });

        if (error) throw error;
        
        successCount++;
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        errorCount++;
      }
    }

    setIsUploading(false);
    setFiles([]);

    if (successCount > 0) {
      toast({
        title: "Upload Complete",
        description: `${successCount} file(s) processed successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`
      });
      onUploadComplete();
    } else {
      toast({
        title: "Upload Failed",
        description: "No files were processed successfully",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Knowledge Files
        </CardTitle>
        <CardDescription>
          Upload PDF, TXT, MD, or DOCX files to add to the knowledge base
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="contentType">Content Type</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="principle">Principle</SelectItem>
                <SelectItem value="framework">Framework</SelectItem>
                <SelectItem value="example">Example</SelectItem>
                <SelectItem value="guide">Guide</SelectItem>
                <SelectItem value="case_study">Case Study</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="marketingDomain">Marketing Domain</Label>
            <Select value={marketingDomain} onValueChange={setMarketingDomain}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="copywriting">Copywriting</SelectItem>
                <SelectItem value="branding">Branding</SelectItem>
                <SelectItem value="email-marketing">Email Marketing</SelectItem>
                <SelectItem value="general-marketing">General Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="complexityLevel">Complexity Level</Label>
            <Select value={complexityLevel} onValueChange={setComplexityLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            placeholder="strategy, conversion, psychology"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="file-upload">Select Files</Label>
          <Input
            id="file-upload"
            type="file"
            multiple
            accept=".pdf,.txt,.md,.docx"
            onChange={handleFileSelect}
            className="cursor-pointer"
          />
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Files:</Label>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          disabled={isUploading || files.length === 0}
          className="w-full"
        >
          {isUploading ? "Processing..." : `Upload ${files.length} File(s)`}
        </Button>
      </CardContent>
    </Card>
  );
}
