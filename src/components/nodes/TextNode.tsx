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
  backgroundColor?: string;
  fontType?: 'h1' | 'h2' | 'h3' | 'p';
  onTypeChange?: (
    nodeId: string,
    newType: 'text' | 'image' | 'video' | 'audio'
  ) => void;
  onDelete?: (nodeId: string) => void;
  onBackgroundColorChange?: (nodeId: string, color: string) => void;
  getContent?: (nodeId: string) => string;
  onContentChange?: (content: string) => void;
  onFontTypeChange?: (
    nodeId: string,
    fontType: 'h1' | 'h2' | 'h3' | 'p'
  ) => void;
  isEditing?: boolean;
}

function TextNode({ data, id, selected, ...rest }: NodeProps) {
  const nodeData = data as TextNodeData;
  const [content, setContent] = useState(nodeData?.content || '');
  const [isEditing, setIsEditing] = useState(nodeData?.isEditing || false);

  // 使用新的 useLexicalEditor hook
  const { lexicalEditorRef, handleEditorChange } = useLexicalEditor({
    onContentChange: (textContent) => {
      setContent(textContent);
      if (nodeData?.onContentChange) {
        nodeData.onContentChange(textContent);
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
  const fontClass = getFontClass(nodeData?.fontType);

  // 双击处理函数，进入编辑模式
  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  // 点击外部区域失焦处理函数
  const nodeRef = useRef<HTMLDivElement>(null);

  useClickOutside([nodeRef], () => {
    isEditing && setIsEditing(false);
  });

  // 字体类型切换处理函数
  const handleFontTypeChange = useCallback(
    (fontType: 'h1' | 'h2' | 'h3' | 'p') => {
      if (nodeData?.onFontTypeChange) {
        nodeData.onFontTypeChange(id, fontType);
      }
    },
    [id, nodeData?.onFontTypeChange]
  );

  // 使用新的 useTextFormatting hook
  const {
    handleBoldToggle,
    handleItalicToggle,
    handleBulletListToggle,
    handleNumberedListToggle,
    handleHorizontalRuleInsert
  } = useTextFormatting({ lexicalEditorRef });

  return (
    <NodeBase
      ref={nodeRef}
      data={{ ...data, isEditing }}
      id={id}
      selected={selected}
      nodeType="text"
      onBackgroundColorChange={nodeData?.onBackgroundColorChange}
      onFontTypeChange={nodeData?.onFontTypeChange}
      backgroundColor={nodeData?.backgroundColor}
      fontType={nodeData?.fontType}
      // 传递文本格式化功能
      onBoldToggle={handleBoldToggle}
      onItalicToggle={handleItalicToggle}
      onBulletListToggle={handleBulletListToggle}
      onNumberedListToggle={handleNumberedListToggle}
      onHorizontalRuleInsert={handleHorizontalRuleInsert}
      {...rest}
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
            onChange={handleEditorChange}
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
          <div
            className={`w-full h-full ${fontClass} p-2 text-${
              isDarkBg ? 'white' : 'gray-700'
            } overflow-hidden`}
          >
            {content || '双击输入文本'}
          </div>
        )}
      </div>
    </NodeBase>
  );
}

export default memo(TextNode);
