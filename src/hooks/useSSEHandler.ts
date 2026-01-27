'use client'

import { useCallback, useRef, useState } from 'react';
import { streamChat } from '@/lib/api/client/sessions';
import { ChatMessage, SSEEvent, GenerationState } from '@/types/chat';
import { useErrorHandler } from './useErrorHandler';

interface UseSSEHandlerProps {
  sessionId: string;
  onSessionUpdate?: (updates: any) => void;
}

interface UseSSEHandlerReturn {
  isGenerating: boolean;
  generationProgress: number;
  error: string | null;
  cancelGeneration: () => void;
  handleSend: (input: string, selectedModelId: string, isAgentMode: boolean) => Promise<void>;
  assistantMessageRef: React.MutableRefObject<ChatMessage | null>;
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
  clearError: () => void;
}

export function useSSEHandler({ sessionId, onSessionUpdate }: UseSSEHandlerProps): UseSSEHandlerReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // 使用错误处理 hook
  const { addError } = useErrorHandler();
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const assistantMessageRef = useRef<ChatMessage | null>(null);
  const sessionStatesRef = useRef<Record<string, GenerationState>>({});

  // 清除错误消息
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 更新会话状态
  const updateSessionState = useCallback((generating: boolean, progress: number) => {
    setIsGenerating(generating);
    setGenerationProgress(progress);
    if (sessionId) {
      sessionStatesRef.current[sessionId] = { isGenerating: generating, progress };
    }
  }, [sessionId]);

  // 处理SSE事件
  const handleSSEEvent = useCallback((event: SSEEvent) => {
    switch (event.type) {
      case 'message':
        // 更新助手消息内容
        setMessages(prev => {
          const updatedMessages = [...prev];
          const assistantMsg = updatedMessages.find(msg => msg.role === 'assistant' && msg.id === assistantMessageRef.current?.id);
          
          if (assistantMsg) {
            assistantMsg.content = typeof event.data === 'string' ? event.data : JSON.stringify(event.data);
          }
          
          return updatedMessages;
        });
        break;
        
      case 'thought':
        // 处理思考链消息
        break;
        
      case 'data':
        // 处理结构化数据
        break;
        
      case 'error':
        // 处理错误
        const errorMessage = event.data.message || '发生错误';
        setError(errorMessage);
        addError(errorMessage);
        updateSessionState(false, 0);
        break;
        
      case 'done':
        // 完成生成
        updateSessionState(false, 0);
        if (assistantMessageRef.current) {
          setMessages(prev => {
            const updatedMessages = [...prev];
            const assistantMsg = updatedMessages.find(msg => msg.id === assistantMessageRef.current?.id);
            if (assistantMsg) {
              assistantMsg.status = 'complete';
            }
            return updatedMessages;
          });
        }
        break;
        
      default:
        break;
    }
  }, [updateSessionState, addError]);

  // 处理SSE错误
  const handleSSEError = useCallback((error: Error) => {
    const errorMessage = '连接服务器失败，请重试';
    setError(errorMessage);
    addError(errorMessage);
    updateSessionState(false, 0);
  }, [updateSessionState, addError]);

  // 取消当前请求
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    updateSessionState(false, 0);
  }, [updateSessionState]);

  // 发送消息
  const handleSend = useCallback(async (input: string, selectedModelId: string, isAgentMode: boolean) => {
    if (!input.trim()) return;

    // 清除之前的错误
    clearError();
    
    // 创建用户消息
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      status: 'complete',
    };

    // 添加用户消息到列表
    setMessages(prev => [...prev, userMessage]);
    updateSessionState(true, 0);

    // 立即通知更新会话列表的时间和消息数
    if (sessionId && sessionId !== 'default-session') {
      onSessionUpdate?.({
        last_message_at: Math.floor(Date.now() / 1000),
      });
    }

    // 创建助手消息占位符
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      modelUsed: selectedModelId,
      status: 'pending',
    };

    assistantMessageRef.current = assistantMessage;
    setMessages(prev => [...prev, assistantMessage]);

    // 创建AbortController用于取消请求
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // 调用流式对话API
    streamChat(
      {
        session_id: sessionId,
        content: input.trim(),
        model: selectedModelId,
        mode: isAgentMode ? 'managed' : 'chat',
      },
      handleSSEEvent,
      handleSSEError,
      abortController
    ).finally(() => {
      abortControllerRef.current = null;
    });

  }, [handleSSEEvent, handleSSEError, clearError, sessionId, onSessionUpdate, updateSessionState]);

  return {
    isGenerating,
    generationProgress,
    error,
    cancelGeneration,
    handleSend,
    assistantMessageRef,
    messages,
    setMessages,
    clearError
  };
}
