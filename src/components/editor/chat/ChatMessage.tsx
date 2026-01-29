'use client'

import { Boxes, Loader2 } from 'lucide-react';
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
      {/* <p className="text-sm leading-relaxed text-foreground">{message.content}</p> */}
      
      {message.modelUsed && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Boxes className="w-3 h-3" />
          <span>{message.modelUsed}</span>
        </div>
      )}

      {/* 状态提示信息 */}
      {message.thought && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>{message.thought}</span>
        </div>
      )}

      {/* Artifacts 渲染 */}
      {message.artifacts && message.artifacts.length > 0 ? (
        message.artifacts.map((artifact) => (
          <div key={artifact.id} className="space-y-2 pt-1">
            {/* 生成中状态 */}
            {(artifact.status === 'pending' || artifact.status === 'processing') && (
              <div className="relative w-[180px] aspect-square rounded-xl overflow-hidden bg-muted flex flex-col items-center justify-center border border-border">
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin mb-2" />
                <span className="text-xs text-muted-foreground">生成中...</span>
              </div>
            )}

            {/* 完成状态 - 图片 */}
            {artifact.status === 'completed' && artifact.type === 'image' && artifact.url && (
              <div className="relative w-[180px] aspect-square rounded-xl overflow-hidden bg-muted">
                <img 
                  src={artifact.url} 
                  alt="生成的图像" 
                  className="w-full h-full object-cover cursor-grab active:cursor-grabbing"
                  loading="lazy"
                  draggable="true"
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/relay-media', JSON.stringify({
                      type: 'image',
                      url: artifact.url
                    }));
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                />
              </div>
            )}

            {/* 完成状态 - 视频 */}
            {artifact.status === 'completed' && artifact.type === 'video' && artifact.url && (
              <div className="relative w-[180px] aspect-video rounded-xl overflow-hidden bg-muted">
                <video 
                  src={artifact.url} 
                  className="w-full h-full object-cover cursor-grab active:cursor-grabbing"
                  controls
                  draggable="true"
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/relay-media', JSON.stringify({
                      type: 'video',
                      url: artifact.url
                    }));
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                />
              </div>
            )}
            
            {/* 失败状态 */}
            {artifact.status === 'failed' && (
              <div className="relative w-[180px] aspect-square rounded-xl overflow-hidden bg-destructive/10 flex flex-col items-center justify-center border border-destructive/20">
                <span className="text-xs text-destructive">生成失败</span>
              </div>
            )}
          </div>
        ))
      ) : (
        /* 兼容旧数据的回退渲染 */
        <>
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
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
