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
import { Brain, Settings, ChevronDown, ChevronUp, Bug } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AgentService } from "@/services/AgentService";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RAGDebugger } from "@/components/chat/RAGDebugger";

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
  const [showDebugger, setShowDebugger] = useState(false);
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
    useMultiAgent,
    setUseMultiAgent,
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
        scrollArea.scrollTop = scrollArea.scrollHeight;
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

  const handleFileUploadSuccess = () => {
    toast({
      title: "Files processed",
      description: "Your files have been uploaded and processed successfully. You can now ask questions about them!"
    });
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

  return (
    <div className="flex flex-col h-full">
      {/* Header toolbar */}
      <div className="flex justify-between items-center px-4 pt-4 py-[10px]">
        {/* Memory button (if conversation exists) */}
        {conversationId && messages.length > 2 && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleSaveMemory} 
            disabled={savingMemory} 
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-black py-0 px-[16px] mx-0 text-left font-normal text-sm"
          >
            <Brain size={16} />
            {savingMemory ? "Saving Memory..." : "Save as Memory"}
          </Button>
        )}

        {/* Debug button */}
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setShowDebugger(!showDebugger)} 
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-black py-0 px-[16px] mx-0 text-left font-normal text-sm"
        >
          <Bug size={16} />
          {showDebugger ? "Hide Debugger" : "Show RAG Debugger"}
        </Button>

        {/* Settings Popover */}
        <div className={conversationId && messages.length > 2 ? "" : "ml-auto"}>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-black">
                <Settings size={16} />
                <span>Response Settings</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-gray-900 border border-white/10 text-white p-4">
              <div className="space-y-4">
                <h3 className="font-medium text-lg">AI System Settings</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="multi-agent" className="text-sm">Multi-Agent System</Label>
                    <Switch 
                      id="multi-agent" 
                      checked={useMultiAgent} 
                      onCheckedChange={setUseMultiAgent} 
                    />
                  </div>
                  <p className="text-xs text-white/60">
                    {useMultiAgent ? "Using specialized agents for better marketing advice (RAG + Marketing Expert + Quality Control)" : "Using single AI agent system"}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="prompt-chain" className="text-sm">Enable Response Evaluation</Label>
                    <Switch 
                      id="prompt-chain" 
                      checked={usePromptChain || thinkActive} 
                      onCheckedChange={checked => {
                        setUsePromptChain(checked);
                        if (!checked && thinkActive) {
                          setThinkActive(false);
                        }
                      }} 
                      disabled={thinkActive}
                    />
                  </div>
                  <p className="text-xs text-white/60">
                    {thinkActive ? "Response evaluation is required when Think mode is active" : "When enabled, responses will be evaluated and improved until they meet your quality threshold"}
                  </p>
                </div>
                
                {(usePromptChain || thinkActive) && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="quality-threshold" className="text-sm">
                          Quality Threshold: {qualityThreshold}%
                        </Label>
                      </div>
                      <Slider 
                        id="quality-threshold" 
                        min={70} 
                        max={98} 
                        step={1} 
                        value={[qualityThreshold]} 
                        onValueChange={values => setQualityThreshold(values[0])} 
                        className="py-4" 
                      />
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
                      <Slider 
                        id="max-iterations" 
                        min={1} 
                        max={5} 
                        step={1} 
                        value={[maxIterations]} 
                        onValueChange={values => setMaxIterations(values[0])} 
                        className="py-4" 
                      />
                      <p className="text-xs text-white/60">
                        More iterations allow for better refinement but increase response time
                      </p>
                    </div>
                  </>
                )}
                
                {useMultiAgent && (
                  <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Multi-Agent System Active</h4>
                    <div className="text-xs text-white/70 space-y-1">
                      <div>• RAG Specialist: Optimizes knowledge retrieval</div>
                      <div>• Marketing Expert: Provides specialized marketing insights</div>
                      <div>• Quality Control: Validates ethics and best practices</div>
                      <div>• Orchestrator: Coordinates and synthesizes responses</div>
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* RAG Debugger */}
      {showDebugger && (
        <div className="px-4 pb-4">
          <RAGDebugger projectId={projectId} />
        </div>
      )}
      
      <div className="flex flex-col h-[85vh] pb-4">
        {/* Scrollable messages with centered container */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 h-full overflow-auto" ref={scrollAreaRef}>
            <div className="flex justify-center w-full">
              <div className="w-full max-w-4xl px-4">
                <div className="space-y-4 pb-4">
                  {messages.map((message, index) => (
                    <ChatMessage key={index} message={message} />
                  ))}
                  <ChatLoadingIndicator 
                    isLoading={isLoading} 
                    taskType={taskType} 
                    isThinking={thinkActive} 
                  />
                  {reasoning.length > 0 && messages.length > 0 && !isLoading && (
                    <ReasoningDisplay 
                      reasoning={reasoning} 
                      confidence={confidence} 
                      evaluation={evaluation} 
                    />
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
        
        {/* Input pinned at bottom with Lovable-style design */}
        <div className="w-full border-t border-gray-200 bg-white shadow-sm">
          <div className="flex justify-center w-full">
            <div className="w-full max-w-4xl px-6 py-4">
              <AIChatInput 
                value={inputValue} 
                onChange={setInputValue} 
                onSend={handleSend} 
                isLoading={isLoading} 
                placeholder={getPlaceholderText(taskType)} 
                thinkActive={thinkActive} 
                onThinkToggle={handleThinkToggle}
                projectId={projectId}
                onFileUploadSuccess={handleFileUploadSuccess}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
