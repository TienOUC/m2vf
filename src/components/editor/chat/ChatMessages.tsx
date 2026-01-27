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
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function ChatMessages({ 
  messages, 
  isGenerating, 
  generationProgress,
  onLoadMore,
  hasMore,
  isLoadingMore 
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);

  const scrollToBottom = () => {
    // 只有当不是在加载更多历史消息时，才自动滚动到底部
    // 或者如果是初始加载
    if (!isLoadingMore) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // 当消息列表变化时
    if (isLoadingMore && containerRef.current) {
      // 如果是在加载更多消息，保持滚动位置
      const newScrollHeight = containerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - prevScrollHeightRef.current;
      containerRef.current.scrollTop += scrollDiff;
    } else {
      scrollToBottom();
    }
  }, [messages, isGenerating, isLoadingMore]);

  // 处理滚动事件
  const handleScroll = () => {
    if (!containerRef.current || !onLoadMore || !hasMore || isLoadingMore) return;

    if (containerRef.current.scrollTop === 0) {
      prevScrollHeightRef.current = containerRef.current.scrollHeight;
      onLoadMore();
    }
  };

  if (messages.length === 0 && !isGenerating) {
    return <ChatEmptyState />;
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-5"
      onScroll={handleScroll}
    >
      {isLoadingMore && (
        <div className="flex justify-center py-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
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
