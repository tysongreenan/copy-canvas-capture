
import { useState } from "react";
import { AIChatInput } from "@/components/ui/ai-chat-input";

const Demo = () => {
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSend = () => {
        if (inputValue) {
            setIsLoading(true);
            console.log("Message sent:", inputValue);
            
            // Simulate response delay
            setTimeout(() => {
                setIsLoading(false);
                setInputValue("");
            }, 1500);
        }
    };
    
    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-6">Chat Input Demo</h2>
            <AIChatInput 
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend}
                isLoading={isLoading}
            />
        </div>
    );
}

export { Demo };
