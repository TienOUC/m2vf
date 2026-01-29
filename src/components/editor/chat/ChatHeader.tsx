'use client'

import { useState, useRef } from 'react';
import { History, Plus } from 'lucide-react';
import type { ChatMessage } from '@/lib/types/studio';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HistoryDialog } from './HistoryDialog';

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

interface ChatHeaderProps {
  messages: ChatMessage[];
  projectId: string | null;
  sessions: SessionItem[];
  isLoadingSessions: boolean;
  onNewSession: () => void;
  onSwitchSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newName: string) => void;
  onRefreshSessions: () => void;
}

export function ChatHeader({ 
  messages, 
  projectId,
  sessions,
  isLoadingSessions,
  onNewSession,
  onSwitchSession,
  onDeleteSession,
  onRenameSession,
  onRefreshSessions
}: ChatHeaderProps) {
  const [showHistory, setShowHistory] = useState(false);
  const chatTitle = messages.length > 0 
    ? (messages[0].content.length > 16 ? `${messages[0].content.slice(0, 16)}...` : messages[0].content)
    : '新对话';
  const historyButtonRef = useRef<HTMLButtonElement>(null);
  
  // 处理点击历史按钮事件
  const handleHistoryClick = () => {
    setShowHistory(!showHistory);
    if (!showHistory && projectId) {
      onRefreshSessions();
    }
  };

  return (
    <div className="h-10 flex items-center justify-between px-3 border-b border-border bg-background relative">
      <span className="text-xs font-medium tracking-wide text-muted-foreground">
        {chatTitle}
      </span>
      
      {/* 按钮容器，确保两个按钮挨着且整体右对齐 */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onNewSession}
              variant="ghost"
              size="icon"
              className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-accent hover:text-accent-foreground"
              aria-label="新建会话"
            >
              <Plus className="w-3 h-3 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>新建会话</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={historyButtonRef}
              onClick={handleHistoryClick}
              variant="ghost"
              size="icon"
              className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-accent hover:text-accent-foreground"
              aria-label="查看对话历史"
            >
              {isLoadingSessions ? (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <History className="w-3 h-3 text-muted-foreground" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>查看对话历史</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <HistoryDialog 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        items={sessions.map(session => ({
          id: session.id,
          name: session.title,
          timestamp: new Date(session.last_message_at ? session.last_message_at * 1000 : session.created_at || 0),
          type: 'text' 
        }))}
        triggerRef={historyButtonRef}
        onSelect={(id) => {
          onSwitchSession(id);
          setShowHistory(false);
        }}
        onDelete={onDeleteSession}
        onRename={onRenameSession}
      />
    </div>
  );
}
