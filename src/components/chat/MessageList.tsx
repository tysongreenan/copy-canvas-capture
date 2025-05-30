
import { useChat } from '@/context/ChatContext';
import { ChatMessage } from './ChatMessage';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRef, useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowUpCircle } from 'lucide-react';

export function MessageList() {
  const { messages, lastSources } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && scrollAreaRef.current) {
      const viewportElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewportElement) {
        viewportElement.scrollTop = viewportElement.scrollHeight;
      }
    }
  }, [messages]);
  
  // Check scroll position to show/hide scroll to top button
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    setShowScrollTop(scrollTop > 300);
  };
  
  const scrollToTop = () => {
    const viewportElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (viewportElement) {
      viewportElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  
  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-white/70">
        <p>
          Start a conversation by sending a message. Ask questions about your website content.
        </p>
        <p className="text-sm text-white/50 mt-2">
          The AI is designed to handle typos and spelling mistakes, so don't worry about perfect spelling.
        </p>
      </div>
    );
  }
  
  return (
    <ScrollArea 
      className="flex-1 h-full overflow-hidden" 
      scrollHideDelay={100}
      onScrollCapture={handleScroll}
      ref={scrollAreaRef}
    >
      <div className="p-4 h-full">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="group">
              <ChatMessage message={message} />
              
              {/* Show sources button after AI messages if sources are available */}
              {message.role === 'assistant' && 
               index === messages.length - 1 && 
               lastSources && lastSources.length > 0 && (
                <div className="mt-1 flex justify-end opacity-70 hover:opacity-100 transition-opacity">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs flex items-center gap-1 text-white/60 hover:text-white/80">
                        <BookOpen className="h-3 w-3" />
                        <span>View sources</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 max-h-60 overflow-auto p-4 bg-gray-900 text-white border-white/10" align="end">
                      <h4 className="font-medium mb-2 text-white">Sources</h4>
                      <div className="space-y-3">
                        {lastSources.map((source, idx) => (
                          <div key={idx} className="text-sm border-l-2 border-indigo-400 pl-2">
                            <div className="font-medium text-xs text-white/60 mb-1">
                              {source.metadata?.title || source.metadata?.source || 'Source'}
                            </div>
                            <p className="text-xs text-white/80">{source.content}</p>
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
      </div>
      
      {/* Scroll to top button */}
      {showScrollTop && (
        <Button 
          variant="outline" 
          size="sm" 
          className="fixed bottom-20 right-4 z-10 rounded-full w-10 h-10 p-0 shadow-md bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
          onClick={scrollToTop}
        >
          <ArrowUpCircle className="h-5 w-5" />
        </Button>
      )}
    </ScrollArea>
  );
}
