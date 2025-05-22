
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
        <Avatar className={`h-8 w-8 ${isUser ? 'bg-blue-100' : 'bg-indigo-100'} flex-shrink-0 flex items-center justify-center`}>
          <span className={`text-xs font-medium ${isUser ? 'text-blue-700' : 'text-indigo-700'}`}>
            {isUser ? 'You' : 'AI'}
          </span>
        </Avatar>
        
        <div className={`${isUser ? 'bg-blue-50 border-blue-200 text-gray-800' : 'bg-indigo-50 border-indigo-200 text-gray-800'} 
                        px-4 py-3 rounded-lg shadow-sm border max-w-full`}>
          <div className="whitespace-pre-wrap text-sm break-words overflow-hidden overflow-wrap-anywhere">
            {message.content}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
