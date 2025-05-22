
import * as React from "react";
import { motion } from "motion/react";
import { ThinkToggle, DeepSearchToggle } from "./control-buttons";

interface ExpandedControlsProps {
  isExpanded: boolean;
  thinkActive: boolean;
  deepSearchActive: boolean;
  onThinkToggle: (e: React.MouseEvent) => void;
  onDeepSearchToggle: (e: React.MouseEvent) => void;
}

export const ExpandedControls: React.FC<ExpandedControlsProps> = ({
  isExpanded,
  thinkActive,
  deepSearchActive,
  onThinkToggle,
  onDeepSearchToggle,
}) => {
  return (
    <motion.div
      className="w-full flex justify-start px-4 items-center text-sm"
      variants={{
        hidden: {
          opacity: 0,
          y: 20,
          pointerEvents: "none" as const,
          transition: { duration: 0.25 },
        },
        visible: {
          opacity: 1,
          y: 0,
          pointerEvents: "auto" as const,
          transition: { duration: 0.35, delay: 0.08 },
        },
      }}
      initial="hidden"
      animate={isExpanded ? "visible" : "hidden"}
      style={{ marginTop: 8 }}
    >
      <div className="flex gap-3 items-center">
        {/* Think Toggle */}
        <ThinkToggle active={thinkActive} onClick={onThinkToggle} />

        {/* Deep Search Toggle */}
        <DeepSearchToggle active={deepSearchActive} onClick={onDeepSearchToggle} />
      </div>
    </motion.div>
  );
};
