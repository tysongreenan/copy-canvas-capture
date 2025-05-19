
"use client";

import { SessionNavBar } from "@/components/ui/sidebar"
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { useState } from "react";

export function SidebarDemo() {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleInputChange = (value: string) => {
    setInputValue(value);
  };
  
  const handleSend = () => {
    if (inputValue.trim()) {
      setIsLoading(true);
      console.log("Message sent:", inputValue);
      
      // Simulate response delay
      setTimeout(() => {
        setIsLoading(false);
        setInputValue("");
      }, 2000);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-row bg-gray-900">
      <SessionNavBar />
      <main className="flex h-screen grow flex-col overflow-auto pt-6 px-8">
        <div className="flex-1">
          <h1 className="text-2xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/40 pb-3">
            Chat Interface
          </h1>
          
          {/* Chat messages would go here */}
          <div className="min-h-[300px]"></div>
          
          {/* AI Chat Input */}
          <div className="mt-auto pb-6">
            <AnimatedAIChat 
              value={inputValue}
              onChange={handleInputChange}
              onSend={handleSend}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
