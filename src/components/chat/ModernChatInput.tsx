
import React, { useRef, useEffect } from "react";
import { Send, Paperclip, Mic } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ModernChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ModernChatInput({
  value,
  onChange,
  onSend,
  isLoading = false,
  placeholder = "Type a message..."
}: ModernChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  
  // Auto-resize textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to calculate proper scrollHeight
    textarea.style.height = "48px";
    
    // Set the height based on content, with a maximum
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${newHeight}px`;
  }, [value]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading && value.trim()) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="relative w-full rounded-lg bg-black/10 border border-white/10 shadow-sm transition-all duration-200 focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/20">
      <div className="flex items-end">
        {/* Attachment button */}
        {!isMobile && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="flex-shrink-0 p-2 ml-1 text-white/60 hover:text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-md"
                disabled={isLoading}
                aria-label="Attach file"
              >
                <Paperclip size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Attach file</TooltipContent>
          </Tooltip>
        )}
        
        {/* Textarea for input */}
        <div className="flex-grow min-w-0 mx-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className="w-full py-3 px-3 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 text-white placeholder:text-white/40 max-h-[120px]"
            aria-label="Chat message"
            style={{ minHeight: "48px" }}
          />
        </div>
        
        {/* Voice input button for mobile */}
        {isMobile && (
          <button
            type="button"
            className="flex-shrink-0 p-2 text-white/60 hover:text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-md"
            disabled={isLoading}
            aria-label="Voice input"
          >
            <Mic size={18} />
          </button>
        )}
        
        {/* Send button */}
        <AnimatePresence>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: value.trim() && !isLoading ? 1 : 0.8, 
              opacity: value.trim() && !isLoading ? 1 : 0.5 
            }}
            transition={{ duration: 0.15 }}
            className="flex-shrink-0 p-1 mr-1 mb-1"
          >
            <button
              type="button"
              onClick={onSend}
              disabled={!value.trim() || isLoading}
              className={`p-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
                value.trim() && !isLoading
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-white/20 text-white/40 cursor-not-allowed"
              }`}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
