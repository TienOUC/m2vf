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
import { getSessionDetail } from '@/lib/api/client/sessions'
import { useSessionManager } from '@/hooks/useSessionManager'
import { useErrorHandler } from '@/hooks/useErrorHandler'

interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
  projectId: string | null
}

export function ChatPanel({ isOpen, onClose, projectId }: ChatPanelProps) {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    sessionId: string | null;
  }>({
    isOpen: false,
    sessionId: null,
  });

  // 使用错误处理 hook
  const { addError } = useErrorHandler();

  // 使用会话管理 hook
  const {
    sessions,
    isHistoryEmpty,
    isLoadingSessions,
    isCreatingSession,
    sessionError,
    currentSessionId,
    fetchSessions,
    handleNewSession,
    handleSwitchSession,
    handleDeleteSession,
    handleRenameSession,
    handleSessionUpdate
  } = useSessionManager({ projectId });

  // 使用聊天状态 hook
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

  // 加载指定会话详情
  const loadSession = useCallback(async (sessionId: string) => {
    if (!sessionId) return;
    
    setIsLoadingSession(true);
    try {
      // 调用获取会话详情的接口
      const response = await getSessionDetail(sessionId, 50) as any;
      
      // 更新会话配置
      if (response && response.config) {
        setSessionConfig(response.config);
      }
      
      // 处理响应数据中的 recent_messages
      if (response && response.recent_messages) {
        const recentMessages = response.recent_messages;
        loadMessagesFromApi(recentMessages);
      }
    } catch (error) {
      addError('加载会话失败，请重试');
    } finally {
      setIsLoadingSession(false);
    }
  }, [loadMessagesFromApi, setSessionConfig, addError]);

  // 初始化：获取会话列表
  useEffect(() => {
    if (isOpen && projectId) {
      fetchSessions();
    }
  }, [isOpen, projectId, fetchSessions]);

  // 自动加载最新会话或创建新会话
  useEffect(() => {
    const initSession = async () => {
      if (isOpen && projectId && !currentSessionId && !isLoadingSession && !isCreatingSession) {
        if (sessions.length > 0) {
          const sortedSessions = [...sessions].sort((a, b) => b.last_message_at - a.last_message_at);
          const latestSession = sortedSessions[0];
          await loadSession(latestSession.id);
          await handleSwitchSession(latestSession.id);
        } else if (isHistoryEmpty) {
          await handleNewSession();
        }
      }
    };

    initSession();
  }, [isOpen, projectId, sessions, isHistoryEmpty, currentSessionId, isLoadingSession, isCreatingSession, loadSession, handleSwitchSession, handleNewSession]);

  // 确认删除会话
  const handleConfirmDelete = async () => {
    const { sessionId } = deleteConfirmation;
    if (!sessionId) return;

    try {
      await handleDeleteSession(sessionId);
    } catch (error) {
      addError('删除会话失败，请重试');
    } finally {
      setDeleteConfirmation({ isOpen: false, sessionId: null });
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
        isLoadingSessions={isLoadingSessions}
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
