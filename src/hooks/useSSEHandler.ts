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
    // 优先使用 payload 中的 type，如果不存在则使用 SSE 协议的 event type
    const effectiveType = event.data?.type || event.type;
    
    switch (effectiveType) {
      case 'message':
        // 更新助手消息内容
        setMessages(prev => {
          const updatedMessages = [...prev];
          const assistantMsg = updatedMessages.find(msg => msg.role === 'assistant' && msg.id === assistantMessageRef.current?.id);
          
          if (assistantMsg) {
            // 处理不同的消息格式
            if (event.data?.content?.text) {
              // 1. 标准格式: { type: "message", content: { text: "..." } }
              // 如果是增量更新，可能需要追加；如果是全量替换，则直接赋值
              // 假设是流式追加，或者每次返回完整文本？
              // 根据 data.txt，似乎是独立的消息块。如果是流式，通常是 token。
              // 这里假设如果是 text 字段，就是直接的内容
              // 如果是流式，通常会有 finish_reason 等。
              // 既然 data.txt 是 message 类型，且有 sequence，可能是追加。
              // 但为了简单，如果内容不重复，追加；或者直接赋值（如果后端发送的是完整累积文本）。
              // 多数流式API发送的是 delta。
              // 观察 data.txt: "text":"已收到你的请求..."
              // 假设是追加模式，或者直接替换（如果是完整文本）。
              // 通常 SSE message event 是 delta。
              // 但 data.txt 看起来像是一个完整的句子。
              // 让我们假设是追加模式，除非它是第一条。
              // 或者是覆盖模式？
              // 让我们先用覆盖模式，因为 ChatMessage 只有 content 字符串。
              // 不，流式通常是追加。
              // 修正：如果 event.data.content.text 存在，追加它。
              // 但要注意重复。
              // 让我们看看 data.txt，只有一个 message 示例。
              // 无论如何，这里更新 content。
              assistantMsg.content = event.data.content.text;
            } else if (typeof event.data === 'string') {
              assistantMsg.content = event.data;
            } else if (event.data?.text) {
              assistantMsg.content = event.data.text;
            }
          }
          
          return updatedMessages;
        });
        break;
        
      case 'thought':
        // 处理思考链/状态提示
        if (event.data?.content?.desc) {
          setMessages(prev => {
            const updatedMessages = [...prev];
            const assistantMsg = updatedMessages.find(msg => msg.role === 'assistant' && msg.id === assistantMessageRef.current?.id);
            if (assistantMsg) {
              assistantMsg.thought = event.data.content.desc;
            }
            return updatedMessages;
          });
        }
        break;
        
      case 'artifact':
        // 处理生成的artifact（如图像）初始创建
        if (event.data?.content) {
          const artifact = event.data.content;
          setMessages(prev => {
            const updatedMessages = [...prev];
            const assistantMsg = updatedMessages.find(msg => msg.role === 'assistant' && msg.id === assistantMessageRef.current?.id);
            if (assistantMsg) {
              const newArtifact = {
                id: artifact.id || Date.now().toString(),
                type: artifact.type || 'image',
                url: artifact.url,
                status: artifact.status || 'pending',
                width: artifact.width,
                height: artifact.height
              };
              
              if (!assistantMsg.artifacts) {
                assistantMsg.artifacts = [];
              }
              // 避免重复添加
              if (!assistantMsg.artifacts.find(a => a.id === newArtifact.id)) {
                assistantMsg.artifacts.push(newArtifact);
              }
            }
            return updatedMessages;
          });
        }
        break;
        
      case 'artifact_status':
        // 处理artifact状态更新
        if (event.data?.content?.artifacts) {
          const artifactUpdates = event.data.content.artifacts;
          
          setMessages(prev => {
            const updatedMessages = [...prev];
            const assistantMsg = updatedMessages.find(msg => msg.role === 'assistant' && msg.id === assistantMessageRef.current?.id);
            
            if (assistantMsg && assistantMsg.artifacts) {
              artifactUpdates.forEach((update: any) => {
                const artifact = assistantMsg.artifacts?.find(a => a.id === update.id);
                if (artifact) {
                  artifact.status = update.status;
                  if (update.url) artifact.url = update.url;
                  
                  // 如果完成了，同时也更新 message.imageUrl / videoUrl 为了兼容旧代码
                  if (update.status === 'completed' && update.url) {
                    if (artifact.type === 'image') assistantMsg.imageUrl = update.url;
                    if (artifact.type === 'video') assistantMsg.videoUrl = update.url;
                  }
                }
              });

              // 如果所有任务完成，清除 thought
              if (event.data.content.all_done) {
                assistantMsg.thought = undefined;
              }
            }
            return updatedMessages;
          });
        }
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

    // 更新当前消息状态为完成，并清除loading状态
    if (assistantMessageRef.current) {
      setMessages(prev => {
        const updatedMessages = [...prev];
        const index = updatedMessages.findIndex(msg => msg.id === assistantMessageRef.current?.id);
        
        if (index !== -1) {
          const assistantMsg = { ...updatedMessages[index] };
          assistantMsg.status = 'complete';
          // 清除思考/提示信息
          assistantMsg.thought = undefined;
          
          // 将所有进行中的 artifacts 标记为失败
          if (assistantMsg.artifacts) {
            assistantMsg.artifacts = assistantMsg.artifacts.map(artifact => {
              if (artifact.status === 'pending' || artifact.status === 'processing') {
                return { ...artifact, status: 'failed' };
              }
              return artifact;
            });
          }
          
          updatedMessages[index] = assistantMsg;
        }
        return updatedMessages;
      });
    }
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
