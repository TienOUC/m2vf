'use client'

import { useState, useRef } from 'react';
import { History, Plus } from 'lucide-react';
import type { ChatMessage } from '@/lib/types/studio';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HistoryDialog } from './HistoryDialog';
import { getSessions } from '@/lib/api/client/sessions';

interface ChatHeaderProps {
  messages: ChatMessage[];
  projectId: string | null;
}

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

interface HistoryItem {
  id: string;
  name: string;
  timestamp: Date;
  type: 'image' | 'video' | 'text' | '3d';
}

export function ChatHeader({ messages, projectId }: ChatHeaderProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatTitle = messages.length > 0 
    ? `${messages[0].content.slice(0, 16)}...` 
    : '新对话';
  const historyButtonRef = useRef<HTMLButtonElement>(null);
  
  // 处理点击历史按钮事件
  const handleHistoryClick = async () => {
    setShowHistory(!showHistory);
    if (!showHistory && projectId) {
      // 仅当展开历史记录且有projectId时才请求数据
      setIsLoading(true);
      try {
        const response = await getSessions(projectId, {
          page: 1,
          page_size: 10
        }) as any;
        setSessions(response.list || []);
      } catch (error) {
        console.error('获取会话列表失败:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 处理点击新建会话按钮事件
  const handleNewSession = () => {
    // 新建会话逻辑，这里可以根据实际需求实现
    console.log('新建会话');
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
              onClick={handleNewSession}
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
              {isLoading ? (
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
          timestamp: new Date(session.last_message_at * 1000),
          type: 'text' // 默认类型，实际应用中可以根据会话内容类型设置
        }))}
        triggerRef={historyButtonRef}
      />
    </div>
  );
}
