
import { useState, useRef } from "react";
import { AI_Prompt } from "../ui/animated-ai-input";
import { useToast } from "@/hooks/use-toast";
import { AssistantService } from "@/services/AssistantService";

interface AIPromptContainerProps {
  onSendMessage?: (message: string, response: string) => void;
}

export function AIPromptContainer({ onSendMessage }: AIPromptContainerProps) {
  const [inputValue, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const threadIdRef = useRef<string | undefined>(undefined);
  const [selectedAssistant, setSelectedAssistant] = useState("Marketing Research");
  
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Get the appropriate assistant ID
      const assistantId = AssistantService.getAssistantId(selectedAssistant);
      
      // Send the message to the OpenAI assistant
      const { message: aiResponse, threadId } = await AssistantService.sendMessage(
        inputValue,
        threadIdRef.current,
        assistantId
      );
      
      // Save the thread ID for future messages in this conversation
      threadIdRef.current = threadId;
      
      if (onSendMessage) {
        onSendMessage(inputValue, aiResponse);
      }
      
      setValue("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to get a response from the assistant. Please try again.",
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
