'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Hd, Ratio, Clock7, Proportions, ImageUpscale } from 'lucide-react';

interface NodeInteractionDialogProps {
  isVisible: boolean;
  position: { x: number; y: number };
  nodeType: 'text' | 'image' | 'video';
  onClose: () => void;
  onSend: (content: string, model: string, config?: Record<string, any>) => void;
  // 首帧和尾帧图片URL，用于视频节点
  firstFrameUrl?: string;
  lastFrameUrl?: string;
}

const NodeInteractionDialog: React.FC<NodeInteractionDialogProps> = ({
  isVisible,
  position,
  nodeType,
  onClose,
  onSend,
  firstFrameUrl,
  lastFrameUrl
}) => {
  // 使用本地状态管理缩略图URL，支持删除功能
  const [localFirstFrameUrl, setLocalFirstFrameUrl] = useState(firstFrameUrl);
  const [localLastFrameUrl, setLocalLastFrameUrl] = useState(lastFrameUrl);
  
  // 当props变化时更新本地状态
  useEffect(() => {
    setLocalFirstFrameUrl(firstFrameUrl);
    setLocalLastFrameUrl(lastFrameUrl);
  }, [firstFrameUrl, lastFrameUrl]);
  
  const [content, setContent] = useState('');
  const [selectedModel, setSelectedModel] = useState('Default Model');
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [inputHeight, setInputHeight] = useState(100);
  
  // 处理首帧删除
  const handleDeleteFirstFrame = useCallback(() => {
    setLocalFirstFrameUrl(undefined);
  }, []);
  
  // 处理尾帧删除
  const handleDeleteLastFrame = useCallback(() => {
    setLocalLastFrameUrl(undefined);
  }, []);
  
  // 图片节点配置
  const [selectedResolution, setSelectedResolution] = useState('1K');
  const [isResolutionMenuOpen, setIsResolutionMenuOpen] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('Auto');
  const [isAspectRatioMenuOpen, setIsAspectRatioMenuOpen] = useState(false);
  
  // 视频节点配置
  const [selectedVideoQuality, setSelectedVideoQuality] = useState('480p');
  const [isVideoQualityMenuOpen, setIsVideoQualityMenuOpen] = useState(false);
  const [selectedVideoDuration, setSelectedVideoDuration] = useState('5s');
  const [isVideoDurationMenuOpen, setIsVideoDurationMenuOpen] = useState(false);
  const [selectedVideoAspectRatio, setSelectedVideoAspectRatio] = useState('16:9');
  const [isVideoAspectRatioMenuOpen, setIsVideoAspectRatioMenuOpen] = useState(false);
  
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const resolutionMenuRef = useRef<HTMLDivElement>(null);
  const aspectRatioMenuRef = useRef<HTMLDivElement>(null);
  const videoQualityMenuRef = useRef<HTMLDivElement>(null);
  const videoDurationMenuRef = useRef<HTMLDivElement>(null);
  const videoAspectRatioMenuRef = useRef<HTMLDivElement>(null);
  
  // 根据节点类型显示不同的模型选项
  const getModelsForNodeType = (type: 'text' | 'image' | 'video') => {
    switch (type) {
      case 'text':
        return ['Text Model 1', 'Text Model 2', 'Text Model 3'];
      case 'image':
        return ['Image Model 1', 'Image Model 2', 'Image Model 3'];
      case 'video':
        return ['Video Model 1', 'Video Model 2', 'Video Model 3'];
      default:
        return ['Default Model'];
    }
  };
  
  const resolutions = [
    '1K',
    '2K',
    '4K'
  ];
  
  const aspectRatios = [
    'Auto',
    '1:1',
    '3:4',
    '4:3',
    '9:16',
    '16:9'
  ];
  
  // 视频节点配置选项
  const videoQualities = [
    '480p',
    '720p',
    '1080p'
  ];
  
  const videoDurations = [
    '5s',
    '10s',
    '15s'
  ];
  
  const videoAspectRatios = [
    '4:3',
    '3:4',
    '9:16',
    '16:9',
    '21:9'
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
      let config = {};
      if (nodeType === 'image') {
        config = {
          resolution: selectedResolution,
          aspectRatio: selectedAspectRatio
        };
      } else if (nodeType === 'video') {
        config = {
          quality: selectedVideoQuality,
          duration: selectedVideoDuration,
          aspectRatio: selectedVideoAspectRatio,
          // 使用本地状态的首帧和尾帧图片URL，支持删除功能
          firstFrameUrl: localFirstFrameUrl,
          lastFrameUrl: localLastFrameUrl
        };
      }
      onSend(content, selectedModel, config);
      setContent('');
      // 重置输入区域高度
      setInputHeight(100);
    }
  }, [content, selectedModel, onSend, nodeType, selectedResolution, selectedAspectRatio, selectedVideoQuality, selectedVideoDuration, selectedVideoAspectRatio, localFirstFrameUrl, localLastFrameUrl]);
  
  // 关闭所有下拉菜单
  const closeAllMenus = useCallback(() => {
    setIsModelMenuOpen(false);
    setIsResolutionMenuOpen(false);
    setIsAspectRatioMenuOpen(false);
    setIsVideoQualityMenuOpen(false);
    setIsVideoDurationMenuOpen(false);
    setIsVideoAspectRatioMenuOpen(false);
  }, []);
  
  // 处理模型菜单点击
  const handleModelMenuClick = useCallback(() => {
    setIsModelMenuOpen(prev => !prev);
    // 关闭其他菜单
    setIsResolutionMenuOpen(false);
    setIsAspectRatioMenuOpen(false);
    setIsVideoQualityMenuOpen(false);
    setIsVideoDurationMenuOpen(false);
    setIsVideoAspectRatioMenuOpen(false);
  }, []);
  
  // 处理图片分辨率菜单点击
  const handleResolutionMenuClick = useCallback(() => {
    setIsResolutionMenuOpen(prev => !prev);
    // 关闭其他菜单
    setIsModelMenuOpen(false);
    setIsAspectRatioMenuOpen(false);
    setIsVideoQualityMenuOpen(false);
    setIsVideoDurationMenuOpen(false);
    setIsVideoAspectRatioMenuOpen(false);
  }, []);
  
  // 处理图片宽高比菜单点击
  const handleAspectRatioMenuClick = useCallback(() => {
    setIsAspectRatioMenuOpen(prev => !prev);
    // 关闭其他菜单
    setIsModelMenuOpen(false);
    setIsResolutionMenuOpen(false);
    setIsVideoQualityMenuOpen(false);
    setIsVideoDurationMenuOpen(false);
    setIsVideoAspectRatioMenuOpen(false);
  }, []);
  
  // 处理视频清晰度菜单点击
  const handleVideoQualityMenuClick = useCallback(() => {
    setIsVideoQualityMenuOpen(prev => !prev);
    // 关闭其他菜单
    setIsModelMenuOpen(false);
    setIsResolutionMenuOpen(false);
    setIsAspectRatioMenuOpen(false);
    setIsVideoDurationMenuOpen(false);
    setIsVideoAspectRatioMenuOpen(false);
  }, []);
  
  // 处理视频时长菜单点击
  const handleVideoDurationMenuClick = useCallback(() => {
    setIsVideoDurationMenuOpen(prev => !prev);
    // 关闭其他菜单
    setIsModelMenuOpen(false);
    setIsResolutionMenuOpen(false);
    setIsAspectRatioMenuOpen(false);
    setIsVideoQualityMenuOpen(false);
    setIsVideoAspectRatioMenuOpen(false);
  }, []);
  
  // 处理视频宽高比菜单点击
  const handleVideoAspectRatioMenuClick = useCallback(() => {
    setIsVideoAspectRatioMenuOpen(prev => !prev);
    // 关闭其他菜单
    setIsModelMenuOpen(false);
    setIsResolutionMenuOpen(false);
    setIsAspectRatioMenuOpen(false);
    setIsVideoQualityMenuOpen(false);
    setIsVideoDurationMenuOpen(false);
  }, []);
  
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
      // 如果点击的不是任何菜单内容，也不是按钮本身，就关闭所有菜单
      const dialogButtons = dialogRef.current?.querySelectorAll('button') || [];
      const isClickOnButton = Array.from(dialogButtons).some(button => 
        button.contains(event.target as Node)
      );
      
      // 检查是否点击在任何菜单内部
      const menus = [modelMenuRef, resolutionMenuRef, aspectRatioMenuRef, videoQualityMenuRef, videoDurationMenuRef, videoAspectRatioMenuRef];
      const isClickOnMenu = menus.some(menuRef => 
        menuRef.current?.contains(event.target as Node)
      );
      
      // 如果点击的不是按钮也不是菜单内部，就关闭所有菜单
      if (!isClickOnButton && !isClickOnMenu) {
        closeAllMenus();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeAllMenus]);
  
  // 当节点类型变化或对话框重新打开时，重置输入内容和模型菜单状态
  useEffect(() => {
    if (isVisible) {
      // 重置输入内容
      setContent('');
      setInputHeight(100);
      
      // 关闭所有菜单
      closeAllMenus();
      
      // 根据节点类型重置默认模型
      let defaultModel = 'Default Model';
      if (nodeType === 'image') {
        defaultModel = 'Image Model 1';
      } else if (nodeType === 'video') {
        defaultModel = 'Video Model 1';
      } else if (nodeType === 'text') {
        defaultModel = 'Text Model 1';
      }
      setSelectedModel(defaultModel);
    }
  }, [isVisible, nodeType, closeAllMenus]);
  
  // 计算对话框的最终位置
  const calculateDialogPosition = useCallback(() => {
    const dialogWidth = 650;
    const padding = 20;
    
    // 始终将对话框定位在节点底部，不进行视口边界检测
    const x = position.x - dialogWidth / 2;
    const y = position.y + padding;
    
    return { x, y };
  }, [position]);
  
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
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--color-neutral-200)'
      }}
    >
      {/* 首帧和尾帧图片缩略图 - 仅视频节点显示 */}
      {nodeType === 'video' && (localFirstFrameUrl || localLastFrameUrl) && (
        <div className="p-4 pb-0">
          <div className="flex items-center gap-2">
            {/* 首帧图片 */}
            {localFirstFrameUrl && (
              <div className="flex flex-col items-center relative">
                <div className="w-[60px] h-[60px] rounded-lg overflow-hidden border border-gray-200 relative group">
                  <img 
                    src={localFirstFrameUrl} 
                    alt="首帧" 
                    className="w-full h-full object-cover transition-all duration-200 group-hover:brightness-90"
                  />
                  {/* 半透明模糊遮罩 */}
                  <div className="absolute inset-0 bg-gray-500 bg-opacity-20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  {/* 删除按钮 */}
                  <button
                    onClick={handleDeleteFirstFrame}
                    className="absolute top-0 right-0 w-6 h-6 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-125"
                    aria-label="删除首帧"
                    style={{ fontSize: '20px' }}
                  >
                    ×
                  </button>
                </div>
                <span className="text-xs text-gray-500 mt-1">首帧</span>
              </div>
            )}
            {/* 尾帧图片 */}
            {localLastFrameUrl && (
              <div className="flex flex-col items-center relative">
                <div className="w-[60px] h-[60px] rounded-lg overflow-hidden border border-gray-200 relative group">
                  <img 
                    src={localLastFrameUrl} 
                    alt="尾帧" 
                    className="w-full h-full object-cover transition-all duration-200 group-hover:brightness-90"
                  />
                  {/* 半透明模糊遮罩 */}
                  <div className="absolute inset-0 bg-gray-500 bg-opacity-20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  {/* 删除按钮 */}
                  <button
                    onClick={handleDeleteLastFrame}
                    className="absolute top-0 right-0 w-6 h-6 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-125"
                    aria-label="删除尾帧"
                    style={{ fontSize: '20px'}}
                  >
                    ×
                  </button>
                </div>
                <span className="text-xs text-gray-500 mt-1">尾帧</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 富文本输入区域 */}
      <div
        ref={inputRef}
        className="w-full p-4  focus:outline-none"
        style={{
          minHeight: '100px',
          maxHeight: '300px',
          height: `${inputHeight}px`,
          overflowY: 'auto',
          borderRadius: nodeType === 'video' && (firstFrameUrl || lastFrameUrl) ? '0' : '8px 8px 0 0',
      
        }}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInputChange}
        onKeyDown={handleKeyDown}
        data-placeholder="描述你想要生成的内容，并在下方调整生成参数（Enter生成，Shift+Enter换行）"
      />
      
      {/* 按钮区域 */}
      <div className="p-4 bg-white" style={{ borderRadius: '0 0 8px 8px' }}>
        <div className="flex items-center justify-between p-2 bg-[var(--color-neutral-100)] rounded-full">
          {/* 左侧按钮组 */}
          <div className="flex items-center">
            {/* 模型选择按钮 */}
            <div className="relative" ref={modelMenuRef}>
              <button
                onClick={handleModelMenuClick}
                className={`flex items-center gap-1 px-4 py-2 rounded-full transition-colors focus:outline-none focus:ring-0 ${isModelMenuOpen ? 'bg-white' : ''} hover:bg-white`}
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
                  {getModelsForNodeType(nodeType).map((model) => (
                      <button
                        key={model}
                        onClick={() => handleModelSelect(model)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedModel === model ? 'bg-white text-blue-600' : 'text-gray-700'}`}
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
                    onClick={handleResolutionMenuClick}
                    className={`flex items-center gap-1 px-4 py-2 rounded-full transition-colors focus:outline-none focus:ring-0 ${isResolutionMenuOpen ? 'bg-white' : ''} hover:bg-white`}
                  >
                    <Proportions size={16} className="text-gray-600" />                    <span className="text-sm font-medium text-gray-700">{selectedResolution}</span>
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
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedResolution === resolution ? 'bg-white text-blue-600' : 'text-gray-700'}`}
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
                    onClick={handleAspectRatioMenuClick}
                    className={`flex items-center gap-1 px-4 py-2 rounded-full transition-colors focus:outline-none focus:ring-0 ${isAspectRatioMenuOpen ? 'bg-white' : ''} hover:bg-white`}
                  >
                    <ImageUpscale size={16} className="text-gray-600" />                    <span className="text-sm font-medium text-gray-700 ">{selectedAspectRatio}</span>
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
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedAspectRatio === ratio ? 'bg-white text-blue-600' : 'text-gray-700'}`}
                      >
                        {ratio}
                      </button>
                    ))}
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* 视频节点专属配置按钮 */}
            {nodeType === 'video' && (
              <>
                {/* 清晰度按钮 */}
                <div className="relative" ref={videoQualityMenuRef}>
                  <button
                    onClick={handleVideoQualityMenuClick}
                    className={`flex items-center gap-1 px-4 py-2 rounded-full transition-colors focus:outline-none focus:ring-0 ${isVideoQualityMenuOpen ? 'bg-white' : ''} hover:bg-white`}
                  >
                    <Hd size={16} className="text-gray-600" />                    <span className="text-sm font-medium text-gray-700 ">{selectedVideoQuality}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-4 h-4 text-gray-500 transition-transform ${isVideoQualityMenuOpen ? 'transform rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* 清晰度下拉菜单 */}
                  {isVideoQualityMenuOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-1001">
                      {videoQualities.map((quality) => (
                      <button
                        key={quality}
                        onClick={() => {
                          setSelectedVideoQuality(quality);
                          setIsVideoQualityMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedVideoQuality === quality ? 'bg-white text-blue-600' : 'text-gray-700'}`}
                      >
                        {quality}
                      </button>
                    ))}
                    </div>
                  )}
                </div>
                
                {/* 时长按钮 */}
                <div className="relative" ref={videoDurationMenuRef}>
                  <button
                    onClick={handleVideoDurationMenuClick}
                    className={`flex items-center gap-1 px-4 py-2 rounded-full transition-colors focus:outline-none focus:ring-0 ${isVideoDurationMenuOpen ? 'bg-white' : ''} hover:bg-white`}
                  >
                    <Clock7 size={16} className="text-gray-600" />                    <span className="text-sm font-medium text-gray-700 ">{selectedVideoDuration}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-4 h-4 text-gray-500 transition-transform ${isVideoDurationMenuOpen ? 'transform rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* 时长下拉菜单 */}
                  {isVideoDurationMenuOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-1001">
                      {videoDurations.map((duration) => (
                      <button
                        key={duration}
                        onClick={() => {
                          setSelectedVideoDuration(duration);
                          setIsVideoDurationMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedVideoDuration === duration ? 'bg-white text-blue-600' : 'text-gray-700'}`}
                      >
                        {duration}
                      </button>
                    ))}
                    </div>
                  )}
                </div>
                
                {/* 宽高比按钮 */}
                <div className="relative" ref={videoAspectRatioMenuRef}>
                  <button
                    onClick={handleVideoAspectRatioMenuClick}
                    className={`flex items-center gap-1 px-4 py-2 rounded-full transition-colors focus:outline-none focus:ring-0 ${isVideoAspectRatioMenuOpen ? 'bg-white' : ''} hover:bg-white`}
                  >
                    <Ratio size={16} className="text-gray-600" />                    <span className="text-sm font-medium text-gray-700 ">{selectedVideoAspectRatio}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-4 h-4 text-gray-500 transition-transform ${isVideoAspectRatioMenuOpen ? 'transform rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* 宽高比下拉菜单 */}
                  {isVideoAspectRatioMenuOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-1001">
                      {videoAspectRatios.map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => {
                          setSelectedVideoAspectRatio(ratio);
                          setIsVideoAspectRatioMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedVideoAspectRatio === ratio ? 'bg-white text-blue-600' : 'text-gray-700'}`}
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
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 focus:outline-none focus:ring-0 ${content.trim() ? 'bg-blue-500 hover:bg-blue-600 hover:scale-105' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            <Send size={20} className={`${content.trim() ? 'text-white' : 'text-gray-500'}`} />
          </button>
        </div>
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