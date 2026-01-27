'use client'

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClickOutside } from '@/hooks/ui/useClickOutside';
import { MoreHorizontal, Trash, Pencil, Check, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
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

export function HistoryDialog({ 
  isOpen, 
  onClose, 
  items, 
  triggerRef,
  onSelect,
  onDelete,
  onRename
}: HistoryDialogProps) {
  // 简化状态管理：使用对象存储展开状态，键为日期字符串，值为布尔值
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
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

    // 检查点击是否发生在 DropdownMenu Portal 中 (Radix UI)
    // 防止点击菜单项时触发外部点击导致列表关闭
    const target = e.target as Element;
    if (target.closest('[data-radix-popper-content-wrapper]') || target.closest('[role="menu"]')) {
      return;
    }

    onClose();
  }, isOpen);

  // 当关闭对话框时，重置编辑状态
  useEffect(() => {
    if (!isOpen) {
      setEditingId(null);
      setEditName('');
    }
  }, [isOpen]);
  
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

  const handleStartRename = (item: HistoryItem) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const handleConfirmRename = (id: string) => {
    if (editName.trim()) {
      onRename(id, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      ref={dialogRef}
      className="absolute top-full right-0 mt-1 w-[320px] rounded-xl bg-background border border-border shadow-lg z-50 max-h-[500px] overflow-y-auto animate-in slide-in-from-top-2 duration-200"
    >
      <div className="p-2">
        {groupedHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            暂无历史记录
          </div>
        ) : groupedHistory.map(([dateStr, items]) => {
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
                    <div
                      key={item.id}
                      className="group flex items-center gap-2 w-full py-1 pl-2 rounded-lg hover:bg-accent relative"
                    >
                      {editingId === item.id ? (
                        <div className="flex items-center gap-1 w-full pr-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-7 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleConfirmRename(item.id);
                              if (e.key === 'Escape') handleCancelRename();
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfirmRename(item.id);
                            }}
                          >
                            <Check className="w-4 h-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelRename();
                            }}
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            className="flex-1 flex items-start gap-2 h-auto py-2 px-2 justify-start hover:bg-transparent"
                            onClick={() => onSelect(item.id)}
                          >
                            <div className="flex-1 text-left overflow-hidden">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium text-foreground truncate max-w-[160px]" title={item.name}>
                                  {item.name}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(item.timestamp).toLocaleTimeString('zh-CN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity absolute right-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStartRename(item)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                重命名
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => handleDelete(e, item.id)}
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                    </div>
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
