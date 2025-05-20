
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { ChatService } from '@/services/ChatService';

interface ConversationsListProps {
  projectId: string;
  selectedConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation?: () => void; // Added this property to fix the error
}

export function ConversationsList({
  projectId,
  selectedConversationId,
  onSelectConversation,
  onNewConversation
}: ConversationsListProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      try {
        const fetchedConversations = await ChatService.getConversations(projectId);
        setConversations(fetchedConversations);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadConversations();
  }, [projectId]);
  
  const handleNewChat = async () => {
    try {
      const conversationId = await ChatService.createConversation(projectId);
      
      // Refresh conversations
      const fetchedConversations = await ChatService.getConversations(projectId);
      setConversations(fetchedConversations);
      
      // Select the new conversation
      onSelectConversation(conversationId);
      
      // Call the onNewConversation callback if provided
      if (onNewConversation) {
        onNewConversation();
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };
  
  const handleDeleteConversation = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    try {
      await ChatService.deleteConversation(conversationId);
      
      // Refresh conversations
      const updatedConversations = await ChatService.getConversations(projectId);
      setConversations(updatedConversations);
      
      // If the deleted conversation was selected, reset selection
      if (selectedConversationId === conversationId) {
        onSelectConversation(updatedConversations[0]?.id || '');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };
  
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-700">Conversations</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 w-7 p-0"
          onClick={handleNewChat}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      <ScrollArea className="h-[300px] pr-2">
        {loading ? (
          <div className="flex justify-center py-4">
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-4">
            <span className="text-sm text-gray-500">No conversations yet</span>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map(conversation => (
              <div 
                key={conversation.id}
                className={`flex items-center justify-between rounded-md px-3 py-2 cursor-pointer group ${
                  selectedConversationId === conversation.id 
                    ? 'bg-gray-100' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-center space-x-3 truncate">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <span className="text-sm truncate">
                    {conversation.title || 'New Conversation'}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  onClick={(e) => handleDeleteConversation(e, conversation.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
