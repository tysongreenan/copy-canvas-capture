
"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Lightbulb, Mic, Globe, Paperclip, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useFileUpload } from "@/hooks/use-file-upload";

export const DEFAULT_CHAT_PLACEHOLDERS = ["Generate website with HextaUI", "Create a new project with Next.js", "What is the meaning of life?", "What is the best way to learn React?", "How to cook a delicious meal?", "Summarize this article"];

interface AIChatInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSend?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  thinkActive?: boolean;
  onThinkToggle?: (active: boolean) => void;
  projectId?: string;
  onFileUploadSuccess?: () => void;
}

const AIChatInput: React.FC<AIChatInputProps> = ({
  value: externalValue,
  onChange: externalOnChange,
  onSend: externalOnSend,
  isLoading = false,
  placeholder,
  thinkActive: externalThinkActive,
  onThinkToggle,
  projectId,
  onFileUploadSuccess
}) => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [thinkActive, setThinkActive] = useState(false);
  const [deepSearchActive, setDeepSearchActive] = useState(false);
  const [internalValue, setInternalValue] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // File upload functionality
  const {
    uploading,
    isDragActive,
    openFileDialog,
    getRootProps,
    getInputProps
  } = useFileUpload({
    projectId: projectId || '',
    onSuccess: onFileUploadSuccess
  });

  // Use external think state if provided
  useEffect(() => {
    if (externalThinkActive !== undefined) {
      setThinkActive(externalThinkActive);
    }
  }, [externalThinkActive]);

  // Determine if using controlled or uncontrolled input
  const isControlled = externalValue !== undefined;
  const inputValue = isControlled ? externalValue : internalValue;
  const handleChange = (value: string) => {
    if (!isControlled) {
      setInternalValue(value);
    }
    if (externalOnChange) {
      externalOnChange(value);
    }
  };
  const handleSend = () => {
    if (externalOnSend && inputValue.trim()) {
      externalOnSend();
    }
  };

  // Cycle placeholder text when input is inactive
  useEffect(() => {
    if (isActive || inputValue) return;
    const interval = setInterval(() => {
      setShowPlaceholder(false);
      setTimeout(() => {
        setPlaceholderIndex(prev => (prev + 1) % DEFAULT_CHAT_PLACEHOLDERS.length);
        setShowPlaceholder(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, [isActive, inputValue]);

  // Close input when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        if (!inputValue) setIsActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputValue]);

  const handleActivate = () => setIsActive(true);
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && inputValue.trim()) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handler for think button toggle
  const handleThinkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = !thinkActive;
    setThinkActive(newValue);
    if (onThinkToggle) {
      onThinkToggle(newValue);
    }
  };

  // Handler for paperclip button
  const handlePaperclipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openFileDialog();
  };
  
  const containerVariants = {
    collapsed: {
      height: 68,
      boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 18
      }
    },
    expanded: {
      height: 128,
      boxShadow: "0 8px 32px 0 rgba(0,0,0,0.16)",
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 18
      }
    }
  };
  
  const placeholderContainerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.025
      }
    },
    exit: {
      transition: {
        staggerChildren: 0.015,
        staggerDirection: -1
      }
    }
  };
  
  const letterVariants = {
    initial: {
      opacity: 0,
      filter: "blur(12px)",
      y: 10
    },
    animate: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        opacity: {
          duration: 0.25
        },
        filter: {
          duration: 0.4
        },
        y: {
          type: "spring",
          stiffness: 80,
          damping: 20
        }
      }
    },
    exit: {
      opacity: 0,
      filter: "blur(12px)",
      y: -10,
      transition: {
        opacity: {
          duration: 0.2
        },
        filter: {
          duration: 0.3
        },
        y: {
          type: "spring",
          stiffness: 80,
          damping: 20
        }
      }
    }
  };

  return (
    <div className="w-full flex justify-center items-center text-black bg-transparent" {...getRootProps()}>
      <input {...getInputProps()} />
      
      {/* Drag overlay */}
      {isDragActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-blue-500/20 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div className="bg-white rounded-lg p-8 shadow-xl text-center">
            <Paperclip size={48} className="mx-auto mb-4 text-blue-500" />
            <h3 className="text-xl font-semibold mb-2">Drop files to upload</h3>
            <p className="text-gray-600">Supports PDF, DOCX, TXT, and Markdown files</p>
          </div>
        </motion.div>
      )}

      <motion.div 
        ref={wrapperRef} 
        className="w-full max-w-3xl" 
        variants={containerVariants} 
        animate={isActive || inputValue ? "expanded" : "collapsed"} 
        initial="collapsed" 
        style={{
          overflow: "hidden",
          borderRadius: 32,
          background: "rgba(255, 255, 255, 0.08)"
        }} 
        onClick={handleActivate}
      >
        <div className="flex flex-col items-stretch w-full h-full bg-orange-900">
          {/* Input Row */}
          <div className="flex items-center gap-2 p-3 rounded-full max-w-3xl w-full bg-orange-900">
            <button 
              className={`p-3 rounded-full hover:bg-white/10 transition text-white/70 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Attach file" 
              type="button" 
              tabIndex={-1} 
              disabled={isLoading || uploading}
              onClick={handlePaperclipClick}
            >
              <Paperclip size={20} />
            </button>
 
            {/* Text Input & Placeholder */}
            <div className="relative flex-1">
              <input 
                type="text" 
                value={inputValue} 
                onChange={e => handleChange(e.target.value)} 
                className="flex-1 border-0 outline-0 rounded-md py-2 text-base bg-transparent w-full font-normal text-white" 
                style={{
                  position: "relative",
                  zIndex: 1
                }} 
                onFocus={handleActivate} 
                onKeyDown={handleKeyPress} 
                disabled={isLoading || uploading} 
              />
              <div className="absolute left-0 top-0 w-full h-full pointer-events-none flex items-center px-3 py-2">
                <AnimatePresence mode="wait">
                  {showPlaceholder && !isActive && !inputValue && (
                    <motion.span 
                      key={placeholderIndex} 
                      className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40 select-none pointer-events-none" 
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        zIndex: 0
                      }} 
                      variants={placeholderContainerVariants} 
                      initial="initial" 
                      animate="animate" 
                      exit="exit"
                    >
                      {(placeholder || DEFAULT_CHAT_PLACEHOLDERS[placeholderIndex]).split("").map((char, i) => (
                        <motion.span 
                          key={i} 
                          variants={letterVariants} 
                          style={{
                            display: "inline-block"
                          }}
                        >
                          {char === " " ? "\u00A0" : char}
                        </motion.span>
                      ))}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
 
            <button 
              className="p-3 rounded-full hover:bg-white/10 transition text-white/70" 
              title="Voice input" 
              type="button" 
              tabIndex={-1} 
              disabled={isLoading || uploading}
            >
              <Mic size={20} />
            </button>
            
            <button 
              className={`flex items-center gap-1 p-3 rounded-full font-medium justify-center transition-colors ${!inputValue.trim() || isLoading || uploading ? "bg-white/10 text-white/40 cursor-not-allowed" : "bg-white/20 hover:bg-white/30 text-white cursor-pointer"}`} 
              title="Send" 
              type="button" 
              disabled={!inputValue.trim() || isLoading || uploading} 
              onClick={handleSend}
            >
              <Send size={18} />
            </button>
          </div>
 
          {/* Expanded Controls */}
          <motion.div 
            className="w-full flex justify-start px-4 items-center text-sm" 
            variants={{
              hidden: {
                opacity: 0,
                y: 20,
                pointerEvents: "none" as const,
                transition: {
                  duration: 0.25
                }
              },
              visible: {
                opacity: 1,
                y: 0,
                pointerEvents: "auto" as const,
                transition: {
                  duration: 0.35,
                  delay: 0.08
                }
              }
            }} 
            initial="hidden" 
            animate={isActive || inputValue ? "visible" : "hidden"} 
            style={{
              marginTop: 8
            }}
          >
            <div className="flex gap-3 items-center">
              {/* Think Toggle */}
              <button 
                className={`flex items-center gap-1 px-4 py-2 rounded-full transition-all font-medium group ${thinkActive ? "bg-blue-600/20 outline outline-blue-400/60 text-blue-200" : "bg-white/5 text-white/70 hover:bg-white/10"}`} 
                title="Think" 
                type="button" 
                onClick={handleThinkToggle} 
                disabled={isLoading || uploading}
              >
                <Lightbulb className={`${thinkActive ? "text-yellow-300" : ""} group-hover:text-yellow-300 transition-all`} size={18} />
                Think
              </button>
 
              {/* Deep Search Toggle */}
              <motion.button 
                className={`flex items-center px-4 gap-1 py-2 rounded-full transition font-medium whitespace-nowrap overflow-hidden justify-start ${deepSearchActive ? "bg-blue-600/20 outline outline-blue-400/60 text-blue-200" : "bg-white/5 text-white/70 hover:bg-white/10"}`} 
                title="Deep Search" 
                type="button" 
                onClick={e => {
                  e.stopPropagation();
                  setDeepSearchActive(a => !a);
                }} 
                initial={false} 
                animate={{
                  width: deepSearchActive ? 125 : 36,
                  paddingLeft: deepSearchActive ? 8 : 9
                }} 
                disabled={isLoading || uploading}
              >
                <div className="flex-1">
                  <Globe size={18} />
                </div>
                <motion.span 
                  className="pb-[2px]" 
                  initial={false} 
                  animate={{
                    opacity: deepSearchActive ? 1 : 0
                  }}
                >
                  Deep Search
                </motion.span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export { AIChatInput };
