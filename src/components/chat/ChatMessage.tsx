
import { Avatar } from "@/components/ui/avatar";
import { ChatMessage as ChatMessageType } from "@/services/ChatService";
import { motion } from "framer-motion";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-[80%] gap-3`}>
        <Avatar className={`h-8 w-8 ${isUser ? 'bg-white' : 'bg-indigo-500'} flex items-center justify-center`}>
          <span className="text-xs font-medium">
            {isUser ? 'You' : 'AI'}
          </span>
        </Avatar>
        
        <div className={`${isUser ? 'bg-white/10 text-white' : 'bg-indigo-500/20 text-white'} 
                        px-4 py-3 rounded-lg shadow-sm backdrop-blur-sm border border-white/5`}>
          <div className="whitespace-pre-wrap text-sm">
            {message.content}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
