
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChatMessage as ChatMessageType } from "@/services/ChatService";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChat } from "@/context/ChatContext";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgentService, AgentStep, AgentSource, AgentTaskType } from "@/services/AgentService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Info, Sparkles, FileSearch, Brain, BarChart2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/chat/FileUpload";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";

interface ChatInterfaceProps {
  projectId: string;
  conversationId?: string;
  onConversationCreated: (id: string) => void;
}

export function ChatInterface({ projectId, conversationId, onConversationCreated }: ChatInterfaceProps) {
  const { 
    messages, 
    addMessage, 
    setLastSources, 
    setCurrentProjectId, 
    setSelectedConversationId, 
    saveMessageToDatabase 
  } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const [reasoning, setReasoning] = useState<AgentStep[]>([]);
  const [showReasoning, setShowReasoning] = useState(false);
  const [confidence, setConfidence] = useState<number | undefined>(undefined);
  const [taskType, setTaskType] = useState<AgentTaskType>('general');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
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
  
  // Handle file upload success
  const handleFileUploadSuccess = useCallback(() => {
    setFileUploaded(true);
    setShowFileUpload(false);
    
    toast({
      title: "File uploaded successfully",
      description: "The file has been processed and is now searchable by the AI",
    });
    
    // Notify the AI that a file was uploaded
    if (fileUploaded) {
      handleSendMessage("I've uploaded a file with additional context. Please use this new information to help answer my questions.");
    }
  }, [toast, fileUploaded]);
  
  // Detect task type from message
  const detectTaskType = (message: string): AgentTaskType => {
    const lowerMessage = message.toLowerCase();
    
    // Marketing and content task detection
    if (lowerMessage.includes('seo') || 
        lowerMessage.includes('eeat') || 
        lowerMessage.includes('e-e-a-t') ||
        lowerMessage.includes('marketing strategy') ||
        lowerMessage.includes('content calendar') ||
        lowerMessage.includes('blog post') ||
        lowerMessage.includes('content strategy')) {
      return 'marketing';
    }
    
    // Email task detection
    if (lowerMessage.includes('email') || 
        lowerMessage.includes('subject line') || 
        lowerMessage.includes('newsletter')) {
      return 'email';
    }
    
    // Summary task detection
    if (lowerMessage.includes('summarize') || 
        lowerMessage.includes('summary') || 
        lowerMessage.startsWith('tldr')) {
      return 'summary';
    }
    
    // Research task detection
    if (lowerMessage.includes('research') || 
        lowerMessage.includes('find information') ||
        lowerMessage.includes('tell me about')) {
      return 'research';
    }
    
    return 'general';
  };
  
  // Send message function
  const handleSendMessage = useCallback(
    async (message: string, contentTypeFilter?: string | null) => {
      if (!message.trim()) return;
      
      setIsLoading(true);
      
      // Reset reasoning state for new message
      setReasoning([]);
      setShowReasoning(false);
      
      // Detect task type
      const detectedTaskType = detectTaskType(message);
      setTaskType(detectedTaskType);
      
      // Create user message
      const userMessage: ChatMessageType = { 
        id: crypto.randomUUID(),
        conversation_id: conversationId || "",
        role: 'user', 
        content: message,
        created_at: new Date().toISOString()
      };
      
      // Add user message to the chat context
      addMessage(userMessage);
      
      // Save the message to the database if we have a conversation ID
      if (conversationId) {
        await saveMessageToDatabase(userMessage);
      }
      
      try {
        // Determine appropriate settings based on task type
        let temperature = 0.7;
        let maxTokens = 1500;
        let modelName = "gpt-4o-mini";
        
        if (detectedTaskType === 'email') {
          temperature = 0.5;
          maxTokens = 2000;
        } else if (detectedTaskType === 'marketing') {
          temperature = 0.6;
          maxTokens = 2000;
          modelName = "gpt-4o";
        } else if (detectedTaskType === 'summary') {
          temperature = 0.3;
          maxTokens = 1800;
        } else if (detectedTaskType === 'research') {
          temperature = 0.4;
          maxTokens = 1800;
          modelName = "gpt-4o";
        }
        
        // Reset file uploaded flag if this is a new user query
        if (!message.includes("I've uploaded a file with additional context")) {
          setFileUploaded(false);
        }
        
        // Send the message to the agent and get the response
        const response = await AgentService.sendMessage(
          message,
          threadId,
          projectId,
          {
            taskType: detectedTaskType,
            contentTypeFilter: contentTypeFilter,
            temperature: temperature,
            maxTokens: maxTokens,
            modelName: modelName
          }
        );
        
        // Save the thread ID for future messages
        if (response.threadId) {
          setThreadId(response.threadId);
        }
        
        // Store any sources if available
        if (response.sources && response.sources.length > 0) {
          setLastSources(response.sources);
        } else {
          setLastSources([]);
        }
        
        // Store reasoning steps if available
        if (response.reasoning && response.reasoning.length > 0) {
          setReasoning(response.reasoning);
        }
        
        // Store confidence score if available
        if (response.confidence !== undefined) {
          setConfidence(response.confidence);
        }
        
        // Check if response suggests file upload
        if (response.message.toLowerCase().includes("upload") && 
            response.message.toLowerCase().includes("file")) {
          setShowFileUpload(true);
        }
        
        // Create assistant message
        const assistantMessage: ChatMessageType = {
          id: crypto.randomUUID(),
          conversation_id: conversationId || "",
          role: 'assistant',
          content: response.message,
          created_at: new Date().toISOString()
        };
        
        // Add assistant's response to the chat context
        addMessage(assistantMessage);
        
        // Save the assistant message to the database if we have a conversation ID
        if (conversationId) {
          await saveMessageToDatabase(assistantMessage);
        }
        
        // If this is a new conversation, call the callback with a new conversation ID
        if (!conversationId) {
          // Call the callback to create a new conversation with the thread ID
          onConversationCreated(response.threadId);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, threadId, conversationId, addMessage, onConversationCreated, toast, setLastSources, saveMessageToDatabase]
  );

  // Helper function to render reasoning steps
  const renderReasoningStep = (step: AgentStep, index: number) => {
    const getStepIcon = () => {
      switch (step.type) {
        case 'tool_start':
          return <FileSearch className="h-4 w-4 text-blue-500" />;
        case 'tool_result':
        case 'tool_error':
          return <Info className="h-4 w-4 text-yellow-500" />;
        case 'reasoning':
        case 'planning':
        case 'synthesis':
          return <Brain className="h-4 w-4 text-purple-500" />;
        case 'evaluation':
          return <Sparkles className="h-4 w-4 text-green-500" />;
        default:
          return <Info className="h-4 w-4 text-gray-500" />;
      }
    };

    return (
      <div key={index} className="flex items-start space-x-2 text-sm p-2 rounded-md bg-gray-50 dark:bg-gray-900">
        <div className="mt-0.5">{getStepIcon()}</div>
        <div className="flex-1">
          <div className="font-medium">
            {step.toolName ? `${step.type} (${step.toolName})` : step.type}
          </div>
          <div className="text-gray-600 dark:text-gray-400">{step.content}</div>
        </div>
      </div>
    );
  };
  
  // Helper to render confidence indicator
  const renderConfidenceIndicator = () => {
    if (confidence === undefined) return null;
    
    let color = "bg-yellow-500";
    if (confidence > 0.7) color = "bg-green-500";
    else if (confidence < 0.4) color = "bg-red-500";
    
    return (
      <div className="flex items-center space-x-2 text-xs">
        <div className="flex items-center space-x-1">
          <div className={`h-2 w-2 rounded-full ${color}`}></div>
          <span>Confidence: {Math.round(confidence * 100)}%</span>
        </div>
      </div>
    );
  };
  
  // Determine appropriate placeholder text based on task type
  const getPlaceholderText = () => {
    switch(taskType) {
      case 'email':
        return "Describe the email you want to create...";
      case 'marketing':
        return "Ask about marketing strategies, content ideas, or SEO best practices...";
      case 'research':
        return "What would you like me to research for you?";
      case 'summary':
        return "What would you like me to summarize?";
      default:
        return "Type your message here...";
    }
  };
  
  // Helper to get task type icon
  const getTaskTypeIcon = () => {
    switch(taskType) {
      case 'email':
        return <div className="text-blue-600">📧</div>;
      case 'marketing':
        return <BarChart2 className="h-4 w-4 text-green-600" />;
      case 'research':
        return <FileSearch className="h-4 w-4 text-purple-600" />;
      case 'summary':
        return <div className="text-amber-600">📝</div>;
      default:
        return <Brain className="h-4 w-4 text-gray-600" />;
    }
  };
  
  // Helper to get loading message based on task type
  const getLoadingMessage = () => {
    switch(taskType) {
      case 'email':
        return "Crafting email content...";
      case 'marketing':
        return "Analyzing marketing strategies...";
      case 'research':
        return "Researching information...";
      case 'summary':
        return "Creating summary...";
      default:
        return "Thinking...";
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4 overflow-y-auto" ref={scrollAreaRef}>
        <div className="space-y-4 pb-4">
          {messages.map((message, index) => (
            <ChatMessage 
              key={index}
              message={message}
            />
          ))}
          
          {isLoading && (
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p>{getLoadingMessage()}</p>
            </div>
          )}
          
          {showFileUpload && !isLoading && (
            <div className="flex flex-col p-4 rounded-lg border border-white/10 bg-white/5 space-y-3">
              <div className="flex items-start gap-2">
                <Upload className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm text-white">Upload Project Documents</h4>
                  <p className="text-sm text-white/70">
                    Upload additional context to help the AI better understand your project.
                  </p>
                </div>
              </div>
              <FileUpload projectId={projectId} onSuccess={handleFileUploadSuccess} />
              <div className="text-xs text-white/50">
                <p>Supported formats: PDF, TXT, MD, DOCX</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFileUpload(false)}
                className="self-start text-white/70 hover:text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          )}
          
          {reasoning.length > 0 && messages.length > 0 && !isLoading && (
            <Collapsible
              open={showReasoning}
              onOpenChange={setShowReasoning}
              className="mt-2 border rounded-md p-2 border-white/10 bg-white/5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-white/90">AI Reasoning Process</span>
                  {renderConfidenceIndicator()}
                </div>
                
                <CollapsibleTrigger asChild>
                  <button className="text-xs text-blue-400 hover:text-blue-300">
                    {showReasoning ? "Hide Details" : "Show Details"}
                  </button>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent className="mt-2 space-y-2">
                {reasoning.map(renderReasoningStep)}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </ScrollArea>
      
      <Separator className="bg-white/10" />
      
      <div className="p-4 bg-black/20">
        {!showFileUpload && (
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFileUpload(true)}
              className="flex gap-1 bg-white/5 hover:bg-white/10 text-white border-white/10"
            >
              <Upload className="h-4 w-4" />
              Upload Files
            </Button>
          </div>
        )}
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isLoading}
          placeholder={getPlaceholderText()}
        />
      </div>
    </div>
  );
}
