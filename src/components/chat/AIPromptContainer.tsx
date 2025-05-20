
import { useState } from "react";
import { AI_Prompt } from "../ui/animated-ai-input";
import { useToast } from "@/hooks/use-toast";

interface AIPromptContainerProps {
  onSendMessage?: (message: string, response: string) => void;
}

export function AIPromptContainer({ onSendMessage }: AIPromptContainerProps) {
  const [inputValue, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Here you would normally call your AI service
      console.log("Sending message:", inputValue);
      
      // Simulate AI response delay
      const mockResponse = await new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve(`This is a simulated response to: "${inputValue}"`);
        }, 1500);
      });
      
      if (onSendMessage) {
        onSendMessage(inputValue, mockResponse);
      }
      
      setValue("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to get a response from the AI. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <AI_Prompt
        value={inputValue}
        onChange={setValue}
        onSend={handleSend}
        isLoading={isLoading}
      />
    </div>
  );
}
