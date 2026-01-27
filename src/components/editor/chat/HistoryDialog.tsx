'use client'

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useClickOutside } from '@/hooks/ui/useClickOutside';

interface HistoryItem {
  id: string;
  name: string;
  timestamp: Date;
  type: 'image' | 'video' | 'text' | '3d';
}

interface HistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  triggerRef?: React.RefObject<HTMLButtonElement>;
}

// Group history items by date
const groupByDate = (items: HistoryItem[]) => {
  const groups: Record<string, HistoryItem[]> = {};
  
  items.forEach(item => {
    const date = new Date(item.timestamp).toISOString().split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
  });
  
  return Object.entries(groups).sort((a, b) => 
    new Date(b[0]).getTime() - new Date(a[0]).getTime()
  );
};

export function HistoryDialog({ isOpen, onClose, items, triggerRef }: HistoryDialogProps) {
  // 简化状态管理：使用对象存储展开状态，键为日期字符串，值为布尔值
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const dialogRef = useRef<HTMLDivElement>(null);
  
  // 计算默认展开的日期（今天或最近有记录的一天）
  const getDefaultExpandedDate = () => {
    const groupedHistory = groupByDate(items);
    if (groupedHistory.length === 0) return '';
    
    const todayStr = new Date().toISOString().split('T')[0];
    return groupedHistory.some(group => group[0] === todayStr) ? todayStr : groupedHistory[0][0];
  };
  
  // 使用 useClickOutside 钩子处理外部点击关闭
  useClickOutside([dialogRef], (e) => {
    // 检查点击事件是否在 triggerRef 中，如果是则不关闭菜单
    if (triggerRef?.current && triggerRef.current.contains(e.target as Node)) {
      return;
    }
    onClose();
  }, isOpen);
  
  const groupedHistory = groupByDate(items);
  const defaultExpandedDate = getDefaultExpandedDate();
  
  // 简化切换逻辑
  const toggleDay = (dateStr: string) => {
    setExpandedDays(prev => {
      // 如果是默认展开的日期且用户未手动修改，则切换状态
      // 否则，根据当前状态切换
      const isCurrentlyExpanded = prev[dateStr] ?? dateStr === defaultExpandedDate;
      return {
        ...prev,
        [dateStr]: !isCurrentlyExpanded
      };
    });
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      ref={dialogRef}
      className="absolute top-full right-0 mt-1 w-[280px] rounded-xl bg-background border border-border shadow-lg z-50 max-h-[400px] overflow-y-auto animate-in slide-in-from-top-2 duration-200"
    >
      <div className="p-2">
        {groupedHistory.map(([dateStr, items]) => {
          // 计算当前日期是否展开
          const isExpanded = expandedDays[dateStr] ?? dateStr === defaultExpandedDate;
          
          const formattedDate = new Date(dateStr).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          
          return (
            <div key={dateStr} className="mb-4 last:mb-0">
              <div className="relative flex items-center gap-2 w-full">
                {/* Timeline marker for date header */}
                <div className="absolute left-1.5 top-3 w-2 h-2 rounded-full bg-muted-foreground border-2 border-background z-10" />
                
                <Button
                  onClick={() => toggleDay(dateStr)}
                  variant="ghost"
                  className="flex items-center gap-2 w-full pl-6 py-2 rounded-lg hover:bg-accent"
                >
                  <div className="text-sm font-medium text-muted-foreground flex-1 text-left">
                    {formattedDate}
                  </div>
                  
                  {/* Expand/Collapse Icon */}
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </Button>
              </div>
              
              {/* Timeline Items */}
              <div className=" border-box pl-6 ml-2.5 border-l border-border transition-all duration-300 overflow-hidden">
                <div 
                  className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  {items.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className="flex items-start gap-2 w-full py-2 pl-2 rounded-lg hover:bg-accent justify-start"
                    >
                      {/* Item Content */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-foreground">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
