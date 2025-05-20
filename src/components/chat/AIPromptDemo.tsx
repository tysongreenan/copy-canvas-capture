
import { useState } from "react";
import { AI_Prompt } from "../ui/animated-ai-input";

export function AIPromptDemo() {
  const [inputValue, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  
  const handleSend = () => {
    if (inputValue.trim()) {
      // Add user message
      setMessages(prev => [...prev, { role: 'user', content: inputValue }]);
      
      // Simulate AI response
      setIsLoading(true);
      setTimeout(() => {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: `This is a response to: "${inputValue}"` 
          }
        ]);
        setIsLoading(false);
        setValue("");
      }, 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">AI Chat Demo</h2>
      
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 mb-6">
        <div className="space-y-6 mb-8">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {messages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No messages yet. Start a conversation!</p>
            </div>
          )}
        </div>
        
        <AI_Prompt 
          value={inputValue}
          onChange={setValue}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
