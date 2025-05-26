
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChatMessage as ChatMessageType } from "@/services/ChatService";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Message content copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      });
    }
  };
  
  return (
    <motion.div 
      className="flex justify-start mb-4 group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-row max-w-full w-full gap-3">
        <Avatar className={`h-8 w-8 ${isUser ? 'bg-tan text-black' : 'bg-gray-100 text-gray-700'} flex-shrink-0 flex items-center justify-center`}>
          <span className="text-xs font-medium">
            {isUser ? 'You' : 'AI'}
          </span>
        </Avatar>
        
        <div className="flex-1 min-w-0 relative">
          <div className={`${isUser ? 'bg-tan text-black px-4 py-3 rounded-lg' : ''} 
                          flex-1 min-w-0`}>
            {isUser ? (
              <div className="whitespace-pre-wrap text-sm break-words">
                {message.content}
              </div>
            ) : (
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({...props}) => <h1 className="text-xl font-bold mb-2 text-white" {...props} />,
                    h2: ({...props}) => <h2 className="text-lg font-bold mb-2 text-white" {...props} />,
                    h3: ({...props}) => <h3 className="text-base font-bold mb-2 text-white" {...props} />,
                    h4: ({...props}) => <h4 className="text-sm font-bold mb-2 text-white" {...props} />,
                    p: ({...props}) => <p className="text-sm text-white/90 mb-2 last:mb-0" {...props} />,
                    ul: ({...props}) => <ul className="list-disc list-inside mb-2 text-sm text-white/90" {...props} />,
                    ol: ({...props}) => <ol className="list-decimal list-inside mb-2 text-sm text-white/90" {...props} />,
                    li: ({...props}) => <li className="mb-1" {...props} />,
                    code: ({...props}) => <code className="bg-gray-800 px-1 py-0.5 rounded text-xs text-green-400" {...props} />,
                    pre: ({...props}) => <pre className="bg-gray-800 p-3 rounded mb-2 overflow-x-auto" {...props} />,
                    blockquote: ({...props}) => <blockquote className="border-l-4 border-gray-600 pl-4 italic text-white/80" {...props} />,
                    strong: ({...props}) => <strong className="font-bold text-white" {...props} />,
                    em: ({...props}) => <em className="italic text-white/90" {...props} />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20"
            onClick={copyToClipboard}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-400" />
            ) : (
              <Copy className="h-3 w-3 text-white/60" />
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
