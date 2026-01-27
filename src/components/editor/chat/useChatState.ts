'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ChatMessage, AIModel } from '@/lib/types/studio';
import { streamChat } from '@/lib/api/client/sessions';

export function useChatState() {
  // 使用当前项目的默认会话ID，实际应用中应从项目状态或URL获取
  const sessionId = 'default-session';
  
  // 从localStorage恢复消息
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const savedMessages = localStorage.getItem(`chat_messages_${sessionId}`);
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>({ id: 'gpt-4o', name: 'GPT-4o', category: 'image', description: 'GPT-4o模型', icon: 'icon' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const assistantMessageRef = useRef<ChatMessage | null>(null);
  
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
            assistantMsg.content = event.data.content;
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
        content: input.trim(),
        model: selectedModel.id,
        temperature: 0.7,
        thinking_mode: isAgentMode,
        web_search: false,
      },
      handleSSEEvent,
      handleSSEError,
      abortController
    ).finally(() => {
      abortControllerRef.current = null;
    });
  }, [input, isGenerating, selectedModel, isAgentMode, handleSSEEvent, handleSSEError, clearError]);

  // 从服务器获取历史消息
  useEffect(() => {
    const fetchHistoryMessages = async () => {
      try {
        // 这里可以调用getSessionMessages API获取历史消息
        // 暂时注释，因为API可能还没有实现
        // const response = await getSessionMessages(sessionId, { page: 1, page_size: 50 });
        // setMessages(response.data.messages || []);
      } catch (error) {
        console.error('Failed to fetch history messages:', error);
        // 如果获取失败，继续使用localStorage中的消息
      }
    };

    fetchHistoryMessages();
  }, [sessionId]);

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
  };
}
