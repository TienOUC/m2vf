'use client'

import { useEffect, useState, useCallback } from 'react'
import { ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ChatHeader } from './chat/ChatHeader'
import { ChatMessages } from './chat/ChatMessages'
import { ChatInput } from './chat/ChatInput'
import { useChatState } from './chat/useChatState'
import { createSession, getSessions, getSessionDetail, updateSession, deleteSession } from '@/lib/api/client/sessions'

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
  const [isLoadingSessionsList, setIsLoadingSessionsList] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    sessionId: string | null;
  }>({
    isOpen: false,
    sessionId: null,
  });

  // 处理会话更新（来自 useChatState）
  const handleSessionUpdate = useCallback((updates: any) => {
    if (!currentSessionId) return;
    
    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        // 如果有 config 更新，需要深度合并
        if (updates.config) {
          return {
            ...session,
            ...updates,
            config: {
              ...session.config,
              ...updates.config
            }
          };
        }
        // 普通属性更新
        return { ...session, ...updates };
      }
      return session;
    }));
  }, [currentSessionId]);

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
    loadMoreMessages,
    hasMore,
    isLoadingMore,
    setSessionConfig,
    isWebSearchEnabled,
    isThinkingMode,
    handleModelChange,
    handleWebSearchChange,
    handleThinkingModeChange
  } = useChatState(currentSessionId || 'default-session', handleSessionUpdate);

  // 获取会话列表
  const fetchSessions = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoadingSessionsList(true);
    try {
      const response = await getSessions(projectId, {
        page: 1,
        page_size: 50 // 增加获取数量以显示更多历史
      }) as any;
      const sessionList = response.list || [];
      setSessions(sessionList);
      setIsHistoryEmpty(sessionList.length === 0);
      return sessionList;
    } catch (error) {
      console.error('获取会话列表失败:', error);
      // 发生错误时，如果不确定，暂不认为是空，以免误触发自动创建
      // 但如果是404等，可能确实是空
      // 这里保持原有逻辑，或者根据需要调整
    } finally {
      setIsLoadingSessionsList(false);
    }
  }, [projectId]);

  // 加载指定会话详情
  const loadSession = useCallback(async (sessionId: string) => {
    if (!sessionId) return;
    
    setIsLoadingSession(true);
    setSessionError(null);
    setCurrentSessionId(sessionId);
    
    try {
      // 调用获取会话详情的接口
      const response = await getSessionDetail(sessionId, 50) as any;
      console.log('加载会话成功:', response);
      
      // 更新会话配置
      if (response && response.config) {
        setSessionConfig(response.config);
      }
      
      // 处理响应数据中的 recent_messages
      if (response && response.recent_messages) {
        const recentMessages = response.recent_messages;
        console.log('会话消息:', recentMessages);
        // 调用 loadMessagesFromApi 函数更新消息列表
        loadMessagesFromApi(recentMessages);
      }
    } catch (error) {
      console.error('加载会话失败:', error);
      setSessionError('加载会话失败，请重试');
    } finally {
      setIsLoadingSession(false);
    }
  }, [loadMessagesFromApi, setSessionConfig]);

  // 初始化：获取会话列表
  useEffect(() => {
    if (isOpen && projectId) {
      fetchSessions();
    }
  }, [isOpen, projectId, fetchSessions]);

  // 自动加载最新会话或创建新会话
  useEffect(() => {
    const initSession = async () => {
      // 仅当没有当前会话ID且不在加载中时执行
      if (isOpen && projectId && !currentSessionId && !isLoadingSession && !isCreatingSession) {
        // 如果 sessions 为空且不是历史记录为空（即还未获取到 sessions），则等待 fetchSessions 更新
        // 但这里依赖 sessions 变化，所以逻辑如下：
        
        if (sessions.length > 0) {
          // 有历史会话，加载最新的
          const sortedSessions = [...sessions].sort((a, b) => b.last_message_at - a.last_message_at);
          const latestSession = sortedSessions[0];
          await loadSession(latestSession.id);
        } else if (isHistoryEmpty) {
          // 确实没有历史会话，创建新的
          handleNewSession();
        }
      }
    };

    initSession();
  }, [isOpen, projectId, sessions, isHistoryEmpty, currentSessionId, isLoadingSession, isCreatingSession, loadSession]);

  // 新建会话
  const handleNewSession = async () => {
    if (!projectId || isCreatingSession) return;

    setIsCreatingSession(true);
    setSessionError(null);
    try {
      const payload = {
        config: {
          max_tokens: 4096,
          model: "auto",
          system_prompt: "",
          temperature: 0.7,
          thinking_mode: false,
          web_search: false
        },
        project_id: projectId,
        title: "新对话"
      };

      const response = await createSession(payload) as any;
      console.log('创建会话成功:', response);
      
      // 更新状态
      setIsHistoryEmpty(false);
      const newSession = response;
      
      // 更新列表并选中新会话
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      
      // 清空当前消息（因为是新会话）
      loadMessagesFromApi([]); 
      
    } catch (error) {
      console.error('创建会话失败:', error);
      setSessionError('创建会话失败，请重试');
    } finally {
      setIsCreatingSession(false);
    }
  };

  // 切换会话
  const handleSwitchSession = async (sessionId: string) => {
    if (sessionId === currentSessionId) return;
    await loadSession(sessionId);
  };

  // 删除会话 - 触发确认弹窗
  const handleDeleteSession = (sessionId: string) => {
    setDeleteConfirmation({
      isOpen: true,
      sessionId,
    });
  };

  // 确认删除会话
  const handleConfirmDelete = async () => {
    const { sessionId } = deleteConfirmation;
    if (!sessionId) return;

    try {
      await deleteSession(sessionId);
      
      // 更新列表
      const newSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(newSessions);
      
      // 如果删除的是当前会话，则切换到最新的会话或清空
      if (sessionId === currentSessionId) {
        if (newSessions.length > 0) {
          const sortedSessions = [...newSessions].sort((a, b) => b.last_message_at - a.last_message_at);
          await loadSession(sortedSessions[0].id);
        } else {
          setCurrentSessionId(null);
          setIsHistoryEmpty(true);
          handleNewSession(); // 自动创建新的
        }
      }
    } catch (error) {
      console.error('删除会话失败:', error);
      // 可以添加 toast 提示
    } finally {
      setDeleteConfirmation({ isOpen: false, sessionId: null });
    }
  };

  // 重命名会话
  const handleRenameSession = async (sessionId: string, newName: string) => {
    try {
      await updateSession(sessionId, { title: newName });
      
      // 更新本地列表
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, title: newName } : s
      ));
    } catch (error) {
      console.error('重命名会话失败:', error);
    }
  };

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
      
      <ChatHeader 
        messages={messages} 
        projectId={projectId}
        sessions={sessions}
        isLoadingSessions={isLoadingSessionsList}
        onNewSession={handleNewSession}
        onSwitchSession={handleSwitchSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onRefreshSessions={fetchSessions}
      />
      
      {/* 错误消息显示 */}
      {(error || sessionError) && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm border-b border-border">
          {typeof error === 'string' ? error : (error as any)?.message || '未知错误'}
          {sessionError && !error && sessionError}
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
            onLoadMore={loadMoreMessages}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
          />
          <ChatInput 
            input={input} 
            selectedModel={selectedModel} 
            isGenerating={isGenerating} 
            onInputChange={setInput} 
            onSend={handleSend} 
            onSelectModel={handleModelChange} 
            isAgentMode={isAgentMode} 
            onToggleMode={setIsAgentMode} 
            onCancel={cancelGeneration}
            isWebSearchEnabled={isWebSearchEnabled}
            isThinkingMode={isThinkingMode}
            onToggleWebSearch={handleWebSearchChange}
            onToggleThinkingMode={handleThinkingModeChange}
          />
        </>
      )}

      <AlertDialog 
        open={deleteConfirmation.isOpen} 
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmation({ isOpen: false, sessionId: null });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除会话？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该会话记录，无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
