import { NodeToolbar as ReactFlowNodeToolbar, Position } from '@xyflow/react';
import { SwapHoriz, TextFields, Image as ImageIcon, VideoFile, Palette, ContentCopy, FormatBold, FormatItalic, FormatListBulleted, FormatListNumbered, HorizontalRule, Fullscreen, DeleteOutline, Crop, Brush, Download } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { memo, useState, useRef } from 'react';
import { useClickOutside } from '@/hooks';
import { copyToClipboard, copyRichTextToClipboard } from '@/lib/utils';

export interface NodeToolbarProps {
  nodeId: string;
  onTypeChange?: (nodeId: string, newType: 'text' | 'image' | 'video') => void;
  onDelete?: (nodeId: string) => void;
  onReplace?: (nodeId: string) => void;
  onBackgroundColorChange?: (nodeId: string, color: string) => void;
  onFontTypeChange?: (nodeId: string, fontType: 'h1' | 'h2' | 'h3' | 'p') => void;
  backgroundColor?: string;
  selected?: boolean;
  type?: 'text' | 'image' | 'video';
  fontType?: 'h1' | 'h2' | 'h3' | 'p';
  getContent?: (nodeId: string) => string;
  getRichContent?: (nodeId: string) => string;
  // 新增：文本格式化功能
  onBoldToggle?: (nodeId: string) => void;
  onItalicToggle?: (nodeId: string) => void;
  onBulletListToggle?: (nodeId: string) => void;
  onNumberedListToggle?: (nodeId: string) => void;
  onHorizontalRuleInsert?: (nodeId: string) => void;
  onToggleFullscreen?: (nodeId: string) => void;
  // 新增：图片裁剪功能 - 修复：添加nodeId参数，与NodeBase类型匹配
  onEditStart?: (nodeId: string) => void;
  // 新增：图片擦除功能
  onEraseStart?: (nodeId: string) => void;
  // 新增：图片下载功能
  onDownload?: (nodeId: string) => void;
  // 新增：图片节点状态控制
  hasImage?: boolean;
}

