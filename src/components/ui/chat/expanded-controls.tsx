
import * as React from "react";
import { motion } from "motion/react";
import { ThinkToggle, DeepSearchToggle } from "./control-buttons";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExpandedControlsProps {
  isExpanded: boolean;
  thinkActive: boolean;
  deepSearchActive: boolean;
  onThinkToggle: (e: React.MouseEvent) => void;
  onDeepSearchToggle: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export const ExpandedControls: React.FC<ExpandedControlsProps> = ({
  isExpanded,
  thinkActive,
  deepSearchActive,
  onThinkToggle,
  onDeepSearchToggle,
  disabled,
}) => {
  const isMobile = useIsMobile();
  
  // On mobile, show fewer controls
  const controlsToShow = isMobile ? 1 : 2;

  return (
    <motion.div
      className="w-full flex justify-start px-4 items-center"
      variants={{
        hidden: {
          opacity: 0,
          y: 15,
          pointerEvents: "none" as const,
          transition: { duration: 0.2 },
        },
        visible: {
          opacity: 1,
          y: 0,
          pointerEvents: "auto" as const,
          transition: { duration: 0.25, delay: 0.05 },
        },
      }}
      initial="hidden"
      animate={isExpanded ? "visible" : "hidden"}
      style={{ marginTop: 4 }}
    >
      <div className="flex gap-2 items-center">
        {/* Think Toggle - Always show */}
        <ThinkToggle 
          active={thinkActive} 
          onClick={onThinkToggle} 
          disabled={disabled}
        />

        {/* Deep Search Toggle - Hide on mobile */}
        {controlsToShow > 1 && (
          <DeepSearchToggle 
            active={deepSearchActive} 
            onClick={onDeepSearchToggle} 
            disabled={disabled}
          />
        )}
      </div>
    </motion.div>
  );
};
