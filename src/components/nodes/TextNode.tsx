'use client';

import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { NodeResizeControl } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { NodeBase } from './NodeBase';
import ResizeIcon from './ResizeIcon';
import { getFontClass, isNotWhiteColor } from '@/lib/utils';
import { M2VFlowLexicalEditor } from './LexicalEditor';
import { EditorState } from 'lexical';
import { useClickOutside } from '@/hooks';
import { useTextFormatting } from '@/hooks/useTextFormatting';
import { useLexicalEditor } from '@/hooks/useLexicalEditor';



export interface TextNodeData {
  label?: string;
  content?: string;
  editorStateJson?: string; // 保存序列化后的编辑器状态
  backgroundColor?: string;
  fontType?: 'h1' | 'h2' | 'h3' | 'p';
  onTypeChange?: (
    nodeId: string,
    newType: 'text' | 'image' | 'video' | 'audio'
  ) => void;
  onDelete?: (nodeId: string) => void;
  onBackgroundColorChange?: (nodeId: string, color: string) => void;
  getContent?: (nodeId: string) => string;
  onContentChange?: (content: string, editorStateJson?: string) => void;
  onFontTypeChange?: (
    nodeId: string,
    fontType: 'h1' | 'h2' | 'h3' | 'p'
  ) => void;
  isEditing?: boolean;
}

function TextNode({ data, id, selected }: NodeProps) {
  const nodeData = data as TextNodeData;
  const [content, setContent] = useState(nodeData?.content || '');
  const [editorStateJson, setEditorStateJson] = useState(nodeData?.editorStateJson);
  const [isEditing, setIsEditing] = useState(nodeData?.isEditing || false);

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
    }
  });

  // 暴露获取内容的函数到父组件
  useEffect(() => {
    if (nodeData?.getContent) {
      // 在组件挂载时更新内容映射
      nodeData.getContent(id);
    }
  }, [content, nodeData, id]);

  const controlStyle = {
    background: 'transparent',
    border: 'none'
  };

  // 判断背景色是否非白色，决定文字颜色
  const isDarkBg = isNotWhiteColor(nodeData?.backgroundColor || 'white');

  // 获取字体类名
  // 始终使用基础样式作为容器样式，具体的标题样式由 Lexical 内部节点决定
  // 这样可以避免容器的样式（如 text-2xl）强制覆盖内部的所有文本节点
  const fontClass = getFontClass('p');

  // 双击处理函数，进入编辑模式
  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  // 点击外部区域失焦处理函数
  const nodeRef = useRef<HTMLDivElement>(null);

  useClickOutside([nodeRef], (event) => {
    // 如果点击的是工具栏或颜色选择器（它们可能渲染在 Portal 中），不退出编辑模式
    const target = event.target as HTMLElement;
    const isToolbarClick = target.closest('.react-flow__node-toolbar');
    const isPopoverClick = target.closest('.MuiPopover-root');
    const isTooltipClick = target.closest('.MuiTooltip-popper');

    if (isToolbarClick || isPopoverClick || isTooltipClick) {
      return;
    }

    isEditing && setIsEditing(false);
  });

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
  const handleFontTypeChange = useCallback(
    (fontType: 'h1' | 'h2' | 'h3' | 'p') => {
      // 优先更新编辑器内容
      handleEditorFontTypeChange(fontType);

      // 不再更新节点数据的 fontType，避免导致整个容器样式改变
      // 如果需要保持兼容性，可以在这里做特殊处理，但目前为了支持富文本混排，
      // 应该由编辑器内部状态控制样式
      /*
      if (nodeData?.onFontTypeChange) {
        nodeData.onFontTypeChange(id, fontType);
      }
      */
    },
    [handleEditorFontTypeChange]
  );

  return (
    <NodeBase
      ref={nodeRef}
      data={{ ...data, isEditing }}
      id={id}
      selected={selected}
      nodeType="text"
      onBackgroundColorChange={nodeData?.onBackgroundColorChange}
      onFontTypeChange={(_, fontType) => handleFontTypeChange(fontType)}
      backgroundColor={nodeData?.backgroundColor}
      fontType={nodeData?.fontType}
      // 传递文本格式化功能
      onBoldToggle={handleBoldToggle}
      onItalicToggle={handleItalicToggle}
      onBulletListToggle={handleBulletListToggle}
      onNumberedListToggle={handleNumberedListToggle}
      onHorizontalRuleInsert={handleHorizontalRuleInsert}
    >
      <NodeResizeControl style={controlStyle} minWidth={100} minHeight={50}>
        <ResizeIcon className="absolute right-1 bottom-1" />
      </NodeResizeControl>
      <div
        className={`absolute inset-0 p-2 ${isEditing ? 'nodrag' : ''}`}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: isEditing ? 'default' : 'grab' }}
      >
        {isEditing ? (
          <M2VFlowLexicalEditor
            key={`editor-${id}`}
            initialContent={content}
            initialEditorState={editorStateJson}
            onChange={handleEditorChange}
            onInit={handleEditorInit}
            backgroundColor={nodeData?.backgroundColor || 'white'}
            fontColor={isDarkBg ? 'white' : 'gray-700'}
            className={`w-full h-full ${fontClass}`}
            onFontTypeChange={handleFontTypeChange}
            onBoldToggle={handleBoldToggle}
            onItalicToggle={handleItalicToggle}
            onBulletListToggle={handleBulletListToggle}
            onNumberedListToggle={handleNumberedListToggle}
            onHorizontalRuleInsert={handleHorizontalRuleInsert}
          />
        ) : (
          <div className="w-full h-full relative">
            {/* 使用只读模式的编辑器来展示内容，保留所有样式 */}
            <M2VFlowLexicalEditor
              key={`readonly-editor-${id}`}
              initialContent={content}
              initialEditorState={editorStateJson}
              backgroundColor={nodeData?.backgroundColor || 'white'}
              fontColor={isDarkBg ? 'white' : 'gray-700'}
              className={`w-full h-full ${fontClass}`}
              readOnly={true}
            />
            {/* 如果没有内容，显示占位符 */}
            {!content && (
              <div
                className={`absolute inset-0 p-2 text-${
                  isDarkBg ? 'white' : 'gray-700'
                } pointer-events-none`}
              >
                双击输入文本
              </div>
            )}
          </div>
        )}
      </div>
    </NodeBase>
  );
}

export default memo(TextNode);
