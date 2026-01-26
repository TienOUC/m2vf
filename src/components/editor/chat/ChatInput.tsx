'use client'

import { useState, useRef, useEffect } from 'react';
import { 
  Paperclip, 
  Box, Send, Sparkles as SparklesIcon,
  Upload, FolderOpen
} from 'lucide-react';
import type { AIModel } from '@/lib/types/studio';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { AssetSelectMenu } from './AssetSelectMenu';
import { ModelSelector } from '../ModelSelector';
import { useChatFilesStore, ChatFile } from '@/lib/stores/chatFilesStore';
import { generateId } from '@/lib/utils/id';

interface ChatInputProps {
  input: string;
  selectedModel: AIModel;
  isGenerating: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onSelectModel: (model: AIModel) => void;
  isAgentMode?: boolean;
  onToggleMode?: (isAgentMode: boolean) => void;
  onCancel?: () => void;
}

export function ChatInput({ 
  input, 
  selectedModel, 
  isGenerating, 
  onInputChange, 
  onSend, 
  onSelectModel,
  isAgentMode: externalIsAgentMode,
  onToggleMode,
  onCancel
}: ChatInputProps) {
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [isAgentMode, setIsAgentMode] = useState(externalIsAgentMode || false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // 附件上传相关状态
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<ChatFile>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 从全局状态获取聊天文件
  const { chatFiles, clearChatFiles } = useChatFilesStore();
  
  // 监听全局聊天文件变化，将新文件添加到本地状态
  useEffect(() => {
    if (chatFiles.length > 0) {
      const newFiles = chatFiles.map(file => ({
        id: file.id,
        file: file.file,
        thumbnailUrl: file.thumbnailUrl,
        type: file.type,
        url: file.url
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      // 清空全局状态，避免重复添加
      clearChatFiles();
    }
  }, [chatFiles, clearChatFiles]);

  // 处理本地文件上传
  const handleLocalUpload = () => {
    fileInputRef.current?.click();
  };

  // 提取视频第一帧作为缩略图
  const extractVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        video.currentTime = 0;
      };
      
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailUrl = canvas.toDataURL('image/jpeg');
        URL.revokeObjectURL(video.src);
        resolve(thumbnailUrl);
      };
    });
  };

  // 处理文件选择
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      setUploadError(null);
      
      try {
        const newFiles: Array<ChatFile> = [];
        
        // 处理每个文件
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const id = generateId();
          const isImage = file.type.startsWith('image/');
          const isVideo = file.type.startsWith('video/');
          
          if (isImage || isVideo) {
            let thumbnailUrl: string;
            let url: string;
            
            if (isImage) {
              // 图片文件直接生成缩略图URL和临时URL
              thumbnailUrl = URL.createObjectURL(file);
              url = thumbnailUrl; // 本地文件临时使用object URL作为url
            } else {
              // 视频文件提取第一帧
              thumbnailUrl = await extractVideoThumbnail(file);
              url = URL.createObjectURL(file); // 本地视频临时使用object URL作为url
            }
            
            newFiles.push({
              id,
              file,
              thumbnailUrl,
              type: isImage ? 'image' : 'video',
              url
            });
          }
        }
        
        // 更新上传队列
        setUploadedFiles(prev => [...prev, ...newFiles]);
      } catch (error) {
        setUploadError('文件处理失败，请重试');
        console.error('File processing error:', error);
      } finally {
        setIsUploading(false);
        // 清空文件输入
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  // 处理资产选取菜单显示
  const handleAssetSelectClick = () => {
    setShowAssetMenu(true);
  };

  // 处理资产选取菜单关闭
  const handleAssetMenuClose = () => {
    setShowAssetMenu(false);
  };

  // 处理资产选择
  const handleAssetSelect = (asset: { id: number; type: 'image' | 'video'; name: string; url: string }) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      // 模拟资产上传或处理
      console.log('Selected asset:', asset);
      
      // 创建模拟文件对象并添加到上传队列
      const mockFile = new File([], asset.name, { type: asset.type === 'image' ? 'image/jpeg' : 'video/mp4' });
      const newFile = {
        id: generateId(),
        file: mockFile,
        thumbnailUrl: asset.url,
        type: asset.type,
        url: asset.url
      };
      
      setUploadedFiles(prev => [...prev, newFile]);
      
      setTimeout(() => {
        setIsUploading(false);
      }, 1000);
    } catch (err) {
      setUploadError('资产上传失败，请重试');
      console.error('Asset upload error:', err);
    }
  };

  // 处理文件删除
  const handleFileDelete = (id: string) => {
    setUploadedFiles(prev => {
      const fileToDelete = prev.find(file => file.id === id);
      if (fileToDelete) {
        // 释放URL对象 - 只释放本地创建的对象URL，不释放远程URL
        if (fileToDelete.file) {
          // 释放缩略图URL
          URL.revokeObjectURL(fileToDelete.thumbnailUrl);
          // 释放视频文件的URL（如果是视频且URL是object URL）
          if (fileToDelete.type === 'video') {
            try {
              URL.revokeObjectURL(fileToDelete.url);
            } catch (e) {
              // 忽略无效URL的错误
            }
          }
        }
      }
      return prev.filter(file => file.id !== id);
    });
  };

  return (
    <div className="p-3 bg-background relative">
      {/* 隐藏的文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*"
        className="hidden"
        multiple
      />
      
      {/* 资产选择菜单 */}
      {showAssetMenu && (
        <div className="absolute bottom-full left-0 mb-2">
          <AssetSelectMenu 
            onSelect={handleAssetSelect}
            onClose={handleAssetMenuClose}
          />
        </div>
      )}
      
      {/* 上传状态和错误提示 */}
      {isUploading && (
        <div className="mb-2 px-4 py-2 text-xs text-muted-foreground bg-muted rounded-md flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>文件上传中...</span>
        </div>
      )}
      
      {uploadError && (
        <div className="mb-2 px-4 py-2 text-xs text-red-500 bg-red-50/10 border border-red-500/20 rounded-md">
          {uploadError}
        </div>
      )}
      
      <div className="rounded-xl bg-muted border border-border">
        {/* 缩略图预览区域 */}
        {uploadedFiles.length > 0 && (
          <div className="px-4 pt-3 pb-2 flex flex-wrap gap-2">
            {uploadedFiles.map((file) => (
              <div 
                key={file.id} 
                className="relative group flex-shrink-0"
              >
                {/* 缩略图容器 */}
                <div className="w-[60px] h-[60px] rounded-md overflow-hidden border border-border bg-background flex items-center justify-center">
                  {file.type === 'image' ? (
                    <img
                      src={file.thumbnailUrl}
                      alt={file.file ? file.file.name : `file-${file.id}`}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={file.thumbnailUrl}
                        alt={file.file ? file.file.name : `file-${file.id}`}
                        className="w-full h-full object-cover"
                        loading="eager"
                      />
                      {/* 视频标识 */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-black"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 文件名显示 */}
                <div className="mt-1 text-xs text-muted-foreground truncate w-[60px] text-center">
                  {file.file ? file.file.name : file.url ? file.url.split('/').pop() || `file-${file.id}` : `file-${file.id}`}
                </div>
                
                {/* 删除按钮 */}
                <button
                  onClick={() => handleFileDelete(file.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm hover:bg-red-600"
                  aria-label="删除文件"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        
        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='描述您想要的内容...'
          className="w-full bg-transparent px-4 py-3 text-sm resize-none focus:outline-none min-h-[52px] max-h-[100px] text-foreground placeholder:text-muted-foreground"
          rows={2}
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="p-2 rounded-lg bg-background/80 border border-border hover:bg-accent hover:text-accent-foreground"
                  aria-label="添加附件"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Paperclip className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem onClick={handleLocalUpload} className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  <span>本地上传</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAssetSelectClick} className="cursor-pointer">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  <span>选择资产</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="ghost"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background/80 hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                const newMode = !isAgentMode;
                setIsAgentMode(newMode);
                onToggleMode?.(newMode);
              }}
            >
              <SparklesIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">{isAgentMode ? 'Agent' : '对话'}</span>
            </Button>
          </div>

          <div className="flex items-center gap-1">
            {/* <Button 
              variant="ghost"
              size="icon"
              className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground"
              aria-label="快捷操作"
            >
              <Zap className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button 
              variant="ghost"
              size="icon"
              className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground"
              aria-label="语言设置"
            >
              <Globe className="w-4 h-4 text-muted-foreground" />
            </Button> */}
            <div className="relative">
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => setShowModelSelector(!showModelSelector)}
                className={`p-2 rounded-lg bg-background/80 border border-border hover:bg-accent hover:text-accent-foreground ${showModelSelector ? 'bg-accent' : ''}`}
                aria-label="选择模型"
              >
                <Box className="w-4 h-4 text-muted-foreground" />
              </Button>
              <ModelSelector
                isOpen={showModelSelector}
                onClose={() => setShowModelSelector(false)}
                onSelectModel={(model) => {
                  onSelectModel(model);
                  setShowModelSelector(false);
                }}
                selectedModel={selectedModel}
                theme="light"
              />
            </div>
            {isGenerating ? (
              <Button 
                variant="secondary"
                size="icon"
                onClick={onCancel}
                className={`w-8 h-8 ml-1 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90`}
                aria-label="取消生成"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            ) : (
              <Button 
                variant={input.trim() ? "default" : "secondary"}
                size="icon"
                onClick={onSend}
                disabled={!input.trim()}
                className={`w-8 h-8 ml-1 rounded-lg ${input.trim()
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                aria-label="发送消息"
              >
                <Send className="w-3 h-3" fill="currentColor" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
