
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";

const ChatDemo = () => {
    return (
        <div className="w-full min-h-screen flex justify-center items-center bg-gray-900 p-8">
            <div className="w-full max-w-2xl mx-auto">
                <AnimatedAIChat
                    value=""
                    onChange={() => {}}
                    onSend={() => {}}
                    isLoading={false}
                />
            </div>
        </div>
    );
};

export { ChatDemo };
