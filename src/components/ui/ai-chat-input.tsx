
"use client" 

import * as React from "react"
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { DEFAULT_CHAT_PLACEHOLDERS } from "./chat/placeholder-animation";
import { InputField } from "./chat/input-field";
import { ExpandedControls } from "./chat/expanded-controls";

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
 
const AIChatInput = ({ 
  onSend, 
  value, 
  onChange, 
  isLoading = false,
  placeholders = DEFAULT_CHAT_PLACEHOLDERS,
}: { 
  onSend: () => void; 
  value: string; 
  onChange: (value: string) => void; 
  isLoading?: boolean;
  placeholders?: string[];
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
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        setShowPlaceholder(true);
      }, 400);
    }, 3000);
 
    return () => clearInterval(interval);
  }, [isActive, value, placeholders]);
 
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
 
  const handleThinkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setThinkActive((a) => !a);
  };
  
  const handleDeepSearchToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeepSearchActive((a) => !a);
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
        {/* Input Field */}
        <InputField
          value={value}
          onChange={onChange}
          onSend={onSend}
          isLoading={isLoading}
          isActive={isActive}
          showPlaceholder={showPlaceholder}
          placeholders={placeholders}
          placeholderIndex={placeholderIndex}
          onKeyPress={handleKeyPress}
        />

        {/* Expanded Controls */}
        <ExpandedControls
          isExpanded={isActive || !!value}
          thinkActive={thinkActive}
          deepSearchActive={deepSearchActive}
          onThinkToggle={handleThinkToggle}
          onDeepSearchToggle={handleDeepSearchToggle}
        />
      </div>
    </motion.div>
  );
};
 
export { AIChatInput };
