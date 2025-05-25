import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GlobalKnowledgeService } from "@/services/GlobalKnowledgeService";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ManualKnowledgeEntryProps {
  onEntryComplete: () => void;
}

export function ManualKnowledgeEntry({ onEntryComplete }: ManualKnowledgeEntryProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [contentType, setContentType] = useState("guide");
  const [marketingDomain, setMarketingDomain] = useState("general-marketing");
  const [complexityLevel, setComplexityLevel] = useState("beginner");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!title.trim()) {
      errors.push("Title is required");
    }
    
    if (!content.trim()) {
      errors.push("Content is required");
    }
    
    if (!source.trim()) {
      errors.push("Source is required");
    }
    
    if (content.trim().length < 10) {
      errors.push("Content must be at least 10 characters long");
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submitted");
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors above",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setValidationErrors([]);

    try {
      console.log("Submitting knowledge entry:", { title, contentType, marketingDomain });
      
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      const knowledgeId = await GlobalKnowledgeService.addKnowledge(
        content.trim(),
        title.trim(),
        source.trim(),
        contentType,
        marketingDomain,
        complexityLevel,
        tagsArray
      );

      if (knowledgeId) {
        console.log("Knowledge entry created successfully:", knowledgeId);
        
        toast({
          title: "Knowledge Added Successfully",
          description: "The knowledge entry has been added to the database and is ready for use"
        });
        
        // Reset form
        setTitle("");
        setContent("");
        setSource("");
        setContentType("guide");
        setMarketingDomain("general-marketing");
        setComplexityLevel("beginner");
        setTags("");
        
        onEntryComplete();
      } else {
        throw new Error("Failed to create knowledge entry - no ID returned");
      }
    } catch (error: any) {
      console.error("Error adding knowledge:", error);
      
      // Show detailed error message
      const errorMessage = error?.message || "An unexpected error occurred";
      
      toast({
        title: "Failed to Add Knowledge",
        description: `Error: ${errorMessage}. Please try again or contact support if the issue persists.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Add Manual Knowledge Entry
        </CardTitle>
        <CardDescription>
          Manually add marketing knowledge, tips, or insights to the knowledge base
        </CardDescription>
      </CardHeader>
      <CardContent>
        {validationErrors.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Persuasion Principles for Copy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={validationErrors.some(e => e.includes("Title")) ? "border-red-500" : ""}
              />
            </div>

            <div>
              <Label htmlFor="source">Source *</Label>
              <Input
                id="source"
                placeholder="e.g., Marketing expert John Doe"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                required
                className={validationErrors.some(e => e.includes("Source")) ? "border-red-500" : ""}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder="Enter the marketing knowledge, principles, or insights..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              required
              className={validationErrors.some(e => e.includes("Content")) ? "border-red-500" : ""}
            />
            <p className="text-xs text-gray-500 mt-1">
              {content.length} characters (minimum 10 required)
            </p>
          </div>

          
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

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Adding Knowledge..." : "Add Knowledge Entry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
