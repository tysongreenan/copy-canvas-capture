
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChatMessage as ChatMessageType } from "@/services/ChatService";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [showCopyButton, setShowCopyButton] = useState(false);
  const { toast } = useToast();
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast({
        title: "Copied to clipboard",
        description: "Message content copied with formatting preserved",
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: "Copy failed",
        description: "Could not copy message content",
        variant: "destructive"
      });
    }
  };
  
  return (
    <motion.div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setShowCopyButton(true)}
      onMouseLeave={() => setShowCopyButton(false)}
    >
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-2xl w-full gap-3 relative group`}>
        <Avatar className={`h-8 w-8 ${isUser ? 'bg-tan text-black' : 'bg-gray-100 text-gray-700'} flex-shrink-0 flex items-center justify-center`}>
          <span className={`text-xs font-medium`}>
            {isUser ? 'You' : 'AI'}
          </span>
        </Avatar>
        
        <div className={`${isUser ? 'bg-tan text-black px-4 py-3 rounded-lg' : ''} 
                        flex-1 min-w-0 relative`}>
          <div className="text-sm break-words text-left">
            {isUser ? (
              <div className="whitespace-pre-wrap">{message.content}</div>
            ) : (
              <div className="text-black text-left w-full">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({children}) => <h1 className="text-xl font-bold mb-3 text-black text-left">{children}</h1>,
                    h2: ({children}) => <h2 className="text-lg font-semibold mb-2 text-black text-left">{children}</h2>,
                    h3: ({children}) => <h3 className="text-base font-medium mb-2 text-black text-left">{children}</h3>,
                    h4: ({children}) => <h4 className="text-sm font-medium mb-1 text-black text-left">{children}</h4>,
                    p: ({children}) => <p className="mb-2 text-black/90 last:mb-0 text-left">{children}</p>,
                    ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1 text-black/90 text-left">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1 text-black/90 text-left">{children}</ol>,
                    li: ({children}) => <li className="text-black/90 text-left">{children}</li>,
                    code: ({children, className}) => {
                      const isInline = !className;
                      return isInline ? 
                        <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-black">{children}</code> :
                        <code className="block bg-gray-50 p-3 rounded-md text-xs font-mono text-black/90 overflow-x-auto text-left">{children}</code>
                    },
                    pre: ({children}) => <pre className="bg-gray-50 p-3 rounded-md mb-2 overflow-x-auto text-left">{children}</pre>,
                    blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-black/80 mb-2 text-left">{children}</blockquote>,
                    strong: ({children}) => <strong className="font-semibold text-black">{children}</strong>,
                    em: ({children}) => <em className="italic text-black/90">{children}</em>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
          
          {/* Copy button */}
          {showCopyButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-black/10 hover:bg-black/20 text-black/60 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
              </svg>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
