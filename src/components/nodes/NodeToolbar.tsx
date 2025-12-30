import { NodeToolbar as ReactFlowNodeToolbar, Position } from '@xyflow/react';
import { SwapHoriz, Close, TextFields, Image as ImageIcon, VideoFile, Audiotrack, Palette, ContentCopy } from '@mui/icons-material';
import { Tooltip, Popover } from '@mui/material';
import { memo, useState, useRef, useEffect } from 'react';
import { useClickOutside } from '@/hooks';
import { copyToClipboard } from '@/lib/utils';
import FontStyleSelector from './FontStyleSelector';

export interface NodeToolbarProps {
  nodeId: string;
  onTypeChange?: (nodeId: string, newType: 'text' | 'image' | 'video' | 'audio') => void;
  onDelete?: (nodeId: string) => void;
  onReplace?: (nodeId: string) => void;
  onBackgroundColorChange?: (nodeId: string, color: string) => void;
  onFontTypeChange?: (nodeId: string, fontType: 'h1' | 'h2' | 'h3' | 'p') => void;
  backgroundColor?: string;
  selected?: boolean;
  type?: 'text' | 'image' | 'video' | 'audio';
  fontType?: 'h1' | 'h2' | 'h3' | 'p';
  getContent?: (nodeId: string) => string;
}

