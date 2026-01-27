'use client'

import { useEffect, useState } from 'react'
import { ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChatHeader } from './chat/ChatHeader'
import { ChatMessages } from './chat/ChatMessages'
import { ChatInput } from './chat/ChatInput'
import { useChatState } from './chat/useChatState'
import { createSession, getSessions, getSessionDetail } from '@/lib/api/client/sessions'

interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
  projectId: string | null
}

// 会话项类型
interface SessionItem {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
  last_message_at: number;
  message_count: number;
  project_id: string;
  status: number;
  config: {
    max_tokens: number;
    model: string;
    system_prompt: string;
    temperature: number;
    thinking_mode: boolean;
    web_search: boolean;
  };
}

export function ChatPanel({ isOpen, onClose, projectId }: ChatPanelProps) {
  const [isHistoryEmpty, setIsHistoryEmpty] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const {
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
  } = useChatState(currentSessionId || 'default-session');

  // 检查历史会话是否为空
  useEffect(() => {
    const checkHistoryEmpty = async () => {
      if (projectId) {
        try {
          const response = await getSessions(projectId, {
            page: 1,
            page_size: 10
          }) as any;
          const sessionList = response.list || [];
          setSessions(sessionList);
          setIsHistoryEmpty(sessionList.length === 0);
        } catch (error) {
          console.error('获取会话列表失败:', error);
          // 发生错误时，默认认为历史会话为空
          setIsHistoryEmpty(true);
          setSessions([]);
        }
      }
    };

    checkHistoryEmpty();
  }, [projectId]);

  // 加载最新会话数据的逻辑
  useEffect(() => {
    const loadLatestSession = async () => {
      // 当满足以下条件时加载最新会话数据：
      // 1. ChatPanel 处于展开状态
      // 2. 历史会话不为空
      // 3. 有有效的 projectId
      // 4. 不在加载会话的过程中
      if (isOpen && !isHistoryEmpty && projectId && sessions.length > 0 && !isLoadingSession) {
        setIsLoadingSession(true);
        setSessionError(null);
        try {
          // 按最后消息时间排序，获取最新的会话
          const sortedSessions = [...sessions].sort((a, b) => b.last_message_at - a.last_message_at);
          const latestSession = sortedSessions[0];
          
          if (latestSession) {
            setCurrentSessionId(latestSession.id);
            // 调用获取会话详情的接口
            const response = await getSessionDetail(latestSession.id, 50) as any;
            console.log('加载最新会话成功:', response);
            
            // 处理响应数据中的 recent_messages
            if (response.data && response.data.recent_messages) {
              const recentMessages = response.data.recent_messages;
              console.log('会话消息:', recentMessages);
              // 调用 loadMessagesFromApi 函数更新消息列表
              loadMessagesFromApi(recentMessages);
            }
          }
        } catch (error) {
          console.error('加载最新会话失败:', error);
          setSessionError('加载会话失败，请重试');
        } finally {
          setIsLoadingSession(false);
        }
      }
    };

    loadLatestSession();
  }, [isOpen, isHistoryEmpty, projectId, sessions, isLoadingSession]);

  // 自动创建会话的逻辑
  useEffect(() => {
    const autoCreateSession = async () => {
      // 当满足以下条件时自动创建会话：
      // 1. ChatPanel 处于展开状态
      // 2. 历史会话为空
      // 3. ChatPanel 内容为空（messages 为空）
      // 4. 有有效的 projectId
      // 5. 不在创建会话的过程中
      if (isOpen && isHistoryEmpty && messages.length === 0 && projectId && !isCreatingSession) {
        setIsCreatingSession(true);
        setSessionError(null);
        try {
          const payload = {
            config: {
              max_tokens: 4096,
              model: "gpt-4o",
              system_prompt: "",
              temperature: 0.5,
              thinking_mode: false,
              web_search: false
            },
            project_id: projectId,
            title: "新对话"
          };

          const response = await createSession(payload) as any;
          console.log('自动创建会话成功:', response);
          // 创建会话成功后，更新历史会话状态
          setIsHistoryEmpty(false);
          // 更新会话列表
          setSessions([response.data]);
          setCurrentSessionId(response.data.id);
        } catch (error) {
          console.error('自动创建会话失败:', error);
          setSessionError('创建会话失败，请重试');
        } finally {
          setIsCreatingSession(false);
        }
      }
    };

    autoCreateSession();
  }, [isOpen, isHistoryEmpty, messages.length, projectId, isCreatingSession]);

  return (
    <div
      className={cn(
        "fixed top-0 right-0 bottom-0 w-[500px] flex flex-col z-50 transition-all duration-300 border-l border-border bg-background",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {isOpen && (
        <Button
          onClick={onClose}
          variant="ghost"
          className="absolute left-[-34px] top-[40px] w-8 h-10 rounded-l-full bg-background border-y border-l border-border flex items-center justify-center transition-all hover:bg-accent hover:text-accent-foreground z-50 shadow-sm"
          aria-label="收起聊天面板"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Button>
      )}
      
      <ChatHeader messages={messages} projectId={projectId} />
      
      {/* 错误消息显示 */}
      {(error || sessionError) && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm border-b border-border">
          {error || sessionError}
        </div>
      )}
      
      {/* 加载状态显示 */}
      {isLoadingSession && (
        <div className="flex items-center justify-center p-6">
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">加载会话中...</span>
        </div>
      )}
      
      {!isLoadingSession && (
        <>
          <ChatMessages 
            messages={messages} 
            isGenerating={isGenerating} 
            generationProgress={generationProgress} 
          />
          <ChatInput 
            input={input} 
            selectedModel={selectedModel} 
            isGenerating={isGenerating} 
            onInputChange={setInput} 
            onSend={handleSend} 
            onSelectModel={setSelectedModel} 
            isAgentMode={isAgentMode} 
            onToggleMode={setIsAgentMode} 
            onCancel={cancelGeneration}
          />
        </>
      )}
    </div>
  )
}

