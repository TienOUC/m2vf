'use client'

import { Boxes } from 'lucide-react';
import type { ChatMessage } from '@/lib/types/studio';

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="rounded-xl rounded-tr-sm px-4 py-2.5 max-w-[85%] bg-accent text-accent-foreground">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">
        {new Date(message.timestamp).toLocaleDateString('zh-CN', { 
          month: 'short', 
          day: 'numeric'
        })}
      </div>
      <p className="text-sm leading-relaxed text-foreground">{message.content}</p>
      
      {message.modelUsed && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Boxes className="w-3 h-3" />
          <span>{message.modelUsed}</span>
        </div>
      )}

      {message.status === 'complete' && message.imageUrl && (
        <div className="space-y-2 pt-1">
          <div className="relative w-[180px] aspect-square rounded-xl overflow-hidden bg-muted">
            <img 
              src={message.imageUrl} 
              alt="生成的图像" 
              className="w-full h-full object-cover cursor-grab active:cursor-grabbing"
              loading="lazy"
              draggable="true"
              onDragStart={(e) => {
                e.dataTransfer.setData('application/relay-media', JSON.stringify({
                  type: 'image',
                  url: message.imageUrl
                }));
                // 设置拖拽效果
                e.dataTransfer.effectAllowed = 'copy';
              }}
            />
          </div>
        </div>
      )}
      
      {message.status === 'complete' && message.videoUrl && (
        <div className="space-y-2 pt-1">
          <div className="relative w-[180px] aspect-video rounded-xl overflow-hidden bg-muted">
            <video 
              src={message.videoUrl} 
              className="w-full h-full object-cover cursor-grab active:cursor-grabbing"
              controls
              draggable="true"
              onDragStart={(e) => {
                e.dataTransfer.setData('application/relay-media', JSON.stringify({
                  type: 'video',
                  url: message.videoUrl
                }));
                // 设置拖拽效果
                e.dataTransfer.effectAllowed = 'copy';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
