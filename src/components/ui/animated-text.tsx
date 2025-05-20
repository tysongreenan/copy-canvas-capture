
"use client";

import { animate } from "framer-motion";
import { useEffect, useState } from "react";

export function useAnimatedText(text: string, delimiter: string = "") {
  const [cursor, setCursor] = useState(0);
  const [startingCursor, setStartingCursor] = useState(0);
  const [prevText, setPrevText] = useState(text);

  // Reset animation when text changes
  if (prevText !== text) {
    setPrevText(text);
    setStartingCursor(text.startsWith(prevText) ? cursor : 0);
  }

  useEffect(() => {
    if (!text) return; // Don't animate empty text
    
    const parts = text.split(delimiter);
    const duration = delimiter === "" ? 8 : // Character animation
                    delimiter === " " ? 4 : // Word animation
                    2; // Chunk animation
    
    const controls = animate(startingCursor, parts.length, {
      duration,
      ease: "easeOut",
      onUpdate(latest) {
        setCursor(Math.floor(latest));
      },
    });

    return () => controls.stop();
  }, [startingCursor, text, delimiter]);

  if (!text) return ""; // Return empty string for empty text
  
  return text.split(delimiter).slice(0, cursor).join(delimiter);
}
