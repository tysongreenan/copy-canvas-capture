import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, File, X, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface FileUploadCardProps {
  onUploadComplete: () => void;
}

interface ProcessingResult {
  success: boolean;
  chunks_processed: number;
  chunks_failed: number;
  total_chunks: number;
  filename: string;
  processing_details?: Array<{
    chunk_index: number;
    status: string;
    quality_score?: number;
    has_embedding?: boolean;
    error?: string;
  }>;
  overall_status: 'complete' | 'partial' | 'failed';
}

export function FileUploadCard({ onUploadComplete }: FileUploadCardProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [contentType, setContentType] = useState("guide");
  const [marketingDomain, setMarketingDomain] = useState("general-marketing");
  const [complexityLevel, setComplexityLevel] = useState("beginner");
  const [tags, setTags] = useState("");
  const [processingResults, setProcessingResults] = useState<ProcessingResult[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
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
    setProcessingResults([]); // Clear previous results
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
    setUploadProgress(0);
    const results: ProcessingResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
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
        
        const result = data as ProcessingResult;
        results.push(result);
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        results.push({
          success: false,
          chunks_processed: 0,
          chunks_failed: 0,
          total_chunks: 0,
          filename: file.name,
          overall_status: 'failed'
        });
      }
    }

    setProcessingResults(results);
    setIsUploading(false);
    setUploadProgress(100);

    // Show summary toast
    const totalSuccess = results.reduce((sum, r) => sum + r.chunks_processed, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.chunks_failed, 0);
    const fileSuccessCount = results.filter(r => r.success).length;

    if (fileSuccessCount > 0) {
      toast({
        title: "Upload Complete",
        description: `${fileSuccessCount} file(s) processed successfully. ${totalSuccess} chunks created${totalFailed > 0 ? `, ${totalFailed} chunks failed` : ''}`
      });
      onUploadComplete();
      
      // Clear files after successful upload
      setTimeout(() => {
        setFiles([]);
        setProcessingResults([]);
        setUploadProgress(0);
      }, 5000);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Knowledge Files
        </CardTitle>
        <CardDescription>
          Upload PDF, TXT, MD, or DOCX files to add to the knowledge base with automatic quality assessment
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
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {isUploading && (
          <div className="space-y-2">
            <Label>Processing Files...</Label>
            <Progress value={uploadProgress} />
            <p className="text-xs text-gray-500">
              This may take a few minutes depending on file size and content complexity.
            </p>
          </div>
        )}

        {processingResults.length > 0 && (
          <div className="space-y-3">
            <Label>Processing Results:</Label>
            {processingResults.map((result, index) => (
              <div key={index} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.overall_status)}
                    <span className="font-medium text-sm">{result.filename}</span>
                  </div>
                  <Badge className={getStatusColor(result.overall_status)}>
                    {result.overall_status}
                  </Badge>
                </div>
                
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Chunks processed: {result.chunks_processed}/{result.total_chunks}</p>
                  {result.chunks_failed > 0 && (
                    <p className="text-red-600">Failed: {result.chunks_failed}</p>
                  )}
                  
                  {result.processing_details && result.processing_details.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Chunk Details:</p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {result.processing_details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="flex items-center justify-between text-xs">
                            <span>Chunk {detail.chunk_index}</span>
                            <div className="flex items-center gap-2">
                              {detail.quality_score && (
                                <Badge variant="outline" className="text-xs">
                                  Quality: {(detail.quality_score * 100).toFixed(0)}%
                                </Badge>
                              )}
                              {detail.has_embedding && (
                                <Badge variant="outline" className="text-xs bg-blue-50">
                                  Embedded
                                </Badge>
                              )}
                              <Badge className={detail.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {detail.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
