'use client';

import { memo, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 800,
    height: 600
  });
  const roRef = useRef<ResizeObserver | null>(null);
  const mainEl = useMemo(() => {
    if (typeof document === 'undefined') return null;
    return document.querySelector('main') as HTMLElement | null;
  }, []);
  
  const tooltipPopperProps = { slotProps: { popper: { sx: { zIndex: 10001 } } } };

  const computeSize = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = mainEl?.getBoundingClientRect();
    const baseW = rect?.width ?? vw;
    const baseH = rect?.height ?? vh;
    let targetW = Math.floor(baseW * 0.8);
    let targetH = Math.floor(baseH * 0.8);
    targetW = Math.max(300, Math.min(targetW, vw));
    targetH = Math.max(300, Math.min(targetH, vh));
    setSize({ width: targetW, height: targetH });
  };

  useEffect(() => {
    if (!isOpen) return;
    computeSize();

    const onResize = () => computeSize();
    window.addEventListener('resize', onResize);

    if (mainEl) {
      const ro = new ResizeObserver(() => computeSize());
      ro.observe(mainEl);
      roRef.current = ro;
    }

    return () => {
      window.removeEventListener('resize', onResize);
      roRef.current?.disconnect();
      roRef.current = null;
    };
  }, [isOpen, mainEl]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-0">
      <div 
        className="bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col animate-scale-in z-10 transition-all"
        style={{ 
          backgroundColor,
          width: `${size.width}px`,
          height: `${size.height}px`,
          maxWidth: '100vw',
          maxHeight: '100vh',
          transition: 'width 200ms ease, height 200ms ease',
          ['--text-node-font-size' as any]: 'var(--font-size-sm)',
          ['--text-node-placeholder-size' as any]: 'var(--font-size-sm)'
        }}
      >
        {/* 工具栏区域 */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 p-2 flex items-center gap-1">
          {/* 标题设置 */}
          <Tooltip {...tooltipPopperProps} title="H1标题" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onFontTypeChange?.('h1')}
              className={`w-8 h-8 p-1 text-sm font-bold rounded-md transition-colors ${fontType === 'h1' ? 'text-indigo-500 bg-indigo-50' : 'text-gray-500 hover:text-indigo-500 hover:bg-indigo-50'}`}
              aria-label="H1标题"
            >
              H1
            </button>
          </Tooltip>
          
          <Tooltip {...tooltipPopperProps} title="H2标题" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onFontTypeChange?.('h2')}
              className={`w-8 h-8 p-1 text-sm font-bold rounded-md transition-colors ${fontType === 'h2' ? 'text-indigo-500 bg-indigo-50' : 'text-gray-500 hover:text-indigo-500 hover:bg-indigo-50'}`}
              aria-label="H2标题"
            >
              H2
            </button>
          </Tooltip>
          
          <Tooltip {...tooltipPopperProps} title="H3标题" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onFontTypeChange?.('h3')}
              className={`w-8 h-8 p-1 text-sm font-bold rounded-md transition-colors ${fontType === 'h3' ? 'text-indigo-500 bg-indigo-50' : 'text-gray-500 hover:text-indigo-500 hover:bg-indigo-50'}`}
              aria-label="H3标题"
            >
              H3
            </button>
          </Tooltip>
          
          <Tooltip {...tooltipPopperProps} title="正文" placement="top">
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
          <Tooltip {...tooltipPopperProps} title="加粗" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={onBoldToggle}
              className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
              aria-label="加粗"
            >
              <FormatBold fontSize="small" />
            </button>
          </Tooltip>
          
          <Tooltip {...tooltipPopperProps} title="斜体" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={onItalicToggle}
              className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
              aria-label="斜体"
            >
              <FormatItalic fontSize="small" />
            </button>
          </Tooltip>
          
          <Tooltip {...tooltipPopperProps} title="无序列表" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={onBulletListToggle}
              className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
              aria-label="无序列表"
            >
              <FormatListBulleted fontSize="small" />
            </button>
          </Tooltip>
          
          <Tooltip {...tooltipPopperProps} title="有序列表" placement="top">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={onNumberedListToggle}
              className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
              aria-label="有序列表"
            >
              <FormatListNumbered fontSize="small" />
            </button>
          </Tooltip>
          
          <Tooltip {...tooltipPopperProps} title="分割线" placement="top">
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
          <Tooltip {...tooltipPopperProps} title="复制全文" placement="top">
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
          <Tooltip {...tooltipPopperProps} title="退出全屏" placement="top">
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
    </div>,
    document.body
  );
};

export default memo(FullscreenDialog);
