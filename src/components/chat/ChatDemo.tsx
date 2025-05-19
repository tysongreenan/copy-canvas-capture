
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { useState } from "react";
import { ChatProvider } from "@/context/ChatContext";

const ChatDemo = () => {
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
        <div className="w-full min-h-screen flex justify-center items-center bg-gray-900 p-8">
            <div className="w-full max-w-2xl mx-auto">
                <AnimatedAIChat
                    value={inputValue}
                    onChange={handleInputChange}
                    onSend={handleSend}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export { ChatDemo };
