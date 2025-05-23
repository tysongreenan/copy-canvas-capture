
import React, { useState } from 'react';
import { AIChatInput } from './ai-chat-input';

interface AnimatedAIChatProps {
  value?: string;
  onChange?: (value: string) => void;
  onSend?: () => void;
  isLoading?: boolean;
  thinkActive?: boolean;
  onThinkToggle?: (active: boolean) => void;
}

export const AnimatedAIChat: React.FC<AnimatedAIChatProps> = ({
  value,
  onChange,
  onSend,
  isLoading,
  thinkActive,
  onThinkToggle
}) => {
  return (
    <div className="w-full">
      <AIChatInput
        value={value}
        onChange={onChange}
        onSend={onSend}
        isLoading={isLoading}
        thinkActive={thinkActive}
        onThinkToggle={onThinkToggle}
      />
    </div>
  );
};
