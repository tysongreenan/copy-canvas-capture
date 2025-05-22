
import { useState } from "react";
import { Send, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ChatInputProps {
  onSendMessage: (message: string, contentTypeFilter?: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSendMessage, disabled = false, placeholder = "Type your message..." }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    try {
      setIsLoading(true);
      await onSendMessage(message, contentTypeFilter);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const filterLabel = contentTypeFilter 
    ? contentTypeFilter.replace("_", " ").replace(/\b\w/g, char => char.toUpperCase())
    : "No Filter";
  
  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className={`flex items-center gap-1 h-8 text-xs ${
                  contentTypeFilter 
                    ? 'bg-blue-900/30 border-blue-700/30 hover:bg-blue-900/50 text-white' 
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                <span>{filterLabel}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 bg-gray-900 border-white/10 text-white">
              <div className="space-y-1">
                <h4 className="text-sm font-medium mb-2">Content Type Filter</h4>
                <Select value={contentTypeFilter || "none"} onValueChange={(value) => setContentTypeFilter(value === "none" ? null : value)}>
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 text-white border-white/10">
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
        
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="min-h-24 pr-12 resize-none bg-white/5 border-white/10 text-white placeholder:text-white/40"
          rows={3}
        />
        
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || disabled || isLoading}
          className="absolute bottom-2 right-2 h-8 w-8 bg-blue-600 hover:bg-blue-700"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </form>
  );
}
