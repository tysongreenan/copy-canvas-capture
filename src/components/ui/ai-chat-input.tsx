
"use client" 

import * as React from "react"
import { useState, useEffect, useRef } from "react";
import { Lightbulb, Mic, Globe, Paperclip, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { InputField } from "./chat/input-field";
import { ExpandedControls } from "./chat/expanded-controls";
import { DEFAULT_CHAT_PLACEHOLDERS } from "./chat/placeholder-animation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
 
interface AIChatInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSend?: () => void;
  isLoading?: boolean;
}

const AIChatInput: React.FC<AIChatInputProps> = ({ 
  value: externalValue, 
  onChange: externalOnChange,
  onSend: externalOnSend,
  isLoading = false
}) => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [thinkActive, setThinkActive] = useState(false);
  const [deepSearchActive, setDeepSearchActive] = useState(false);
  const [internalValue, setInternalValue] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
 
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
        setPlaceholderIndex((prev) => (prev + 1) % DEFAULT_CHAT_PLACEHOLDERS.length);
        setShowPlaceholder(true);
      }, 400);
    }, 3000);
 
    return () => clearInterval(interval);
  }, [isActive, inputValue]);
 
  // Close input when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
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
 
  const containerVariants = {
    collapsed: {
      height: 68,
      boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
    expanded: {
      height: 120, // Reduced from 128px
      boxShadow: "0 8px 32px 0 rgba(0,0,0,0.16)",
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
  };

  // Handle toggle functions with propagation stopped
  const handleThinkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setThinkActive((prev) => !prev);
  };

  const handleDeepSearchToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeepSearchActive((prev) => !prev);
  };
 
  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-full flex justify-center items-center text-black">
        <motion.div
          ref={wrapperRef}
          className="w-full max-w-3xl"
          variants={containerVariants}
          animate={isActive || inputValue ? "expanded" : "collapsed"}
          initial="collapsed"
          style={{ overflow: "hidden", borderRadius: 32, background: "#fff" }}
          onClick={handleActivate}
        >
          <div className="flex flex-col items-stretch w-full h-full">
            {/* Input Row */}
            <InputField
              value={inputValue}
              onChange={handleChange}
              onSend={handleSend}
              isLoading={isLoading}
              isActive={isActive}
              showPlaceholder={showPlaceholder}
              placeholders={DEFAULT_CHAT_PLACEHOLDERS}
              placeholderIndex={placeholderIndex}
              onKeyPress={handleKeyPress}
            />

            {/* Expanded Controls */}
            <ExpandedControls
              isExpanded={isActive || !!inputValue}
              thinkActive={thinkActive}
              deepSearchActive={deepSearchActive}
              onThinkToggle={handleThinkToggle}
              onDeepSearchToggle={handleDeepSearchToggle}
            />
          </div>
        </motion.div>
      </div>
    </TooltipProvider>
  );
};
 
export { AIChatInput };
