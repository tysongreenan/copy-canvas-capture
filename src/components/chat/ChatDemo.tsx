
import { AIChatInput } from "@/components/ui/ai-chat-input"

const ChatDemo = () => {
    return (
        <div className="w-full min-h-screen flex justify-center items-center bg-gray-50">
            <AIChatInput 
                value=""
                onChange={() => {}}
                onSend={() => {}}
            />
        </div>
    )
}

export { ChatDemo }
