'use client'

import { useState, useEffect } from 'react';
import type { ChatMessage, AIModel } from '@/lib/types/studio';
import { mock } from '@/lib/mock';

const MOCK_MESSAGES = mock.data.chatMessages;

export function useChatState() {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>(mock.data.aiModels[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isAgentMode, setIsAgentMode] = useState(false);

  useEffect(() => {
    if (!isGenerating) return;
    
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          setIsGenerating(false);
          return 0;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);
    setGenerationProgress(0);

    setTimeout(() => {
      const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '已为您生成新的图像。',
          timestamp: new Date(),
          modelUsed: selectedModel.name,
          status: 'complete',
          imageUrl: 'https://picsum.photos/800/600',
        };
      setMessages(prev => [...prev, assistantMessage]);
      setIsGenerating(false);
    }, 3000);
  };

  return {
    messages,
    input,
    selectedModel,
    isGenerating,
    generationProgress,
    isAgentMode,
    setIsAgentMode,
    setInput,
    setSelectedModel,
    handleSend,
  };
}
