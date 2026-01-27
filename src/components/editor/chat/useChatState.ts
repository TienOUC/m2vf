'use client'

import { useState, useCallback } from 'react';
import { streamChat, getSessionMessages, updateSession } from '@/lib/api/client/sessions';
import { ChatMessage, SessionUpdate } from '@/types/chat';
import type { AIModel } from '@/lib/types/studio';
import { useSSEHandler } from '@/hooks/useSSEHandler';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export function useChatState(
  sessionId: string = 'default-session',
  onSessionUpdate?: (updates: SessionUpdate) => void
) {
  const toText = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
      if (typeof value.content === 'string') return value.content;
      if (typeof value.message === 'string') return value.message;
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return value == null ? '' : String(value);
  };



  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>({ 
    id: 'auto', 
    name: 'Auto', 
    category: 'image', 
    description: '自动选择模型', 
    icon: 'openai' 
  });
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // 使用错误处理 hook
  const { addError } = useErrorHandler();

  // 使用 SSE 处理器 hook
  const {
    isGenerating,
    generationProgress,
    error,
    cancelGeneration,
    handleSend: handleSSESend,
    messages,
    setMessages,
    clearError
  } = useSSEHandler({ sessionId, onSessionUpdate });

  // 格式化 API 返回的消息
  const formatApiMessages = useCallback((apiMessages: any[]) => {
    return apiMessages.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: toText(msg.content),
      timestamp: new Date(msg.created_at * 1000),
      modelUsed: msg.metadata?.model,
      status: msg.status === 'done' ? 'complete' : 'pending',
      imageUrl: msg.metadata?.generated_artifacts?.find((artifact: string) => artifact.includes('image')),
      videoUrl: msg.metadata?.generated_artifacts?.find((artifact: string) => artifact.includes('video'))
    })) as ChatMessage[];
  }, []);
  
  // 从API加载消息
  const loadMessagesFromApi = useCallback((apiMessages: any[]) => {
    if (apiMessages) {
      const formattedMessages = formatApiMessages(apiMessages);
      setMessages(formattedMessages);
      // 如果首次加载的数量等于页大小，可能还有更多
      setHasMore(apiMessages.length >= PAGE_SIZE);
      setPage(1);
    }
  }, [formatApiMessages, setMessages]);

  // 加载更多历史消息
  const loadMoreMessages = useCallback(async () => {
    if (isLoadingMore || !hasMore || !sessionId) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await getSessionMessages(sessionId, { 
        page: nextPage, 
        page_size: PAGE_SIZE 
      }) as any;

      if (response.list && response.list.length > 0) {
        const newMessages = formatApiMessages(response.list);
        
        // 将新消息添加到列表头部（因为是历史消息）
        // 注意：这里假设 API 返回的是按时间倒序的列表
        setMessages([...newMessages.reverse(), ...messages]);
        setPage(nextPage);
        setHasMore(response.list.length >= PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      addError('加载历史消息失败，请重试');
    } finally {
      setIsLoadingMore(false);
    }
  }, [sessionId, page, hasMore, isLoadingMore, formatApiMessages, messages, setMessages, addError]);

  // 设置会话配置
  const setSessionConfig = useCallback((config: any) => {
    if (config?.model) {
      // 这里简单映射一下模型ID到 AIModel 对象，实际可能需要从配置列表获取
      // 暂时只更新 ID 和名称
      setSelectedModel(prev => ({
        ...prev,
        id: config.model,
        name: config.model // 简化处理，实际应该查找模型名称
      }));
    }
    
    if (config?.web_search !== undefined) {
      setIsWebSearchEnabled(config.web_search);
    }
    
    if (config?.thinking_mode !== undefined) {
      setIsThinkingMode(config.thinking_mode);
    }
    
    // 其他配置如 system_prompt, temperature 等后续支持
  }, []);

  // 更新配置并持久化
  const updateSessionConfig = useCallback(async (updates: { 
    model?: string; 
    web_search?: boolean; 
    thinking_mode?: boolean;
    system_prompt?: string;
  }) => {
    // 只有在有效会话中才持久化
    if (sessionId && sessionId !== 'default-session') {
      try {
        await updateSession(sessionId, {
          config: updates
        });
      } catch (error) {
        addError('更新会话配置失败，请重试');
      }
    }
  }, [sessionId, addError]);

  // 处理模型变更
  const handleModelChange = useCallback((model: AIModel) => {
    setSelectedModel(model);
    updateSessionConfig({ model: model.id });
  }, [updateSessionConfig]);

  // 处理Web搜索变更
  const handleWebSearchChange = useCallback(() => {
    setIsWebSearchEnabled(prev => {
      const newValue = !prev;
      updateSessionConfig({ web_search: newValue });
      return newValue;
    });
  }, [updateSessionConfig]);

  // 处理深度思考变更
  const handleThinkingModeChange = useCallback(() => {
    setIsThinkingMode(prev => {
      const newValue = !prev;
      updateSessionConfig({ thinking_mode: newValue });
      return newValue;
    });
  }, [updateSessionConfig]);
  
  // 发送消息
  const handleSend = useCallback(() => {
    if (!input.trim() || isGenerating) return;

    // 自动更新标题：如果是第一条消息，更新标题
    if (messages.length === 0 && sessionId && sessionId !== 'default-session') {
      const newTitle = input.trim().slice(0, 30);
      // 异步更新，不阻塞
      updateSession(sessionId, { title: newTitle })
        .then(() => {
          onSessionUpdate?.({ 
            title: newTitle
          });
        })
        .catch(e => {
          addError('更新会话标题失败，请重试');
        });
    }

    // 使用 SSE 处理器发送消息
    handleSSESend(input, selectedModel.id, isAgentMode);
    setInput('');
  }, [input, isGenerating, selectedModel, isAgentMode, messages.length, sessionId, onSessionUpdate, handleSSESend, addError]);

  return {
    messages,
    input,
    selectedModel,
    isGenerating,
    generationProgress,
    isAgentMode,
    error,
    setIsAgentMode,
    setInput,
    setSelectedModel,
    handleSend,
    cancelGeneration,
    loadMessagesFromApi,
    loadMoreMessages,
    hasMore,
    isLoadingMore,
    setSessionConfig,
    isWebSearchEnabled,
    isThinkingMode,
    handleModelChange,
    handleWebSearchChange,
    handleThinkingModeChange
  };
}
