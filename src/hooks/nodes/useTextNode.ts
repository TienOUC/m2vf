import { useState, useCallback, useEffect, useRef } from 'react';
import { useClickOutside } from '@/hooks';
import { TextNodeData } from '@/lib/types/editor/text';
import { useTextFormatting } from './useTextFormatting';
import { useLexicalEditor } from '@/hooks/utils/useLexicalEditor';

interface UseTextNodeProps {
  data: TextNodeData;
  id: string;
  selected: boolean;
  onEditingChange?: (nodeId: string, isEditing: boolean) => void;
  onFontTypeChange?: (nodeId: string, fontType: 'h1' | 'h2' | 'h3' | 'p') => void;
}

export const useTextNode = ({ data, id, selected, onEditingChange, onFontTypeChange }: UseTextNodeProps) => {
  const nodeData = data;
  const [content, setContent] = useState(nodeData?.content || '');
  const [editorStateJson, setEditorStateJson] = useState(nodeData?.editorStateJson);
  const [isEditing, setIsEditing] = useState(nodeData?.isEditing || false);
  const [currentFontType, setCurrentFontType] = useState<'h1' | 'h2' | 'h3' | 'p'>(nodeData?.fontType || 'p');

  // 使用新的 useLexicalEditor hook
  const { lexicalEditorRef, handleEditorChange, handleEditorInit } = useLexicalEditor({
    onContentChange: (textContent, newStateJson) => {
      setContent(textContent);
      if (newStateJson) {
        setEditorStateJson(newStateJson);
      }
      if (nodeData?.onContentChange) {
        nodeData.onContentChange(textContent, newStateJson);
      }
    },
    onRichContentChange: (html) => {
      if (nodeData?.onRichContentChange) {
        nodeData.onRichContentChange(html);
      }
    },
    onCurrentFontTypeChange: (ft) => {
      setCurrentFontType(ft);
    }
  });

  // 暴露获取内容的函数到父组件
  useEffect(() => {
    if (nodeData?.getContent) {
      // 在组件挂载时更新内容映射
      nodeData.getContent(id);
    }
  }, [content, nodeData, id]);

  // 双击处理函数，进入编辑模式
  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  // 点击外部区域失焦处理函数
  const nodeRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  
  // 使用Dialog形式的全屏，不再使用浏览器级别的全屏API
  const [isFullscreenDialogOpen, setIsFullscreenDialogOpen] = useState(false);
  
  // 切换全屏Dialog显示状态
  const toggleFullscreenDialog = useCallback(() => {
    setIsFullscreenDialogOpen(prev => !prev);
  }, []);
  
  // 关闭全屏Dialog
  const closeFullscreenDialog = useCallback(() => {
    setIsFullscreenDialogOpen(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenDialogOpen) {
        closeFullscreenDialog();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreenDialogOpen, closeFullscreenDialog]);

  useClickOutside([nodeRef], (event) => {
    // 如果点击的是工具栏或颜色选择器（它们可能渲染在 Portal 中），不退出编辑模式
    const target = event.target as HTMLElement;
    const isToolbarClick = target.closest('.react-flow__node-toolbar');
    const isPopoverClick = target.closest('.MuiPopover-root');
    const isTooltipClick = target.closest('.MuiTooltip-popper');

    if (isToolbarClick || isPopoverClick || isTooltipClick) {
      return;
    }

    if (isEditing) {
      setIsEditing(false);
    }
  });

  // 同步编辑状态到父组件，驱动全局缩放策略
  useEffect(() => {
    if (onEditingChange) {
      onEditingChange(id, isEditing);
    }
  }, [isEditing, onEditingChange, id]);

  // 使用新的 useTextFormatting hook
  const {
    handleBoldToggle,
    handleItalicToggle,
    handleBulletListToggle,
    handleNumberedListToggle,
    handleHorizontalRuleInsert,
    handleFontTypeChange: handleEditorFontTypeChange
  } = useTextFormatting({ lexicalEditorRef });

  // 字体类型切换处理函数
  const handleFontTypeChangeInternal = useCallback(
    (fontType: 'h1' | 'h2' | 'h3' | 'p') => {
      // 优先更新编辑器内容
      handleEditorFontTypeChange(fontType);

      // 如果提供了外部回调，也调用它
      if (onFontTypeChange) {
        onFontTypeChange(id, fontType);
      }
      setCurrentFontType(fontType);
    },
    [handleEditorFontTypeChange, onFontTypeChange, id]
  );

  return {
    // State
    content,
    editorStateJson,
    isEditing,
    currentFontType,
    isFullscreenDialogOpen,
    
    // Refs
    nodeRef,
    editorContainerRef,
    lexicalEditorRef,
    
    // Functions
    handleDoubleClick,
    handleEditorChange,
    handleEditorInit,
    toggleFullscreenDialog,
    closeFullscreenDialog,
    handleFontTypeChange: handleFontTypeChangeInternal,
    handleBoldToggle,
    handleItalicToggle,
    handleBulletListToggle,
    handleNumberedListToggle,
    handleHorizontalRuleInsert,
    setIsEditing,
    
    // Flags
    isNodeSelected: selected && !isFullscreenDialogOpen
  };
};