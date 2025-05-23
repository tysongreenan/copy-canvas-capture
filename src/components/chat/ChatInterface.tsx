import React, { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/context/ChatContext";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatLoadingIndicator } from "@/components/chat/ChatLoadingIndicator";
import { ReasoningDisplay } from "@/components/chat/ReasoningDisplay";
import { useChatMessaging } from "@/hooks/use-chat-messaging";
import { getPlaceholderText } from "@/utils/chatTaskDetection";
import { AIChatInput } from "@/components/ui/ai-chat-input";
import { Button } from "@/components/ui/button";
import { Brain, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AgentService } from "@/services/AgentService";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
interface ChatInterfaceProps {
  projectId: string;
  conversationId?: string;
  onConversationCreated: (id: string) => void;
}
export function ChatInterface({
  projectId,
  conversationId,
  onConversationCreated
}: ChatInterfaceProps) {
  const {
    messages,
    setCurrentProjectId,
    setSelectedConversationId
  } = useChat();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [savingMemory, setSavingMemory] = useState(false);
  const {
    toast
  } = useToast();
  const {
    isLoading,
    reasoning,
    confidence,
    taskType,
    evaluation,
    usePromptChain,
    setUsePromptChain,
    qualityThreshold,
    setQualityThreshold,
    maxIterations,
    setMaxIterations,
    thinkActive,
    setThinkActive,
    handleSendMessage
  } = useChatMessaging({
    projectId,
    conversationId,
    onConversationCreated
  });

  // Update current project ID and conversation ID in context
  useEffect(() => {
    setCurrentProjectId(projectId);
    setSelectedConversationId(conversationId);
  }, [projectId, conversationId, setCurrentProjectId, setSelectedConversationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        setTimeout(() => {
          scrollArea.scrollTop = scrollArea.scrollHeight;
        }, 100);
      }
    }
  }, [messages]);
  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      handleSendMessage(inputValue);
      setInputValue("");
    }
  };
  const handleThinkToggle = (active: boolean) => {
    setThinkActive(active);

    // When think is activated, ensure prompt chain is also enabled
    if (active && !usePromptChain) {
      setUsePromptChain(true);
      toast({
        title: "Think Mode Activated",
        description: "Response evaluation has been enabled to improve accuracy"
      });
    }
  };
  const handleSaveMemory = async () => {
    if (!conversationId || !messages.length || savingMemory) return;
    setSavingMemory(true);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to save memories",
          variant: "destructive"
        });
        setSavingMemory(false);
        return;
      }
      const success = await AgentService.storeConversationMemory(conversationId, projectId);
      if (success) {
        toast({
          title: "Memory Saved",
          description: "The conversation has been analyzed and stored as a memory for future reference"
        });
      } else {
        toast({
          title: "Failed to Save Memory",
          description: "There was an issue storing this conversation as a memory",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error saving memory:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving memory",
        variant: "destructive"
      });
    } finally {
      setSavingMemory(false);
    }
  };
  return <div className="flex flex-col h-full">
      {/* Header toolbar */}
      <div className="flex justify-between items-center px-4 pt-4">
        {/* Memory button (if conversation exists) */}
        {conversationId && messages.length > 2 && <Button size="sm" variant="outline" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white" onClick={handleSaveMemory} disabled={savingMemory}>
            <Brain size={16} />
            {savingMemory ? "Saving Memory..." : "Save as Memory"}
          </Button>}
        
        {/* Settings Popover */}
        <div className={conversationId && messages.length > 2 ? "" : "ml-auto"}>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border-white/10">
                <Settings size={16} />
                <span>Response Settings</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-gray-900 border border-white/10 text-white p-4">
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Response Quality Settings</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="prompt-chain" className="text-sm">Enable Response Evaluation</Label>
                    <Switch id="prompt-chain" checked={usePromptChain || thinkActive} onCheckedChange={checked => {
                    setUsePromptChain(checked);
                    // Think mode requires prompt chain to be enabled
                    if (!checked && thinkActive) {
                      setThinkActive(false);
                    }
                  }} disabled={thinkActive} // Disable toggle if Think is active
                  />
                  </div>
                  <p className="text-xs text-white/60">
                    {thinkActive ? "Response evaluation is required when Think mode is active" : "When enabled, responses will be evaluated and improved until they meet your quality threshold"}
                  </p>
                </div>
                
                {(usePromptChain || thinkActive) && <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="quality-threshold" className="text-sm">
                          Quality Threshold: {qualityThreshold}%
                        </Label>
                      </div>
                      <Slider id="quality-threshold" min={70} max={98} step={1} value={[qualityThreshold]} onValueChange={values => setQualityThreshold(values[0])} className="py-4" />
                      <p className="text-xs text-white/60">
                        Higher values require more accurate responses but may take longer
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="max-iterations" className="text-sm">
                          Maximum Iterations: {maxIterations}
                        </Label>
                      </div>
                      <Slider id="max-iterations" min={1} max={5} step={1} value={[maxIterations]} onValueChange={values => setMaxIterations(values[0])} className="py-4" />
                      <p className="text-xs text-white/60">
                        More iterations allow for better refinement but increase response time
                      </p>
                    </div>
                  </>}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Messages area with proper padding to prevent content being hidden under input */}
      <div className="flex-1 overflow-hidden min-h-0">
        <ScrollArea ref={scrollAreaRef} className="<div className=\"flex-1 overflow-y-auto p-4 py-0\">">
          <div className="space-y-4 pb-0"> {/* Increased bottom padding for more space */}
            {messages.map((message, index) => <ChatMessage key={index} message={message} />)}
            
            <ChatLoadingIndicator isLoading={isLoading} taskType={taskType} isThinking={thinkActive} />
            
            {reasoning.length > 0 && messages.length > 0 && !isLoading && <ReasoningDisplay reasoning={reasoning} confidence={confidence} evaluation={evaluation} />}
          </div>
        </ScrollArea>
      </div>
      
      {/* Input area with sufficient space for animation */}
      <div className="w-full border-t border-white/10 bg-black/20 backdrop-blur-sm z-10 flex-shrink-0">
        <div className="p-4 bg-white min-h-[64px]"> {/* Changed background color */}
          <AIChatInput value={inputValue} onChange={setInputValue} onSend={handleSend} isLoading={isLoading} placeholder={getPlaceholderText(taskType)} thinkActive={thinkActive} onThinkToggle={handleThinkToggle} />
        </div>
      </div>
    </div>;
}