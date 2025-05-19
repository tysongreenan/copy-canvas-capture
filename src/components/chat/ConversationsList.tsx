
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ChatService, ChatConversation } from "@/services/ChatService";
import { MoreHorizontal, MessageSquare, Plus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

interface ConversationsListProps {
  projectId: string;
  selectedConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

export function ConversationsList({ 
  projectId, 
  selectedConversationId, 
  onSelectConversation,
  onNewConversation
}: ConversationsListProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      try {
        const fetchedConversations = await ChatService.getConversations(projectId);
        setConversations(fetchedConversations);
      } catch (error) {
        console.error("Error loading conversations:", error);
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (projectId) {
      loadConversations();
    }
  }, [projectId, toast]);
  
  // Delete conversation
  const handleDeleteConversation = async (id: string) => {
    try {
      await ChatService.deleteConversation(id);
      
      // Remove from list
      setConversations(prev => prev.filter(conv => conv.id !== id));
      
      // If deleted conversation was selected, reset selection
      if (id === selectedConversationId) {
        onNewConversation();
      }
      
      toast({
        title: "Deleted",
        description: "Conversation has been deleted"
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Button onClick={onNewConversation} className="w-full" variant="default">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-pulse">Loading...</div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map(conversation => (
                <div 
                  key={conversation.id}
                  className={`
                    flex justify-between items-center px-3 py-2 rounded-md cursor-pointer
                    ${selectedConversationId === conversation.id ? 'bg-muted' : 'hover:bg-muted/50'}
                  `}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-center gap-3 truncate">
                    <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="truncate">
                      <div className="truncate text-sm font-medium">
                        {conversation.title || "New Conversation"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(conversation.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-500 cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(conversation.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
