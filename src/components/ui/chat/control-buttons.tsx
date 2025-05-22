
import * as React from "react";
import { motion } from "motion/react";
import { Globe, Lightbulb } from "lucide-react";

interface ThinkToggleProps {
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const ThinkToggle: React.FC<ThinkToggleProps> = ({ active, onClick }) => {
  return (
    <button
      className={`flex items-center gap-1 px-4 py-2 rounded-full transition-all font-medium group ${
        active
          ? "bg-blue-600/10 outline outline-blue-600/60 text-blue-950"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
      title="Think"
      type="button"
      onClick={onClick}
    >
      <Lightbulb
        className="group-hover:fill-yellow-300 transition-all"
        size={18}
      />
      Think
    </button>
  );
};

interface DeepSearchToggleProps {
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const DeepSearchToggle: React.FC<DeepSearchToggleProps> = ({ active, onClick }) => {
  return (
    <motion.button
      className={`flex items-center px-4 gap-1 py-2 rounded-full transition font-medium whitespace-nowrap overflow-hidden justify-start ${
        active
          ? "bg-blue-600/10 outline outline-blue-600/60 text-blue-950"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
      title="Deep Search"
      type="button"
      onClick={onClick}
      initial={false}
      animate={{
        width: active ? 125 : 36,
        paddingLeft: active ? 8 : 9,
      }}
    >
      <div className="flex-1">
        <Globe size={18} />
      </div>
      <motion.span
        className="pb-[2px]"
        initial={false}
        animate={{
          opacity: active ? 1 : 0,
        }}
      >
        Deep Search
      </motion.span>
    </motion.button>
  );
};
