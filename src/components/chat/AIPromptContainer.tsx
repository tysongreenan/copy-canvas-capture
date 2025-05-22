
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Filter } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AIPromptContainerProps {
  onSendMessage: (message: string, response: string) => void;
  projectId: string;
  assistantId?: string;
}

export function AIPromptContainer({
  onSendMessage,
  projectId,
  assistantId = 'asst_hLaKt8VKignxoY0V0NyZxGWO' // Default to marketing research assistant
}: AIPromptContainerProps) {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [contentTypeFilter, setContentTypeFilter] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    try {
      setIsLoading(true);
      
      // Call the assistant-chat endpoint
      const response = await supabase.functions.invoke('assistant-chat', {
        body: { 
          message, 
          projectId,
          assistantId,
          useFineTunedModel: true,
          contentTypeFilter 
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Error calling assistant');
      }
      
      if (!response.data?.message) {
        throw new Error('No response received from assistant');
      }
      
      // Call the callback with the message and response
      onSendMessage(message, response.data.message);
      
      // Reset the message
      setMessage("");
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to get response from assistant. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const filterLabel = contentTypeFilter 
    ? contentTypeFilter.replace("_", " ").replace(/\b\w/g, char => char.toUpperCase())
    : "No Filter";
  
  return (
    <form onSubmit={handleSend} className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className={`flex items-center gap-1 h-8 text-xs bg-white/5 text-white border-white/10 hover:bg-white/10 ${contentTypeFilter ? 'bg-blue-900/30' : ''}`}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>{filterLabel}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2 bg-gray-900 text-white border border-white/10">
            <div className="space-y-1">
              <h4 className="text-sm font-medium mb-2">Content Type Filter</h4>
              <Select value={contentTypeFilter || "none"} onValueChange={(value) => setContentTypeFilter(value === "none" ? null : value)}>
                <SelectTrigger className="w-full bg-white/5 text-white border-white/10">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 text-white border border-white/10">
                  <SelectItem value="none">No Filter</SelectItem>
                  <SelectItem value="title">Page Titles</SelectItem>
                  <SelectItem value="meta_description">Meta Descriptions</SelectItem>
                  <SelectItem value="headings">Headings</SelectItem>
                  <SelectItem value="paragraphs">Paragraphs</SelectItem>
                  <SelectItem value="list_items">List Items</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="relative">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask anything about your project..."
          disabled={isLoading}
          className="min-h-24 pr-14 bg-white/5 border-white/10 text-white placeholder:text-white/40 resize-none"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || isLoading}
          className="absolute bottom-3 right-3 h-9 w-9 bg-blue-600 hover:bg-blue-700"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </form>
  );
}
