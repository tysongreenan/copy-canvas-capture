
import * as React from "react";
import { Mic, Paperclip, Send } from "lucide-react";
import { AnimatedPlaceholder } from "./placeholder-animation";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading?: boolean;
  isActive: boolean;
  showPlaceholder: boolean;
  placeholders: string[];
  placeholderIndex: number;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  value,
  onChange,
  onSend,
  isLoading = false,
  isActive,
  showPlaceholder,
  placeholders,
  placeholderIndex,
  onKeyPress,
}) => {
  return (
    <div className="flex items-center gap-2 p-3 rounded-full bg-white w-full">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="p-3 rounded-full hover:bg-gray-100 transition"
            title="Attach file"
            type="button"
            tabIndex={-1}
            disabled={isLoading}
          >
            <Paperclip size={20} />
          </button>
        </TooltipTrigger>
        <TooltipContent>Attach file</TooltipContent>
      </Tooltip>

      {/* Text Input & Placeholder */}
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyPress}
          className="flex-1 border-0 outline-0 rounded-md py-2 text-base bg-transparent w-full font-normal"
          style={{ position: "relative", zIndex: 1 }}
          disabled={isLoading}
        />
        <div className="absolute left-0 top-0 w-full h-full pointer-events-none flex items-center px-3 py-2">
          <AnimatedPlaceholder 
            placeholders={placeholders}
            placeholderIndex={placeholderIndex}
            showPlaceholder={showPlaceholder && !isActive && !value}
          />
        </div>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="p-3 rounded-full hover:bg-gray-100 transition"
            title="Voice input"
            type="button"
            tabIndex={-1}
            disabled={isLoading}
          >
            <Mic size={20} />
          </button>
        </TooltipTrigger>
        <TooltipContent>Voice input</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={`flex items-center gap-1 ${
              isLoading || !value.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-black hover:bg-zinc-700"
            } text-white p-3 rounded-full font-medium justify-center`}
            title="Send"
            type="button"
            tabIndex={-1}
            onClick={onSend}
            disabled={isLoading || !value.trim()}
          >
            <Send size={18} />
          </button>
        </TooltipTrigger>
        <TooltipContent>Send message</TooltipContent>
      </Tooltip>
    </div>
  );
};
