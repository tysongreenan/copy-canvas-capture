
import * as React from "react";
import { motion } from "motion/react";
import { Globe, Lightbulb } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";

interface ThinkToggleProps {
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export const ThinkToggle: React.FC<ThinkToggleProps> = ({ active, onClick, disabled }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all font-medium group ${
            active
              ? "bg-blue-600/10 outline outline-blue-600/60 text-blue-950"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          title="Think"
          type="button"
          onClick={onClick}
          disabled={disabled}
        >
          <Lightbulb
            className="group-hover:fill-yellow-300 transition-all"
            size={16}
          />
          <span className="text-sm">Think</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>Generate thought process</TooltipContent>
    </Tooltip>
  );
};

interface DeepSearchToggleProps {
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export const DeepSearchToggle: React.FC<DeepSearchToggleProps> = ({ active, onClick, disabled }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          className={`flex items-center px-3 gap-1 py-1.5 rounded-full transition font-medium whitespace-nowrap overflow-hidden justify-start ${
            active
              ? "bg-blue-600/10 outline outline-blue-600/60 text-blue-950"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          title="Deep Search"
          type="button"
          onClick={onClick}
          initial={false}
          animate={{
            width: active ? 110 : 36,
            paddingLeft: active ? 8 : 9,
          }}
          disabled={disabled}
        >
          <div className="flex-1">
            <Globe size={16} />
          </div>
          <motion.span
            className="pb-[1px] text-sm"
            initial={false}
            animate={{
              opacity: active ? 1 : 0,
            }}
          >
            Deep Search
          </motion.span>
        </motion.button>
      </TooltipTrigger>
      <TooltipContent>Enable deep search</TooltipContent>
    </Tooltip>
  );
};
