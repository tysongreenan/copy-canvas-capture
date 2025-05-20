
"use client";

import { useEffect, useState } from "react";
import { useAnimatedText } from "@/components/ui/animated-text";
import { ChatMessage as ChatMessageType } from "@/services/ChatService";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";

interface AnimatedMessageProps {
  message: ChatMessageType;
  isLatest: boolean;
}

export function AnimatedMessage({ message, isLatest }: AnimatedMessageProps) {
  const isUser = message.role === 'user';
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Use word-by-word animation only for AI responses that are the latest message
  const animatedContent = useAnimatedText(
    message.content,
    isUser || !isLatest ? "" : " "
  );
  
  // Mark animation as complete when the animated content equals the original content
  useEffect(() => {
    if (animatedContent === message.content) {
      setAnimationComplete(true);
    }
  }, [animatedContent, message.content]);
  
  return (
    <motion.div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`} 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-[80%] gap-3`}>
        <Avatar className={`h-8 w-8 ${isUser ? 'bg-blue-100' : 'bg-indigo-100'} flex items-center justify-center`}>
          <span className={`text-xs font-medium ${isUser ? 'text-blue-700' : 'text-indigo-700'}`}>
            {isUser ? 'You' : 'AI'}
          </span>
        </Avatar>
        
        <div className={`${isUser ? 'bg-blue-50 border-blue-200 text-gray-800' : 'bg-indigo-50 border-indigo-200 text-gray-800'} 
                        px-4 py-3 rounded-lg shadow-sm border`}>
          <div className="whitespace-pre-wrap text-sm">
            {isUser ? message.content : (isLatest ? animatedContent : message.content)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
