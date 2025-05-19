
import { Avatar } from "@/components/ui/avatar";
import { ChatMessage as ChatMessageType } from "@/services/ChatService";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-[80%] gap-3`}>
        <Avatar className={`h-8 w-8 ${isUser ? 'bg-primary' : 'bg-indigo-500'}`}>
          <span className="text-xs font-medium text-white">
            {isUser ? 'You' : 'AI'}
          </span>
        </Avatar>
        
        <div className={`${isUser ? 'bg-primary/10 text-primary-foreground' : 'bg-muted'} 
                        px-4 py-3 rounded-lg shadow-sm`}>
          <div className="whitespace-pre-wrap text-sm">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
}
