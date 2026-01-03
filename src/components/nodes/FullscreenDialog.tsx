'use client';

import { memo, ReactNode } from 'react';
import { Close, FormatBold, FormatItalic, FormatListBulleted, FormatListNumbered, HorizontalRule, ContentCopy } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { copyToClipboard, copyRichTextToClipboard } from '@/lib/utils';

interface FullscreenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  backgroundColor?: string;
  fontType?: 'h1' | 'h2' | 'h3' | 'p';
  onFontTypeChange?: (fontType: 'h1' | 'h2' | 'h3' | 'p') => void;
  onBoldToggle?: () => void;
  onItalicToggle?: () => void;
  onBulletListToggle?: () => void;
  onNumberedListToggle?: () => void;
  onHorizontalRuleInsert?: () => void;
  getContent?: () => string;
  getRichContent?: () => string;
}

const FullscreenDialog = ({
  isOpen,
  onClose,
  children,
  backgroundColor = 'white',
  fontType = 'p',
  onFontTypeChange,
  onBoldToggle,
  onItalicToggle,
  onBulletListToggle,
  onNumberedListToggle,
  onHorizontalRuleInsert,
  getContent,
  getRichContent
}: FullscreenDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-0 animate-fade-in">
      <div 
        className="w-[80vw] h-[80vh] max-w-[80vw] max-h-[80vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col animate-scale-in z-10"
        style={{ backgroundColor }}
      >
        {/* 工具栏区域 */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 p-2 flex items-center gap-1">
          {/* 标题设置 */}
          <Tooltip title="H1标题" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onFontTypeChange?.('h1')}
              className={`w-8 h-8 p-1 text-sm font-bold rounded-md transition-colors ${fontType === 'h1' ? 'text-indigo-500 bg-indigo-50' : 'text-gray-500 hover:text-indigo-500 hover:bg-indigo-50'}`}
              aria-label="H1标题"
            >
              H1
            </button>
          </Tooltip>
          
          <Tooltip title="H2标题" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onFontTypeChange?.('h2')}
              className={`w-8 h-8 p-1 text-sm font-bold rounded-md transition-colors ${fontType === 'h2' ? 'text-indigo-500 bg-indigo-50' : 'text-gray-500 hover:text-indigo-500 hover:bg-indigo-50'}`}
              aria-label="H2标题"
            >
              H2
            </button>
          </Tooltip>
          
          <Tooltip title="H3标题" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onFontTypeChange?.('h3')}
              className={`w-8 h-8 p-1 text-sm font-bold rounded-md transition-colors ${fontType === 'h3' ? 'text-indigo-500 bg-indigo-50' : 'text-gray-500 hover:text-indigo-500 hover:bg-indigo-50'}`}
              aria-label="H3标题"
            >
              H3
            </button>
          </Tooltip>
          
          <Tooltip title="正文" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onFontTypeChange?.('p')}
              className={`w-8 h-8 p-1 text-sm rounded-md transition-colors ${fontType === 'p' ? 'text-indigo-500 bg-indigo-50' : 'text-gray-500 hover:text-indigo-500 hover:bg-indigo-50'}`}
              aria-label="正文"
            >
              P
            </button>
          </Tooltip>
          
          <div className="w-px h-6 bg-gray-200 mx-1" />
          
          {/* 文本格式化按钮 */}
          <Tooltip title="加粗" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={onBoldToggle}
              className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
              aria-label="加粗"
            >
              <FormatBold fontSize="small" />
            </button>
          </Tooltip>
          
          <Tooltip title="斜体" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={onItalicToggle}
              className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
              aria-label="斜体"
            >
              <FormatItalic fontSize="small" />
            </button>
          </Tooltip>
          
          <Tooltip title="无序列表" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={onBulletListToggle}
              className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
              aria-label="无序列表"
            >
              <FormatListBulleted fontSize="small" />
            </button>
          </Tooltip>
          
          <Tooltip title="有序列表" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={onNumberedListToggle}
              className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
              aria-label="有序列表"
            >
              <FormatListNumbered fontSize="small" />
            </button>
          </Tooltip>
          
          <Tooltip title="分割线" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={onHorizontalRuleInsert}
              className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
              aria-label="分割线"
            >
              <HorizontalRule fontSize="small" />
            </button>
          </Tooltip>
          
          <div className="w-px h-6 bg-gray-200 mx-1" />
          
          {/* 复制文本内容按钮 */}
          <Tooltip title="复制全文" placement="top">
            <button
              onClick={async () => {
                if (getContent) {
                  const plain = getContent();
                  const html = getRichContent ? getRichContent() : undefined;
                  const success = html 
                    ? await copyRichTextToClipboard(html, plain) 
                    : await copyToClipboard(plain);
                  if (!success) {
                    console.error('复制失败');
                  }
                }
              }}
              className="w-8 h-8 p-1 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
              aria-label="复制全文"
            >
              <ContentCopy fontSize="small" />
            </button>
          </Tooltip>
          
          {/* 退出全屏按钮 */}
          <div className="ml-auto" />
          <Tooltip title="退出全屏" placement="top">
            <button
              onClick={onClose}
              className="w-8 h-8 p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              aria-label="退出全屏"
            >
              <Close fontSize="small" />
            </button>
          </Tooltip>
        </div>
        
        {/* 编辑区域 */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default memo(FullscreenDialog);
