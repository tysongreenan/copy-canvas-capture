
import { useState, useRef } from "react";
import { AI_Prompt } from "../ui/animated-ai-input";
import { useToast } from "@/hooks/use-toast";
import { AssistantService } from "@/services/AssistantService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

interface AIPromptContainerProps {
  onSendMessage?: (message: string, response: string) => void;
  projectId?: string;
}

export function AIPromptContainer({ onSendMessage, projectId }: AIPromptContainerProps) {
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
        assistantId,
        projectId
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

  const assistantOptions = [
    "Marketing Research",
    "Content Writer",
    "SEO Specialist",
    "Brand Strategist",
    "General Assistant"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {!projectId && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">No project connected</p>
              <p className="text-amber-700">The assistant will use only its general knowledge as it's not connected to any project's data.</p>
            </div>
          </div>
        </Card>
      )}
      
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="w-full md:w-64">
          <Select 
            value={selectedAssistant} 
            onValueChange={setSelectedAssistant}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Assistant" />
            </SelectTrigger>
            <SelectContent>
              {assistantOptions.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 w-full">
          <AI_Prompt
            value={inputValue}
            onChange={setValue}
            onSend={handleSend}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
