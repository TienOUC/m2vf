import { NodeToolbar as ReactFlowNodeToolbar, Position } from '@xyflow/react';
import { Image, Video, Palette, Copy, Bold, Italic, List, ListOrdered, Minus, Maximize, Trash2, Crop, Brush, Download, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { memo, useState, useRef, useCallback } from 'react';
import { useClickOutside } from '@/hooks';

import { copyToClipboard, copyRichTextToClipboard } from '@/lib/utils/text';

export interface NodeToolbarProps {
  nodeId: string;
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
  // 新增：图片背景去除功能
  onBackgroundRemove?: (nodeId: string) => void;
}

const NodeToolbar = ({ 
  nodeId, 
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
  onBackgroundRemove,
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
  
  // 处理抠图按钮点击
  const handleBackgroundRemoveClick = useCallback(() => {
    if (!hasImage || !onBackgroundRemove) return;
    onBackgroundRemove(nodeId);
  }, [hasImage, onBackgroundRemove, nodeId]);

  // 点击外部关闭颜色选择器
  useClickOutside([colorPickerRef, colorPickerPopoverRef], () => {
    if (colorPickerOpen) {
      setColorPickerOpen(false);
    }
  });

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
    { value: '#ffffff', label: '纯白色', cssVar: 'var(--node-bg-white)' },
    { value: 'rgba(150, 90, 91, 0.95)', label: '暗砖红', cssVar: 'var(--node-bg-color1)' },
    { value: 'rgba(131, 90, 60, 0.95)', label: '浅咖色', cssVar: 'var(--node-bg-color2)' },
    { value: 'rgba(143, 138, 90, 0.95)', label: '浅橄榄', cssVar: 'var(--node-bg-color3)' },
    { value: 'rgba(90, 115, 95, 0.95)', label: '豆绿色', cssVar: 'var(--node-bg-color4)' },
    { value: 'rgba(80, 114, 125, 0.95)', label: '青灰色', cssVar: 'var(--node-bg-color5)' },
    { value: 'rgba(75, 95, 125, 0.95)', label: '灰蓝色', cssVar: 'var(--node-bg-color6)' },
    { value: 'rgba(118, 90, 125, 0.95)', label: '灰紫色', cssVar: 'var(--node-bg-color7)' },
  ];



  // 颜色选择器弹窗
  const ColorPickerPopover = () => (
    <div 
      ref={colorPickerPopoverRef}
      className={`absolute top-9 left-0 bg-white rounded-md shadow-lg border border-gray-200 p-2 z-30 w-40 ${colorPickerOpen ? 'block' : 'hidden'}`}
    >
      <div className="grid grid-cols-4 gap-2">
        {colorOptions.map((color, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleBackgroundColorChange(color.value)}
                className="w-8 h-8 rounded-full border border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: color.cssVar }}
                aria-label={color.label}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{color.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );

  return (
    <ReactFlowNodeToolbar
      nodeId={nodeId}
      position={Position.Top}
      offset={20}
      isVisible={selected}
      className="bg-white shadow-sm rounded-full border border-neutral-200 px-2 py-1 flex items-center gap-1"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleDelete}
            className="w-8 h-8 p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors flex items-center justify-center"
            aria-label="删除节点"
          >
            <Trash2 size={16} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>删除节点</p>
        </TooltipContent>
      </Tooltip>
      

      
      {/* 更换文件按钮 - 仅对图片和视频节点显示 */}
      {(type === 'image' || type === 'video') && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <button
                onClick={handleReplace}
                className={`w-8 h-8 p-1 rounded-md transition-colors ${type === 'image' && !hasImage ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50'} flex items-center justify-center`}
                aria-label="更换文件"
                disabled={type === 'image' && !hasImage}
              >
                {type === 'image' ? <Image size={16} /> : <Video size={16} />}
              </button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{type === 'image' && !hasImage ? "请先上传图片" : "更换文件"}</p>
          </TooltipContent>
        </Tooltip>
      )}
      
      {/* 下载按钮 - 仅对图片节点显示 */}
      {type === 'image' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <button
                onClick={() => hasImage && onDownload?.(nodeId)}
                className={`w-8 h-8 p-1 rounded-md transition-colors ${!hasImage ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-green-600 hover:bg-green-50'} flex items-center justify-center`}
                aria-label="下载图片"
                disabled={!hasImage}
              >
                <Download size={16} />
              </button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{!hasImage ? "请先上传图片" : "下载图片"}</p>
          </TooltipContent>
        </Tooltip>
      )}
      
      {/* 垂直分割线 */}
      {type === 'image' && (
        <div className="w-px h-6 bg-gray-200 mx-1" />
      )}
      
      {/* 裁剪按钮 - 仅对图片节点显示 */}
      {type === 'image' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <button
                onClick={() => hasImage && onEditStart?.(nodeId)}
                className={`w-8 h-8 p-1 rounded-md transition-colors ${!hasImage ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'} flex items-center justify-center`}
                aria-label="裁剪图片"
                disabled={!hasImage}
              >
                <Crop size={16} />
              </button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{!hasImage ? "请先上传图片" : "裁剪图片"}</p>
          </TooltipContent>
        </Tooltip>
      )}
      
      {/* 擦除按钮 - 仅对图片节点显示 */}
      {type === 'image' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <button
                onClick={() => hasImage && onEraseStart?.(nodeId)}
                className={`w-8 h-8 p-1 rounded-md transition-colors ${!hasImage ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'} flex items-center justify-center`}
                aria-label="擦除"
                disabled={!hasImage}
              >
                <Brush size={16} />
              </button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{!hasImage ? "请先上传图片" : "擦除"}</p>
          </TooltipContent>
        </Tooltip>
      )}
      
      {/* 背景去除按钮 - 仅对图片节点显示 */}
      {type === 'image' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <button
                onClick={handleBackgroundRemoveClick}
                className={`w-8 h-8 p-1 rounded-md transition-colors ${!hasImage ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'} flex items-center justify-center`}
                aria-label="抠图"
                disabled={!hasImage}
              >
                <Sparkles size={16} />
              </button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{!hasImage ? "请先上传图片" : "抠图"}</p>
          </TooltipContent>
        </Tooltip>
      )}
      
      {/* 背景色选择按钮 - 仅对文本节点显示 */}
      {type === 'text' && (
        <div className="relative">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                ref={colorPickerRef}
                onClick={() => setColorPickerOpen(!colorPickerOpen)}
                className="w-8 h-8 p-1 text-gray-500 hover:text-purple-500 hover:bg-purple-50  rounded-md transition-colors flex items-center justify-center"
                aria-label="设置背景色"
              >
                <Palette size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>设置背景色</p>
            </TooltipContent>
          </Tooltip>
          <ColorPickerPopover />
        </div>
      )}
      {type === 'text' && <div className="w-px h-6 bg-gray-200 mx-1" />}
      
      {/* 字体样式选择按钮 - 仅对文本节点显示 */}
      {type === 'text' && (
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleFontTypeChange('h1')}
                className={`w-8 h-8 p-1 text-sm font-bold rounded-md transition-colors ${fontType === 'h1' ? 'text-indigo-500 bg-indigo-50' : 'text-gray-500 hover:text-indigo-500 hover:bg-indigo-50'} flex items-center justify-center`}
                aria-label="H1标题"
              >
                H1
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>H1标题</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleFontTypeChange('h2')}
                className={`w-8 h-8 p-1 text-sm font-bold rounded-md transition-colors ${fontType === 'h2' ? 'text-indigo-500 bg-indigo-50' : 'text-gray-500 hover:text-indigo-500 hover:bg-indigo-50'} flex items-center justify-center`}
                aria-label="H2标题"
              >
                H2
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>H2标题</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleFontTypeChange('h3')}
                className={`w-8 h-8 p-1 text-sm font-bold rounded-md transition-colors ${fontType === 'h3' ? 'text-indigo-500 bg-indigo-50' : 'text-gray-500 hover:text-indigo-500 hover:bg-indigo-50'} flex items-center justify-center`}
                aria-label="H3标题"
              >
                H3
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>H3标题</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleFontTypeChange('p')}
                className={`w-8 h-8 p-1 text-sm rounded-md transition-colors ${fontType === 'p' ? 'text-indigo-500 bg-indigo-50' : 'text-gray-500 hover:text-indigo-500 hover:bg-indigo-50'} flex items-center justify-center`}
                aria-label="正文"
              >
                P
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>正文</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
      {type === 'text' && <div className="w-px h-6 bg-gray-200 mx-1" />}
      
      {/* 文本格式化按钮 - 仅对文本节点显示 */}
      {type === 'text' && (
        <>
          {/* 加粗按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleBoldToggle}
                className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors flex items-center justify-center"
                aria-label="加粗"
              >
                <Bold size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>加粗</p>
            </TooltipContent>
          </Tooltip>
          
          {/* 斜体按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleItalicToggle}
                className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors flex items-center justify-center"
                aria-label="斜体"
              >
                <Italic size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>斜体</p>
            </TooltipContent>
          </Tooltip>
          
          {/* 无序列表按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleBulletListToggle}
                className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors flex items-center justify-center"
                aria-label="无序列表"
              >
                <List size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>无序列表</p>
            </TooltipContent>
          </Tooltip>
          
          {/* 有序列表按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleNumberedListToggle}
                className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors flex items-center justify-center"
                aria-label="有序列表"
              >
                <ListOrdered size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>有序列表</p>
            </TooltipContent>
          </Tooltip>
          
          {/* 分割线按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleHorizontalRuleInsert}
                className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors flex items-center justify-center"
                aria-label="分割线"
              >
                <Minus size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>分割线</p>
            </TooltipContent>
          </Tooltip>
          <div className="w-px h-6 bg-gray-200 mx-1" />
        </>
      )}
      
      {/* 全屏按钮 - 仅对文本节点显示 */}
      {type === 'text' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
                onClick={handleToggleFullscreen}
                className="w-8 h-8 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-center"
                aria-label="全屏"
              >
              <Maximize size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>全屏</p>
          </TooltipContent>
        </Tooltip>
      )}
      
      {/* 复制文本内容按钮 - 仅对文本节点显示 */}
      {type === 'text' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
                onClick={handleCopyText}
                className={`w-8 h-8 p-1 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors ${copySuccess ? 'text-green-500' : ''} flex items-center justify-center`}
                aria-label="复制全文"
              >
              <Copy size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copySuccess ? "已复制" : "复制全文"}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </ReactFlowNodeToolbar>
  );
};

export default memo(NodeToolbar);
