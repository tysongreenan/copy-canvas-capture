
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { useState } from "react";

const ChatDemo = () => {
    const [inputValue, setInputValue] = useState("");
    
    const handleInputChange = (value: string) => {
        setInputValue(value);
    };
    
    const handleSend = () => {
        console.log("Message sent:", inputValue);
        setInputValue("");
    };
    
    return (
        <div className="w-full min-h-screen flex justify-center items-center bg-gray-900 p-8">
            <div className="w-full max-w-2xl mx-auto">
                <AnimatedAIChat
                    value={inputValue}
                    onChange={handleInputChange}
                    onSend={handleSend}
                    isLoading={false}
                />
            </div>
        </div>
    );
};

export { ChatDemo };
