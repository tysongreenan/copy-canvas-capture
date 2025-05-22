
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

// Default placeholders for the chat input
export const DEFAULT_CHAT_PLACEHOLDERS = [
  "Ask a question about your website content...",
  "How many products are listed on the homepage?",
  "What are your business hours?",
  "Tell me about your services",
  "What's your return policy?",
  "Do you offer international shipping?",
];

// Animation variants for the placeholder text
export const placeholderContainerVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.025 } },
  exit: { transition: { staggerChildren: 0.015, staggerDirection: -1 } },
};

export const letterVariants = {
  initial: {
    opacity: 0,
    filter: "blur(12px)",
    y: 10,
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      opacity: { duration: 0.25 },
      filter: { duration: 0.4 },
      y: { type: "spring", stiffness: 80, damping: 20 },
    },
  },
  exit: {
    opacity: 0,
    filter: "blur(12px)",
    y: -10,
    transition: {
      opacity: { duration: 0.2 },
      filter: { duration: 0.3 },
      y: { type: "spring", stiffness: 80, damping: 20 },
    },
  },
};

interface AnimatedPlaceholderProps {
  placeholders: string[];
  placeholderIndex: number;
  showPlaceholder: boolean;
}

export const AnimatedPlaceholder: React.FC<AnimatedPlaceholderProps> = ({
  placeholders,
  placeholderIndex,
  showPlaceholder,
}) => {
  return (
    <AnimatePresence mode="wait">
      {showPlaceholder && (
        <motion.span
          key={placeholderIndex}
          className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 select-none pointer-events-none"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            zIndex: 0,
          }}
          variants={placeholderContainerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {placeholders[placeholderIndex]
            .split("")
            .map((char, i) => (
              <motion.span
                key={i}
                variants={letterVariants}
                style={{ display: "inline-block" }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
        </motion.span>
      )}
    </AnimatePresence>
  );
};
