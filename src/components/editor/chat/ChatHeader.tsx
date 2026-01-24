'use client'

import { useState, useRef } from 'react';
import { History } from 'lucide-react';
import type { ChatMessage } from '@/lib/types/studio';
import { Button } from '@/components/ui/button';
import { HistoryDialog } from './HistoryDialog';

interface ChatHeaderProps {
  messages: ChatMessage[];
}

interface HistoryItem {
  id: string;
  name: string;
  timestamp: Date;
  type: 'image' | 'video' | 'text' | '3d';
}

// Mock历史记录数据
const mockHistory: HistoryItem[] = [
  { id: '1', name: '樱花小猫设计', timestamp: new Date('2026-01-23T14:30:00'), type: 'image' },
  { id: '2', name: '梦幻场景创作', timestamp: new Date('2026-01-23T13:15:00'), type: '3d' },
  { id: '3', name: '科技感界面', timestamp: new Date('2026-01-22T16:45:00'), type: 'image' },
  { id: '4', name: '自然风景生成', timestamp: new Date('2026-01-22T10:20:00'), type: 'video' },
  { id: '5', name: '产品展示视频', timestamp: new Date('2026-01-21T15:30:00'), type: 'video' },
  { id: '6', name: '文本内容生成', timestamp: new Date('2026-01-21T09:15:00'), type: 'text' },
  { id: '7', name: '建筑设计方案', timestamp: new Date('2026-01-20T14:45:00'), type: '3d' },
  { id: '8', name: 'Logo设计', timestamp: new Date('2026-01-20T11:20:00'), type: 'image' },
];

export function ChatHeader({ messages }: ChatHeaderProps) {
  const [showHistory, setShowHistory] = useState(false);
  const chatTitle = messages.length > 0 
    ? `${messages[0].content.slice(0, 16)}...` 
    : '新对话';
  const historyButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="h-10 flex items-center justify-between px-3 border-b border-border bg-background relative">
      <span className="text-xs font-medium tracking-wide text-muted-foreground">
        {chatTitle}
      </span>
      
      <Button
        ref={historyButtonRef}
        onClick={() => setShowHistory(!showHistory)}
        variant="ghost"
        size="icon"
        className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-accent hover:text-accent-foreground"
        aria-label="查看对话历史"
      >
        <History className="w-3 h-3 text-muted-foreground" />
      </Button>
      
      <HistoryDialog 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        items={mockHistory}
        triggerRef={historyButtonRef}
      />
    </div>
  );
}
