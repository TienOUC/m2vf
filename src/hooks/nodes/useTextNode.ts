import { useCallback, useEffect, useRef, useState } from 'react';
import { useClickOutside } from '@/hooks';
import { TextNodeData } from '@/lib/types/editor/text';
import { useTextFormatting } from './useTextFormatting';
import { useLexicalEditor } from '@/hooks/utils/useLexicalEditor';
import { useTextNodesStore } from '@/lib/stores/textNodesStore';

interface UseTextNodeProps {
  data: TextNodeData;
  id: string;
  selected: boolean;
  onEditingChange?: (nodeId: string, isEditing: boolean) => void;
  onFontTypeChange?: (nodeId: string, fontType: 'h1' | 'h2' | 'h3' | 'p') => void;
}

export const useTextNode = ({ data, id, selected, onEditingChange, onFontTypeChange }: UseTextNodeProps) => {
  const nodeData = data;
  
  // 使用全局状态管理
  const textNodesStore = useTextNodesStore();
  
  // 初始化节点数据到全局状态
  useEffect(() => {
    // 只在节点首次创建或数据更新时初始化
    const existingNode = textNodesStore.getTextNode(id);
    if (!existingNode || 
        (nodeData?.content && existingNode.content !== nodeData.content) ||
        (nodeData?.fontType && existingNode.fontType !== nodeData.fontType) ||
        (nodeData?.backgroundColor && existingNode.backgroundColor !== nodeData.backgroundColor)) {
      textNodesStore.setTextNode(id, {
        // 优先使用全局状态中已有的内容，而不是 nodeData 中的内容
        content: existingNode?.content || nodeData?.content || '',
        fontType: nodeData?.fontType || existingNode?.fontType || 'p',
        backgroundColor: nodeData?.backgroundColor || existingNode?.backgroundColor || 'white',
        // 优先使用全局状态中已有的 editorStateJson，而不是 nodeData 中的内容
        editorStateJson: existingNode?.editorStateJson || nodeData?.editorStateJson,
        isEditing: nodeData?.isEditing || existingNode?.isEditing || false,
      });
    }
  }, [id, nodeData, textNodesStore]);
  
  // 从全局状态获取节点数据
  const nodeFromStore = textNodesStore.getTextNode(id);
  const content = nodeFromStore?.content || '';
  const editorStateJson = nodeFromStore?.editorStateJson;
  const currentFontType = nodeFromStore?.fontType || 'p';
  
  // 本地状态，不需要全局持久化
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreenDialogOpen, setIsFullscreenDialogOpen] = useState(false);
  
  // 使用新的 useLexicalEditor hook
  const { lexicalEditorRef, handleEditorChange, handleEditorInit } = useLexicalEditor({
    onContentChange: (textContent, newStateJson) => {
      // 更新全局状态
      textNodesStore.updateTextNodeContent(id, textContent, newStateJson);
      
      // 通知原始回调
      if (nodeData?.onContentChange) {
        nodeData.onContentChange(textContent, newStateJson);
      }
    },
    onRichContentChange: (html) => {
      // 更新全局状态
      textNodesStore.updateTextNodeRichContent(id, html);
      
      // 通知原始回调
      if (nodeData?.onRichContentChange) {
        nodeData.onRichContentChange(html);
      }
    },
    onCurrentFontTypeChange: (ft) => {
      // 更新全局状态
      textNodesStore.updateTextNodeFontType(id, ft);
    }
  });

  // 双击处理函数，进入编辑模式
  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  // 点击外部区域失焦处理函数
  const nodeRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  
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
    },
    [handleEditorFontTypeChange, onFontTypeChange, id]
  );

  // 暴露获取内容的函数到父组件
  useEffect(() => {
    if (nodeData?.getContent) {
      // 在组件挂载时更新内容映射
      nodeData.getContent(id);
    }
  }, [content, nodeData, id]);

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
    
    // Flags
    isNodeSelected: selected && !isFullscreenDialogOpen
  };
};