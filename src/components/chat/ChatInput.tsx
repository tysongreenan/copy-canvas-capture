
import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

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
  
  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-2">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">Content Type Filter</h4>
        
        <Select value={contentTypeFilter || "none"} onValueChange={(value) => setContentTypeFilter(value === "none" ? null : value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Filter</SelectItem>
            <SelectItem value="title">Page Titles</SelectItem>
            <SelectItem value="meta_description">Meta Descriptions</SelectItem>
            <SelectItem value="headings">Headings</SelectItem>
            <SelectItem value="paragraphs">Paragraphs</SelectItem>
            <SelectItem value="list_items">List Items</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="relative">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="min-h-24 pr-12 resize-none"
          rows={3}
        />
        
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || disabled || isLoading}
          className="absolute bottom-2 right-2 h-8 w-8"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </form>
  );
}
