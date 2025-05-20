
import { useChat } from '@/context/ChatContext';
import { AnimatedMessage } from './AnimatedMessage';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRef, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

export function MessageList() {
  const { messages, lastSources } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  if (messages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          Start a conversation by sending a message. Ask questions about your website content.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          The AI is designed to handle typos and spelling mistakes, so don't worry about perfect spelling.
        </p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="flex-1 p-4 mb-4">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div key={index} className="group">
            <AnimatedMessage 
              message={message} 
              isLatest={index === messages.length - 1 && message.role === 'assistant'}
            />
            
            {/* Show sources button after AI messages if sources are available */}
            {message.role === 'assistant' && 
             index === messages.length - 1 && 
             lastSources.length > 0 && (
              <div className="mt-1 flex justify-end opacity-70 hover:opacity-100 transition-opacity">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs flex items-center gap-1 text-gray-600">
                      <BookOpen className="h-3 w-3" />
                      <span>View sources</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 max-h-60 overflow-auto p-4 bg-white text-gray-800 border-gray-200" align="end">
                    <h4 className="font-medium mb-2 text-gray-900">Sources</h4>
                    <div className="space-y-3">
                      {lastSources.map((source, idx) => (
                        <div key={idx} className="text-sm border-l-2 border-indigo-300 pl-2">
                          <div className="font-medium text-xs text-gray-600 mb-1">
                            {source.metadata.title || source.metadata.source}
                          </div>
                          <p className="text-xs text-gray-700">{source.content}</p>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
