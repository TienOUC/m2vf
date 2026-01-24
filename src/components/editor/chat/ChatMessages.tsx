'use client'

import { useRef, useEffect } from 'react';
import type { ChatMessage } from '@/lib/types/studio';
import { ChatEmptyState } from './ChatEmptyState';
import { ChatMessage as ChatMessageItem } from './ChatMessage';
import { GenerationStatus } from './GenerationStatus';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  generationProgress: number;
}

export function ChatMessages({ messages, isGenerating, generationProgress }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  if (messages.length === 0 && !isGenerating) {
    return <ChatEmptyState />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5">
      {messages.map((message) => (
        <ChatMessageItem key={message.id} message={message} />
      ))}

      {isGenerating && (
        <GenerationStatus progress={generationProgress} />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
