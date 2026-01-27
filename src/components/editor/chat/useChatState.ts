'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ChatMessage, AIModel } from '@/lib/types/studio';
import { streamChat, getSessionMessages, updateSession } from '@/lib/api/client/sessions';

export function useChatState(
  sessionId: string = 'default-session',
  onSessionUpdate?: (updates: any) => void
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

  // 消息列表状态
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

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
  }, [formatApiMessages]);

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
        setMessages(prev => [...newMessages.reverse(), ...prev]);
        setPage(nextPage);
        setHasMore(response.list.length >= PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [sessionId, page, hasMore, isLoadingMore, formatApiMessages]);
  
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>({ id: 'gpt-4o', name: 'GPT-4o', category: 'image', description: 'GPT-4o模型', icon: 'icon' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const assistantMessageRef = useRef<ChatMessage | null>(null);

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
        console.error('Failed to update session config:', error);
      }
    }
  }, [sessionId]);

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
  
  // 保存消息到localStorage
  useEffect(() => {
    localStorage.setItem(`chat_messages_${sessionId}`, JSON.stringify(messages));
  }, [messages, sessionId]);

  // 清除错误消息
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 处理SSE事件
  const handleSSEEvent = useCallback((event: any) => {
    switch (event.type) {
      case 'message':
        // 更新助手消息内容
        setMessages(prev => {
          const updatedMessages = [...prev];
          const assistantMsg = updatedMessages.find(msg => msg.role === 'assistant' && msg.id === assistantMessageRef.current?.id);
          
          if (assistantMsg) {
            assistantMsg.content = toText(event.data);
          }
          
          return updatedMessages;
        });
        break;
        
      case 'thought':
        // 处理思考链消息
        console.log('Assistant thought:', event.data);
        break;
        
      case 'data':
        // 处理结构化数据
        console.log('Assistant data:', event.data);
        break;
        
      case 'error':
        // 处理错误
        setError(event.data.message || '发生错误');
        setIsGenerating(false);
        setGenerationProgress(0);
        break;
        
      case 'done':
        // 完成生成
        setIsGenerating(false);
        setGenerationProgress(0);
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
        console.log('Unknown event type:', event.type, event.data);
    }
  }, []);

  // 处理SSE错误
  const handleSSEError = useCallback((error: Error) => {
    console.error('Stream chat error:', error);
    setError('连接服务器失败，请重试');
    setIsGenerating(false);
    setGenerationProgress(0);
  }, []);

  // 取消当前请求
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setGenerationProgress(0);
  }, []);

  // 发送消息
  const handleSend = useCallback(() => {
    if (!input.trim() || isGenerating) return;

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
    setInput('');
    setIsGenerating(true);
    setGenerationProgress(0);

    // 创建助手消息占位符
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          modelUsed: selectedModel.name,
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
        model: selectedModel.id,
        temperature: 0.7,
        thinking_mode: isAgentMode && isThinkingMode,
        web_search: isAgentMode && isWebSearchEnabled,
      },
      handleSSEEvent,
      handleSSEError,
      abortController
    ).finally(() => {
      abortControllerRef.current = null;
    });

    // 自动更新标题：如果是第一条消息（当前消息列表为空，不包含刚添加的pending消息），更新标题
    // 注意：这里 messages 是闭包中的值，是旧值。
    // 但是我们刚刚调用了 setMessages，这不会立即更新 messages 变量。
    // 所以如果 messages.length === 0，说明这是第一条。
    if (messages.length === 0 && sessionId && sessionId !== 'default-session') {
      const newTitle = input.trim().slice(0, 30);
      // 异步更新，不阻塞
      updateSession(sessionId, { title: newTitle })
        .then(() => {
          onSessionUpdate?.({ title: newTitle });
        })
        .catch(e => console.error('Auto update title failed:', e));
    }
  }, [input, isGenerating, selectedModel, isAgentMode, isThinkingMode, isWebSearchEnabled, handleSSEEvent, handleSSEError, clearError, messages.length, sessionId, onSessionUpdate]);

  // 从服务器获取历史消息 - 已移除，由外部控制加载
  // useEffect(() => {
  //   const fetchHistoryMessages = async () => { ... }
  //   fetchHistoryMessages();
  // }, [sessionId]);

  // 清理函数
  useEffect(() => {
    return () => {
      // 组件卸载时取消正在进行的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  // 网络重连提示效果
  useEffect(() => {
    if (error?.includes('连接服务器失败')) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