const NodeToolbar = ({ 
  nodeId, 
  onTypeChange, 
  onDelete, 
  onReplace,
  onBackgroundColorChange,
  onFontTypeChange,
  backgroundColor,
  selected = false, 
  type = 'text',
  fontType,
  getContent
}: NodeToolbarProps) => {
  const colorPickerRef = useRef<HTMLButtonElement>(null);
  const colorPickerPopoverRef = useRef<HTMLDivElement>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  // 点击外部关闭颜色选择器
  useClickOutside([colorPickerRef, colorPickerPopoverRef], () => {
    if (colorPickerOpen) {
      setColorPickerOpen(false);
    }
  });

  const handleTypeChange = (newType: 'text' | 'image' | 'video' | 'audio') => {
    onTypeChange && onTypeChange(nodeId, newType);
  };

  const handleDelete = () => {
    onDelete && onDelete(nodeId);
  };

  const handleReplace = () => {
    onReplace && onReplace(nodeId);
  };

  const handleBackgroundColorChange = (color: string) => {
    onBackgroundColorChange && onBackgroundColorChange(nodeId, color);
    setColorPickerOpen(false);
  };

  const handleFontTypeChange = (fontType: 'h1' | 'h2' | 'h3' | 'p') => {
    onFontTypeChange && onFontTypeChange(nodeId, fontType);
  };

  const [copySuccess, setCopySuccess] = useState(false);
  
  const handleCopyText = async () => {
    if (type === 'text' && getContent) {
      const content = getContent(nodeId);
      const success = await copyToClipboard(content);
      if (success) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // 2秒后重置状态
      } else {
        console.error('复制失败');
      }
    }
  };

  const colorOptions = [
    { value: '#ffffff', label: '白色背景', cssVar: 'var(--node-bg-white)' },
    { value: '#964243', label: '暗红色', cssVar: 'var(--node-bg-color1)' },
    { value: '#834815', label: '咖啡色', cssVar: 'var(--node-bg-color2)' },
    { value: '#8f8030', label: '橄榄色', cssVar: 'var(--node-bg-color3)' },
    { value: '#3d7344', label: '深绿色', cssVar: 'var(--node-bg-color4)' },
    { value: '#337282', label: '青蓝色', cssVar: 'var(--node-bg-color5)' },
    { value: '#2b5284', label: '深蓝色', cssVar: 'var(--node-bg-color6)' },
    { value: '#763886', label: '深紫色', cssVar: 'var(--node-bg-color7)' },
  ];

  // 根据当前节点类型确定可切换的类型
  const getAvailableTypes = () => {
    switch (type) {
      case 'text':
        return [
          { type: 'image' as const, label: '图片', icon: <ImageIcon fontSize="small" /> },
          { type: 'video' as const, label: '视频', icon: <VideoFile fontSize="small" /> },
          { type: 'audio' as const, label: '音频', icon: <Audiotrack fontSize="small" /> },
        ];
      case 'image':
        return [
          { type: 'text' as const, label: '文本', icon: <TextFields fontSize="small" /> },
          { type: 'video' as const, label: '视频', icon: <VideoFile fontSize="small" /> },
          { type: 'audio' as const, label: '音频', icon: <Audiotrack fontSize="small" /> },
        ];
      case 'video':
        return [
          { type: 'text' as const, label: '文本', icon: <TextFields fontSize="small" /> },
          { type: 'image' as const, label: '图片', icon: <ImageIcon fontSize="small" /> },
          { type: 'audio' as const, label: '音频', icon: <Audiotrack fontSize="small" /> },
        ];
      case 'audio':
        return [
          { type: 'text' as const, label: '文本', icon: <TextFields fontSize="small" /> },
          { type: 'image' as const, label: '图片', icon: <ImageIcon fontSize="small" /> },
          { type: 'video' as const, label: '视频', icon: <VideoFile fontSize="small" /> },
        ];
      default:
        return [];
    }
  };

  // 颜色选择器弹窗
  const ColorPickerPopover = () => (
    <div 
      ref={colorPickerPopoverRef}
      className={`absolute top-9 left-0 bg-white rounded-md shadow-lg border border-gray-200 p-2 z-30 w-40 ${colorPickerOpen ? 'block' : 'hidden'}`}
    >
      <div className="grid grid-cols-4 gap-2">
        {colorOptions.map((color, index) => (
          <Tooltip key={index} title={color.label} placement="top">
            <button
              onClick={() => handleBackgroundColorChange(color.value)}
              className="w-8 h-8 rounded-full border border-gray-300 hover:scale-110 transition-transform"
              style={{ backgroundColor: color.cssVar }}
              aria-label={color.label}
            />
          </Tooltip>
        ))}
      </div>
    </div>
  );

  return (
    <ReactFlowNodeToolbar
      nodeId={nodeId}
      position={Position.Top}
      offset={10}
      isVisible={selected}
      className="bg-white shadow-md rounded-md border border-gray-200 p-1 flex items-center gap-1"
    >
      {/* 类型切换按钮 */}
      <div className="relative group">
        <Tooltip title="切换节点类型" placement="top">
          <button
            className="w-8 h-8 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="切换节点类型"
          >
            <SwapHoriz fontSize="small" />
          </button>
        </Tooltip>
            
            
        {/* 类型选择菜单 - 作为下拉菜单实现 */}
        <div className="absolute left-0 top-9 bg-white rounded-md shadow-sm border border-gray-200 py-1 z-20 min-w-[120px] w-32 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
          {getAvailableTypes().map(({ type: newType, label, icon }) => (
            <button
              key={newType}
              onClick={() => handleTypeChange(newType)}
              className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
          
      {/* 更换文件按钮 - 仅对图片、视频和音频节点显示 */}
      {(type === 'image' || type === 'video' || type === 'audio') && (
        <Tooltip title="更换文件" placement="top">
          <button
            onClick={handleReplace}
            className="w-8 h-8 p-1 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
            aria-label="更换文件"
          >
            {type === 'image' ? <ImageIcon fontSize="small" /> : type === 'video' ? <VideoFile fontSize="small" /> : <Audiotrack fontSize="small" />}
          </button>
        </Tooltip>
      )}
          
      {/* 背景色选择按钮 - 仅对文本节点显示 */}
      {type === 'text' && (
        <div className="relative">
          <Tooltip title="设置背景色" placement="top">
            <button
              ref={colorPickerRef}
              onClick={() => setColorPickerOpen(!colorPickerOpen)}
              className="w-8 h-8 p-1 text-gray-500 hover:text-purple-500 hover:bg-purple-50 rounded-md transition-colors"
              aria-label="设置背景色"
            >
              <Palette fontSize="small" />
            </button>
          </Tooltip>
          <ColorPickerPopover />
        </div>
      )}
            
      {/* 字体样式选择按钮 - 仅对文本节点显示 */}
      {type === 'text' && (
        <FontStyleSelector 
          onFontTypeChange={handleFontTypeChange}
          currentFontType={fontType}
        />
      )}
            
      {/* 复制文本内容按钮 - 仅对文本节点显示 */}
      {type === 'text' && (
        <Tooltip title={copySuccess ? "已复制！" : "复制文本内容"} placement="top">
          <button
            onClick={handleCopyText}
            className={`w-8 h-8 p-1 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors ${copySuccess ? 'text-green-500' : ''}`}
            aria-label="复制文本内容"
          >
            <ContentCopy fontSize="small" />
          </button>
        </Tooltip>
      )}
            
      {/* 删除按钮 */}
      <Tooltip title="删除节点" placement="top">
        <button
          onClick={handleDelete}
          className="w-8 h-8 p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
          aria-label="删除节点"
        >
          <Close fontSize="small" />
        </button>
      </Tooltip>
    </ReactFlowNodeToolbar>
  );
};

export default memo(NodeToolbar);