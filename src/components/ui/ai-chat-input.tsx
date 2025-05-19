
"use client" 

import * as React from "react"
import { useState, useEffect, useRef } from "react";
import { Lightbulb, Mic, Globe, Paperclip, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
 
const PLACEHOLDERS = [
  "Ask a question about your website content...",
  "How many products are listed on the homepage?",
  "What are your business hours?",
  "Tell me about your services",
  "What's your return policy?",
  "Do you offer international shipping?",
];
 
const AIChatInput = ({ 
  onSend, 
  value, 
  onChange, 
  isLoading = false 
}: { 
  onSend: () => void; 
  value: string; 
  onChange: (value: string) => void; 
  isLoading?: boolean;
}) => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [thinkActive, setThinkActive] = useState(false);
  const [deepSearchActive, setDeepSearchActive] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
 
  // Cycle placeholder text when input is inactive
  useEffect(() => {
    if (isActive || value) return;
 
    const interval = setInterval(() => {
      setShowPlaceholder(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        setShowPlaceholder(true);
      }, 400);
    }, 3000);
 
    return () => clearInterval(interval);
  }, [isActive, value]);
 
  // Close input when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        if (!value) setIsActive(false);
      }
    };
 
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);
 
  const handleActivate = () => setIsActive(true);
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSend();
      }
    }
  };
 
  const containerVariants = {
    collapsed: {
      height: 68,
      boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
    expanded: {
      height: 128,
      boxShadow: "0 8px 32px 0 rgba(0,0,0,0.16)",
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
  };
 
  const placeholderContainerVariants = {
    initial: {},
    animate: { transition: { staggerChildren: 0.025 } },
    exit: { transition: { staggerChildren: 0.015, staggerDirection: -1 } },
  };
 
  const letterVariants = {
    initial: {
      opacity: 0,
      filter: "blur(12px)",
      y: 10,
    },
    animate: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        opacity: { duration: 0.25 },
        filter: { duration: 0.4 },
        y: { type: "spring", stiffness: 80, damping: 20 },
      },
    },
    exit: {
      opacity: 0,
      filter: "blur(12px)",
      y: -10,
      transition: {
        opacity: { duration: 0.2 },
        filter: { duration: 0.3 },
        y: { type: "spring", stiffness: 80, damping: 20 },
      },
    },
  };
 
  return (
    <motion.div
      ref={wrapperRef}
      className="w-full"
      variants={containerVariants}
      animate={isActive || value ? "expanded" : "collapsed"}
      initial="collapsed"
      style={{ overflow: "hidden", borderRadius: 32, background: "#fff" }}
      onClick={handleActivate}
    >
      <div className="flex flex-col items-stretch w-full h-full">
        {/* Input Row */}
        <div className="flex items-center gap-2 p-3 rounded-full bg-white w-full">
          <button
            className="p-3 rounded-full hover:bg-gray-100 transition"
            title="Attach file"
            type="button"
            tabIndex={-1}
          >
            <Paperclip size={20} />
          </button>

          {/* Text Input & Placeholder */}
          <div className="relative flex-1">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 border-0 outline-0 rounded-md py-2 text-base bg-transparent w-full font-normal"
              style={{ position: "relative", zIndex: 1 }}
              onFocus={handleActivate}
              disabled={isLoading}
            />
            <div className="absolute left-0 top-0 w-full h-full pointer-events-none flex items-center px-3 py-2">
              <AnimatePresence mode="wait">
                {showPlaceholder && !isActive && !value && (
                  <motion.span
                    key={placeholderIndex}
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 select-none pointer-events-none"
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      zIndex: 0,
                    }}
                    variants={placeholderContainerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    {PLACEHOLDERS[placeholderIndex]
                      .split("")
                      .map((char, i) => (
                        <motion.span
                          key={i}
                          variants={letterVariants}
                          style={{ display: "inline-block" }}
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
            className="p-3 rounded-full hover:bg-gray-100 transition"
            title="Voice input"
            type="button"
            tabIndex={-1}
          >
            <Mic size={20} />
          </button>
          <button
            className={`flex items-center gap-1 ${
              isLoading || !value.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-black hover:bg-zinc-700"
            } text-white p-3 rounded-full font-medium justify-center`}
            title="Send"
            type="button"
            tabIndex={-1}
            onClick={onSend}
            disabled={isLoading || !value.trim()}
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
              transition: { duration: 0.25 },
            },
            visible: {
              opacity: 1,
              y: 0,
              pointerEvents: "auto" as const,
              transition: { duration: 0.35, delay: 0.08 },
            },
          }}
          initial="hidden"
          animate={isActive || value ? "visible" : "hidden"}
          style={{ marginTop: 8 }}
        >
          <div className="flex gap-3 items-center">
            {/* Think Toggle */}
            <button
              className={`flex items-center gap-1 px-4 py-2 rounded-full transition-all font-medium group ${
                thinkActive
                  ? "bg-blue-600/10 outline outline-blue-600/60 text-blue-950"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title="Think"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setThinkActive((a) => !a);
              }}
            >
              <Lightbulb
                className="group-hover:fill-yellow-300 transition-all"
                size={18}
              />
              Think
            </button>

            {/* Deep Search Toggle */}
            <motion.button
              className={`flex items-center px-4 gap-1 py-2 rounded-full transition font-medium whitespace-nowrap overflow-hidden justify-start  ${
                deepSearchActive
                  ? "bg-blue-600/10 outline outline-blue-600/60 text-blue-950"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title="Deep Search"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDeepSearchActive((a) => !a);
              }}
              initial={false}
              animate={{
                width: deepSearchActive ? 125 : 36,
                paddingLeft: deepSearchActive ? 8 : 9,
              }}
            >
              <div className="flex-1">
                <Globe size={18} />
              </div>
              <motion.span
              className="pb-[2px]"
                initial={false}
                animate={{
                  opacity: deepSearchActive ? 1 : 0,
                }}
              >
                Deep Search
              </motion.span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
 
export { AIChatInput };
