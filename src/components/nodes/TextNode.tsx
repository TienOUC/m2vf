'use client';

import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { NodeResizeControl } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { NodeBase } from './NodeBase';
import ResizeIcon from './ResizeIcon';
import { getFontClass } from '@/lib/utils';
import { M2VFlowLexicalEditor } from './LexicalEditor';
import { EditorState, LexicalEditor, $getRoot } from 'lexical';
import { useClickOutside } from '@/hooks';

// 简化的颜色判断函数
function isNotWhiteColor(color: string): boolean {
  // 如果是白色、透明或浅色，则返回 false，否则返回 true
  return !(color === 'white' || color === 'transparent' || color === '#ffffff' || color === '#fff' || color === '#FFFFFF' || color === '#FFF');
}

export interface TextNodeData {
  label?: string;
  content?: string;
  backgroundColor?: string;
  fontType?: 'h1' | 'h2' | 'h3' | 'p';
  onTypeChange?: (nodeId: string, newType: 'text' | 'image' | 'video' | 'audio') => void;
  onDelete?: (nodeId: string) => void;
  onBackgroundColorChange?: (nodeId: string, color: string) => void;
  getContent?: (nodeId: string) => string;
  onContentChange?: (content: string) => void;
  onFontTypeChange?: (nodeId: string, fontType: 'h1' | 'h2' | 'h3' | 'p') => void;
  isEditing?: boolean;
}

function TextNode({ data, id, selected, ...rest }: NodeProps) {
  const nodeData = data as TextNodeData;
  const [content, setContent] = useState(nodeData?.content || '');
  const [isEditing, setIsEditing] = useState(nodeData?.isEditing || false);
  const lexicalEditorRef = useRef<LexicalEditor | null>(null);

  // 处理编辑器内容变化
  const handleEditorChange = useCallback(
    (editorState: EditorState, editor: LexicalEditor) => {
      // 保存编辑器引用
      lexicalEditorRef.current = editor;
      
      // 获取编辑器内容并更新状态
      editorState.read(() => {
        const root = $getRoot();
        const textContent = root.getTextContent();
        setContent(textContent);
        if (nodeData?.onContentChange) {
          nodeData.onContentChange(textContent);
        }
      });
    },
    [nodeData?.onContentChange]
  );

  // 确保编辑器的初始内容正确设置
  const editorInitialContent = content;

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
    if (isEditing) {
      setIsEditing(false);
    }
  });

  // 字体类型切换处理函数
  const handleFontTypeChange = useCallback((fontType: 'h1' | 'h2' | 'h3' | 'p') => {
    if (nodeData?.onFontTypeChange) {
      nodeData.onFontTypeChange(id, fontType);
    }
  }, [id, nodeData?.onFontTypeChange]);

  // 文本格式化处理函数 - 这些函数现在只是占位符，实际的格式化由Lexical编辑器内部处理
  const handleBoldToggle = useCallback(() => {
    // 这些功能由Lexical编辑器内部处理，通过Toolbar按钮实现
  }, []);

  const handleItalicToggle = useCallback(() => {
    // 这些功能由Lexical编辑器内部处理，通过Toolbar按钮实现
  }, []);

  const handleBulletListToggle = useCallback(() => {
    // 这些功能由Lexical编辑器内部处理，通过Toolbar按钮实现
  }, []);

  const handleNumberedListToggle = useCallback(() => {
    // 这些功能由Lexical编辑器内部处理，通过Toolbar按钮实现
  }, []);

  const handleHorizontalRuleInsert = useCallback(() => {
    // 这些功能由Lexical编辑器内部处理，通过Toolbar按钮实现
  }, []);

  return (
    <NodeBase 
      ref={nodeRef}
      data={{...data, isEditing}} 
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
          <div className={`w-full h-full ${fontClass} p-2 text-${isDarkBg ? 'white' : 'gray-700'} overflow-hidden`}>
            {content || '双击输入文本'}
          </div>
        )}
      </div>
    </NodeBase>
  );
}

export default memo(TextNode);