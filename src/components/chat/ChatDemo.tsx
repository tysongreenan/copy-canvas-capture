
import { useEffect, useState } from "react";
import { ChatProvider } from "@/context/ChatContext";
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { ContentService, SavedProject } from "@/services/ContentService";
import { Sidebar } from "./Sidebar";
import { ChatMessage } from "@/services/ChatService";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useParams } from "react-router-dom";
import { ChatService } from "@/services/ChatService"; 
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "./FileUpload";

const ChatDemo = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [projects, setProjects] = useState<SavedProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<SavedProject | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
    const { toast } = useToast();
    
    // Redirect if not logged in
    if (!user) {
        return <Navigate to="/auth" replace />;
    }
    
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const userProjects = await ContentService.getUserProjects();
                setProjects(userProjects);
                
                // If we have a project ID in the URL, select that project
                if (id) {
                    const project = userProjects.find(p => p.id === id);
                    if (project) {
                        setSelectedProject(project);
                    }
                }
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };
        
        fetchProjects();
    }, [id]);
    
    useEffect(() => {
        // If we have a selected conversation ID, load its messages
        if (selectedConversationId) {
            const loadMessages = async () => {
                try {
                    setIsLoading(true);
                    const fetchedMessages = await ChatService.getMessages(selectedConversationId);
                    setMessages(fetchedMessages);
                } catch (error) {
                    console.error("Error loading messages:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            
            loadMessages();
        } else {
            // Reset messages if no conversation is selected
            setMessages([]);
        }
    }, [selectedConversationId]);
    
    const handleInputChange = (value: string) => {
        setInputValue(value);
    };
    
    const handleSend = async () => {
        if (!inputValue.trim() || isLoading || !selectedProject) return;
        
        // Add user message to UI immediately
        const userMessage: ChatMessage = {
            role: 'user',
            content: inputValue
        };
        setMessages(prev => [...prev, userMessage]);
        
        setIsLoading(true);
        
        try {
            // Send message to API
            const { response, conversationId } = await ChatService.sendMessage(
                inputValue,
                selectedProject.id,
                selectedConversationId,
                messages
            );
            
            // If this created a new conversation, update the selected conversation ID
            if (conversationId !== selectedConversationId) {
                setSelectedConversationId(conversationId);
            }
            
            // Add AI response to UI
            const aiMessage: ChatMessage = {
                role: 'assistant',
                content: response.response
            };
            
            setMessages(prev => [...prev, aiMessage]);
            setInputValue("");
            
        } catch (error: any) {
            console.error("Error sending message:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to get a response",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleProjectSelect = (project: SavedProject) => {
        setSelectedProject(project);
        setSelectedConversationId(undefined); // Reset conversation when switching projects
        setMessages([]);
    };
    
    const handleConversationSelect = (conversationId: string) => {
        setSelectedConversationId(conversationId);
    };
    
    return (
        <div className="flex h-screen w-full bg-white">
            {/* Sidebar */}
            <Sidebar 
                projects={projects}
                selectedProject={selectedProject}
                onSelectProject={handleProjectSelect}
                selectedConversationId={selectedConversationId}
                onSelectConversation={handleConversationSelect}
            />
            
            {/* Main chat area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {selectedProject ? (
                    <>
                        {/* Chat header */}
                        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                            <h1 className="text-lg font-medium">Chat with {selectedProject.title}</h1>
                            
                            {/* File upload */}
                            <FileUpload 
                                projectId={selectedProject.id} 
                                onSuccess={() => {
                                    toast({
                                        title: "File uploaded",
                                        description: "Your file has been processed and added to the project.",
                                    });
                                }}
                            />
                        </div>
                        
                        {/* Messages display */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {messages.map((message, index) => (
                                <ChatMessage key={index} message={message} />
                            ))}
                            
                            {messages.length === 0 && !isLoading && (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    <p>Start a conversation with your project data</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Chat input */}
                        <div className="p-4 border-t border-gray-200">
                            <AnimatedAIChat
                                value={inputValue}
                                onChange={handleInputChange}
                                onSend={handleSend}
                                isLoading={isLoading}
                            />
                        </div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 p-4">
                        <div className="text-center">
                            <p className="text-lg mb-2">Select a project to start chatting</p>
                            <p>Or create a new project from the dashboard</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export { ChatDemo };
