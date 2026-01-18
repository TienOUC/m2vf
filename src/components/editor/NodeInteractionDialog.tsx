'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from '@mui/icons-material';

interface NodeInteractionDialogProps {
  isVisible: boolean;
  position: { x: number; y: number };
  nodeType: 'text' | 'image' | 'video';
  onClose: () => void;
  onSend: (content: string, model: string, config?: Record<string, any>) => void;
}

const NodeInteractionDialog: React.FC<NodeInteractionDialogProps> = ({
  isVisible,
  position,
  nodeType,
  onClose,
  onSend
}) => {
  const [content, setContent] = useState('');
  const [selectedModel, setSelectedModel] = useState('Default Model');
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [inputHeight, setInputHeight] = useState(100);
  
  // 图片节点配置
  const [selectedResolution, setSelectedResolution] = useState('1K');
  const [isResolutionMenuOpen, setIsResolutionMenuOpen] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('Auto');
  const [isAspectRatioMenuOpen, setIsAspectRatioMenuOpen] = useState(false);
  
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const resolutionMenuRef = useRef<HTMLDivElement>(null);
  const aspectRatioMenuRef = useRef<HTMLDivElement>(null);
  
  const models = [
    'Doubao',
    'Qwen',
    'Gemini'
  ];
  
  const resolutions = [
    '1K',
    '2K',
    '3K'
  ];
  
  const aspectRatios = [
    'Auto',
    '1:1',
    '3:4',
    '4:3',
    '9:16',
    '16:9'
  ];
  
  // 处理输入区域的内容变化
  const handleInputChange = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const newContent = target.innerText || '';
    setContent(newContent);
    
    // 调整输入区域高度
    if (inputRef.current) {
      const newHeight = Math.max(100, Math.min(300, inputRef.current.scrollHeight));
      setInputHeight(newHeight);
    }
  }, []);
  
  // 处理模型选择
  const handleModelSelect = useCallback((model: string) => {
    setSelectedModel(model);
    setIsModelMenuOpen(false);
  }, []);
  
  // 处理发送按钮点击
  const handleSend = useCallback(() => {
    if (content.trim()) {
      const config = nodeType === 'image' ? {
        resolution: selectedResolution,
        aspectRatio: selectedAspectRatio
      } : {};
      onSend(content, selectedModel, config);
      setContent('');
      // 重置输入区域高度
      setInputHeight(100);
    }
  }, [content, selectedModel, onSend, nodeType, selectedResolution, selectedAspectRatio]);
  
  // 处理键盘快捷键
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter 换行 - 允许默认行为
        return;
      } else {
        // 单独 Enter 发送
        e.preventDefault();
        handleSend();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [handleSend, onClose]);
  
  // 点击外部关闭所有菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dialogButtons = dialogRef.current?.querySelectorAll('button') || [];
      const isClickOnButton = Array.from(dialogButtons).some(button => 
        button.contains(event.target as Node)
      );
      
      // 关闭模型菜单
      if (
        modelMenuRef.current &&
        !modelMenuRef.current.contains(event.target as Node) &&
        !isClickOnButton
      ) {
        setIsModelMenuOpen(false);
      }
      
      // 关闭分辨率菜单
      if (
        resolutionMenuRef.current &&
        !resolutionMenuRef.current.contains(event.target as Node) &&
        !isClickOnButton
      ) {
        setIsResolutionMenuOpen(false);
      }
      
      // 关闭宽高比菜单
      if (
        aspectRatioMenuRef.current &&
        !aspectRatioMenuRef.current.contains(event.target as Node) &&
        !isClickOnButton
      ) {
        setIsAspectRatioMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 计算对话框的最终位置
  const calculateDialogPosition = useCallback(() => {
    const dialogWidth = 650;
    const padding = 10;
    
    let x = position.x - dialogWidth / 2;
    let y = position.y + padding;
    
    // 确保对话框不会超出视口左侧
    x = Math.max(0, x);
    
    // 确保对话框不会超出视口右侧
    const viewportWidth = window.innerWidth;
    if (x + dialogWidth > viewportWidth) {
      x = viewportWidth - dialogWidth;
    }
    
    // 确保对话框不会超出视口底部
    const dialogHeight = 200 + Math.min(300, inputHeight); // 估计值，包含输入区域和按钮
    const viewportHeight = window.innerHeight;
    if (y + dialogHeight > viewportHeight) {
      y = position.y - dialogHeight - padding;
    }
    
    return { x, y };
  }, [position, inputHeight]);
  
  const dialogPosition = calculateDialogPosition();
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div
      ref={dialogRef}
      className="absolute z-1000"
      style={{
        left: `${dialogPosition.x}px`,
        top: `${dialogPosition.y}px`,
        width: '650px',
        opacity: 1,
        transform: 'translateY(0) scale(1)',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',

      }}
    >
      {/* 富文本输入区域 */}
      <div
        ref={inputRef}
        className="w-full p-4  focus:outline-none"
        style={{
          minHeight: '100px',
          maxHeight: '300px',
          height: `${inputHeight}px`,
          overflowY: 'auto',
          backgroundColor: '#fafafa',
          borderRadius: '8px 8px 0 0',
     
        }}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInputChange}
        onKeyDown={handleKeyDown}
        data-placeholder="描述你想要生成的内容，并在下方调整生成参数（Enter生成，Shift+Enter换行）"
      />
      
      {/* 按钮区域 */}
      <div className="flex items-center justify-between p-4 bg-white" style={{ borderRadius: '0 0 8px 8px' }}>
        {/* 左侧按钮组 */}
        <div className="flex items-center gap-2">
          {/* 模型选择按钮 */}
          <div className="relative" ref={modelMenuRef}>
            <button
              onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="text-sm font-medium text-gray-700">{selectedModel}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 text-gray-500 transition-transform ${isModelMenuOpen ? 'transform rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* 模型选择下拉菜单 */}
            {isModelMenuOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-1001">
                {models.map((model) => (
                  <button
                    key={model}
                    onClick={() => handleModelSelect(model)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedModel === model ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                  >
                    {model}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* 图片节点专属配置按钮 */}
          {nodeType === 'image' && (
            <>
              {/* 分辨率按钮 */}
              <div className="relative" ref={resolutionMenuRef}>
                <button
                  onClick={() => setIsResolutionMenuOpen(!isResolutionMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span className="text-sm font-medium text-gray-700">{selectedResolution}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 text-gray-500 transition-transform ${isResolutionMenuOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* 分辨率下拉菜单 */}
                {isResolutionMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-1001">
                    {resolutions.map((resolution) => (
                      <button
                        key={resolution}
                        onClick={() => {
                          setSelectedResolution(resolution);
                          setIsResolutionMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedResolution === resolution ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                      >
                        {resolution}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 宽高比按钮 */}
              <div className="relative" ref={aspectRatioMenuRef}>
                <button
                  onClick={() => setIsAspectRatioMenuOpen(!isAspectRatioMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span className="text-sm font-medium text-gray-700">{selectedAspectRatio}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 text-gray-500 transition-transform ${isAspectRatioMenuOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* 宽高比下拉菜单 */}
                {isAspectRatioMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-1001">
                    {aspectRatios.map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => {
                          setSelectedAspectRatio(ratio);
                          setIsAspectRatioMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedAspectRatio === ratio ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* 发送按钮 */}
        <button
          onClick={handleSend}
          disabled={!content.trim()}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${content.trim() ? 'bg-blue-500 hover:bg-blue-600 hover:scale-105 focus:ring-blue-500' : 'bg-gray-300 cursor-not-allowed focus:ring-gray-300'}`}
        >
          <Send className={`w-5 h-5 ${content.trim() ? 'text-white' : 'text-gray-500'}`} />
        </button>
      </div>
      
      {/* CSS 样式 */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        [contenteditable]:focus {
          outline: none;
          box-shadow: none !important;
        }
        
        /* 平滑滚动 */
        div[style*="overflowY: 'auto'"] {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default NodeInteractionDialog;