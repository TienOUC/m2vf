'use client'

import { useState, useRef } from 'react';
import type { AIModel } from '@/lib/types/studio';
import { AssetSelectMenu } from './AssetSelectMenu';
import { useFileUpload } from '@/hooks/useFileUpload';
import { ChatFilePreview } from './ChatFilePreview';
import { ChatInputToolbar } from './ChatInputToolbar';

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
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  // 添加搜索和思考按钮的选中状态
  const [isSearchSelected, setIsSearchSelected] = useState(false);
  const [isThinkSelected, setIsThinkSelected] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 使用自定义 Hook 处理文件上传
  const { 
    uploadedFiles, 
    isUploading, 
    uploadError, 
    handleFileChange, 
    handleAssetSelect, 
    handleFileDelete 
  } = useFileUpload();
  
  // 切换搜索按钮选中状态
  const handleToggleSearch = () => {
    setIsSearchSelected(prev => !prev);
  };
  
  // 切换思考按钮选中状态
  const handleToggleThink = () => {
    setIsThinkSelected(prev => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleLocalUpload = () => {
    fileInputRef.current?.click();
  };

  const handleAssetSelectClick = () => {
    setShowAssetMenu(true);
  };

  const handleAssetMenuClose = () => {
    setShowAssetMenu(false);
  };

  const handleToggleMode = () => {
    const newMode = !isAgentMode;
    setIsAgentMode(newMode);
    onToggleMode?.(newMode);
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
            onSelect={(asset) => {
              handleAssetSelect(asset);
              handleAssetMenuClose();
            }}
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
        <ChatFilePreview 
          files={uploadedFiles} 
          onDelete={handleFileDelete} 
        />
        
        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='描述您想要的内容...'
          className="w-full bg-transparent px-4 py-3 text-sm resize-none focus:outline-none min-h-[52px] max-h-[100px] text-foreground placeholder:text-muted-foreground"
          rows={2}
        />

        {/* Toolbar */}
        <ChatInputToolbar
          isUploading={isUploading}
          isGenerating={isGenerating}
          input={input}
          showModelSelector={showModelSelector}
          isAgentMode={isAgentMode}
          selectedModel={selectedModel}
          onToggleModelSelector={() => setShowModelSelector(!showModelSelector)}
          onSelectModel={(model) => {
            onSelectModel(model);
            // 移除 setShowModelSelector(false)，保持菜单打开
          }}
          onLocalUpload={handleLocalUpload}
          onAssetSelectClick={handleAssetSelectClick}
          onToggleMode={handleToggleMode}
          onSend={onSend}
          onCancel={onCancel}
          // 搜索和思考按钮相关属性
          isSearchSelected={isSearchSelected}
          isThinkSelected={isThinkSelected}
          onToggleSearch={handleToggleSearch}
          onToggleThink={handleToggleThink}
        />
      </div>
    </div>
  );
}