const NodeToolbar = ({ 
  nodeId, 
  onTypeChange, 
  onDelete, 
  onReplace,
  onBackgroundColorChange,
  onFontTypeChange,
  onBoldToggle,
  onItalicToggle,
  onBulletListToggle,
  onNumberedListToggle,
  onHorizontalRuleInsert,
  onToggleFullscreen,
  onEditStart,
  onEraseStart,
  onDownload,
  selected = false, 
  type = 'text',
  fontType,
  getContent,
  getRichContent,
  hasImage = false
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

  const handleTypeChange = (newType: 'text' | 'image' | 'video') => {
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

  // 新增：文本格式化处理函数
  const handleBoldToggle = () => {
    onBoldToggle && onBoldToggle(nodeId);
  };

  const handleItalicToggle = () => {
    onItalicToggle && onItalicToggle(nodeId);
  };

  const handleBulletListToggle = () => {
    onBulletListToggle && onBulletListToggle(nodeId);
  };

  const handleNumberedListToggle = () => {
    onNumberedListToggle && onNumberedListToggle(nodeId);
  };

  const handleHorizontalRuleInsert = () => {
    onHorizontalRuleInsert && onHorizontalRuleInsert(nodeId);
  };
  
  const handleToggleFullscreen = () => {
    onToggleFullscreen && onToggleFullscreen(nodeId);
  };

  const [copySuccess, setCopySuccess] = useState(false);
  
  const handleCopyText = async () => {
    if (type === 'text' && getContent) {
      const plain = getContent(nodeId);
      const html = getRichContent ? getRichContent(nodeId) : undefined;
      const success = html 
        ? await copyRichTextToClipboard(html, plain) 
        : await copyToClipboard(plain);
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
        ];
      case 'image':
        return [
          { type: 'text' as const, label: '文本', icon: <TextFields fontSize="small" /> },
          { type: 'video' as const, label: '视频', icon: <VideoFile fontSize="small" /> },
        ];
      case 'video':
        return [
          { type: 'text' as const, label: '文本', icon: <TextFields fontSize="small" /> },
          { type: 'image' as const, label: '图片', icon: <ImageIcon fontSize="small" /> },
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
      <Tooltip title="删除节点" placement="top">
        <button
          onClick={handleDelete}
          className="w-8 h-8 p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
          aria-label="删除节点"
        >
          <DeleteOutline fontSize="small" />
        </button>
      </Tooltip>
      
      {/* 类型切换按钮 */}
      <div className="relative group">
        {/* <Tooltip title="切换节点类型" placement="top">
          <button
            className="w-8 h-8 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="切换节点类型"
          >
            <SwapHoriz fontSize="small" />
          </button>
        </Tooltip> */}
            
        
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
      
      {/* 更换文件按钮 - 仅对图片和视频节点显示 */}
      {(type === 'image' || type === 'video') && (
        <Tooltip 
          title={type === 'image' && !hasImage ? "请先上传图片" : "更换文件"} 
          placement="top"
        >
          <span>
            <button
              onClick={handleReplace}
              className={`w-8 h-8 p-1 rounded-md transition-colors ${
                type === 'image' && !hasImage 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50'
              }`}
              aria-label="更换文件"
              disabled={type === 'image' && !hasImage}
            >
              {type === 'image' ? <ImageIcon fontSize="small" /> : <VideoFile fontSize="small" />}
            </button>
          </span>
        </Tooltip>
      )}
      
      {/* 裁剪按钮 - 仅对图片节点显示 */}
      {type === 'image' && (
        <Tooltip 
          title={!hasImage ? "请先上传图片" : "裁剪图片"} 
          placement="top"
        >
          <span>
            <button
              onClick={() => hasImage && onEditStart?.(nodeId)}
              className={`w-8 h-8 p-1 rounded-md transition-colors ${
                !hasImage 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
              aria-label="裁剪图片"
              disabled={!hasImage}
            >
              <Crop fontSize="small" />
            </button>
          </span>
        </Tooltip>
      )}
      
      {/* 擦除按钮 - 仅对图片节点显示 */}
      {type === 'image' && (
        <Tooltip 
          title={!hasImage ? "请先上传图片" : "擦除"} 
          placement="top"
        >
          <span>
            <button
              onClick={() => hasImage && onEraseStart?.(nodeId)}
              className={`w-8 h-8 p-1 rounded-md transition-colors ${
                !hasImage 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
              aria-label="擦除"
              disabled={!hasImage}
            >
              <Brush fontSize="small" />
            </button>
          </span>
        </Tooltip>
      )}
      
      {/* 下载按钮 - 仅对图片节点显示 */}
      {type === 'image' && (
        <Tooltip 
          title={!hasImage ? "请先上传图片" : "下载图片"} 
          placement="top"
        >
          <span>
            <button
              onClick={() => hasImage && onDownload?.(nodeId)}
              className={`w-8 h-8 p-1 rounded-md transition-colors ${
                !hasImage 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
              }`}
              aria-label="下载图片"
              disabled={!hasImage}
            >
              <Download fontSize="small" />
            </button>
          </span>
        </Tooltip>
      )}
      
      {/* 背景色选择按钮 - 仅对文本节点显示 */}
      {type === 'text' && (
        <div className="relative">
          <Tooltip title="设置背景色" placement="top">
            <button
              ref={colorPickerRef}
              onClick={() => setColorPickerOpen(!colorPickerOpen)}
              className="w-8 h-8 p-1 text-gray-500 hover:text-purple-500 hover:bg-purple-50  rounded-md transition-colors"
              aria-label="设置背景色"
            >
              <Palette fontSize="small" />
            </button>
          </Tooltip>
          <ColorPickerPopover />
        </div>
      )}
      {type === 'text' && <div className="w-px h-6 bg-gray-200 mx-1" />}
      
      {/* 字体样式选择按钮 - 仅对文本节点显示 */}
      {type === 'text' && (
        <div className="flex gap-1">
          <Tooltip title="H1标题" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleFontTypeChange('h1')}
              className={`w-8 h-8 p-1 text-sm font-bold rounded-md transition-colors ${fontType === 'h1' ? 'text-indigo-500 bg-indigo-50' : 'text-gray-500 hover:text-indigo-500 hover:bg-indigo-50'}`}
              aria-label="H1标题"
            >
              H1
            </button>
          </Tooltip>
          
          <Tooltip title="H2标题" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleFontTypeChange('h2')}
              className={`w-8 h-8 p-1 text-sm font-bold rounded-md transition-colors ${fontType === 'h2' ? 'text-indigo-500 bg-indigo-50' : 'text-gray-500 hover:text-indigo-500 hover:bg-indigo-50'}`}
              aria-label="H2标题"
            >
              H2
            </button>
          </Tooltip>
          
          <Tooltip title="H3标题" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleFontTypeChange('h3')}
              className={`w-8 h-8 p-1 text-sm font-bold rounded-md transition-colors ${fontType === 'h3' ? 'text-indigo-500 bg-indigo-50' : 'text-gray-500 hover:text-indigo-500 hover:bg-indigo-50'}`}
              aria-label="H3标题"
            >
              H3
            </button>
          </Tooltip>
          
          <Tooltip title="正文" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleFontTypeChange('p')}
              className={`w-8 h-8 p-1 text-sm rounded-md transition-colors ${fontType === 'p' ? 'text-indigo-500 bg-indigo-50' : 'text-gray-500 hover:text-indigo-500 hover:bg-indigo-50'}`}
              aria-label="正文"
            >
              P
            </button>
          </Tooltip>
        </div>
      )}
      {type === 'text' && <div className="w-px h-6 bg-gray-200 mx-1" />}
      
      {/* 文本格式化按钮 - 仅对文本节点显示 */}
      {type === 'text' && (
        <>
          {/* 加粗按钮 */}
          <Tooltip title="加粗" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleBoldToggle}
              className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
              aria-label="加粗"
            >
              <FormatBold fontSize="small" />
            </button>
          </Tooltip>
          
          {/* 斜体按钮 */}
          <Tooltip title="斜体" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleItalicToggle}
              className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
              aria-label="斜体"
            >
              <FormatItalic fontSize="small" />
            </button>
          </Tooltip>
          
          {/* 无序列表按钮 */}
          <Tooltip title="无序列表" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleBulletListToggle}
              className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
              aria-label="无序列表"
            >
              <FormatListBulleted fontSize="small" />
            </button>
          </Tooltip>
          
          {/* 有序列表按钮 */}
          <Tooltip title="有序列表" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleNumberedListToggle}
              className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
              aria-label="有序列表"
            >
              <FormatListNumbered fontSize="small" />
            </button>
          </Tooltip>
          
          {/* 分割线按钮 */}
          <Tooltip title="分割线" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleHorizontalRuleInsert}
              className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
              aria-label="分割线"
            >
              <HorizontalRule fontSize="small" />
            </button>
          </Tooltip>
          <div className="w-px h-6 bg-gray-200 mx-1" />
        </>
      )}
      
      {/* 全屏按钮 - 仅对文本节点显示 */}
      {type === 'text' && (
        <Tooltip title="全屏" placement="top">
          <button
            onClick={handleToggleFullscreen}
            className="w-8 h-8 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="全屏"
          >
            <Fullscreen fontSize="small" />
          </button>
        </Tooltip>
      )}
      
      {/* 复制文本内容按钮 - 仅对文本节点显示 */}
      {type === 'text' && (
        <Tooltip title={copySuccess ? "已复制" : "复制全文"} placement="top">
          <button
            onClick={handleCopyText}
            className={`w-8 h-8 p-1 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors ${copySuccess ? 'text-green-500' : ''}`}
            aria-label="复制全文"
          >
            <ContentCopy fontSize="small" />
          </button>
        </Tooltip>
      )}
    </ReactFlowNodeToolbar>
  );
};

export default memo(NodeToolbar);
