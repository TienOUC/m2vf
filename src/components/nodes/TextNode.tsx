'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import { NodeResizeControl } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { NodeBase } from './NodeBase';
import ResizeIcon from './ResizeIcon';

// 简化的颜色判断函数
function isNotWhiteColor(color: string): boolean {
  // 如果是白色、透明或浅色，则返回 false，否则返回 true
  return !(color === 'white' || color === 'transparent' || color === '#ffffff' || color === '#fff' || color === '#FFFFFF' || color === '#FFF');
}

export interface TextNodeData {
  label?: string;
  content?: string;
  backgroundColor?: string;
  onTypeChange?: (nodeId: string, newType: 'text' | 'image' | 'video' | 'audio') => void;
  onDelete?: (nodeId: string) => void;
  onBackgroundColorChange?: (nodeId: string, color: string) => void;
  getContent?: (nodeId: string) => string;
  onContentChange?: (content: string) => void;
}

function TextNode({ data, id, selected, ...rest }: NodeProps) {
  const nodeData = data as TextNodeData;
  const [content, setContent] = useState(nodeData?.content || '');

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setContent(newContent);
      if (nodeData?.onContentChange) {
        nodeData.onContentChange(newContent);
      }
    },
    [setContent, nodeData?.onContentChange]
  );

  // 暴露获取内容的函数到父组件
  useEffect(() => {
    if (nodeData?.getContent) {
      // 这里需要在全局或React Flow上下文中注册获取内容的函数
      // 但当前实现方式可能需要修改架构
      // 暂时将内容更新到data中
      const updateContent = () => {
        // 我们需要一种方式将内容变化传递给NodeToolbar
      };
      updateContent();
    }
  }, [content, nodeData]);

  const controlStyle = {
    background: 'transparent',
    border: 'none'
  };

  // 判断背景色是否非白色，决定文字颜色
  const isDarkBg = isNotWhiteColor(nodeData?.backgroundColor || 'white');

  return (
    <NodeBase 
      data={data} 
      id={id} 
      selected={selected} 
      nodeType="text"
      onBackgroundColorChange={nodeData?.onBackgroundColorChange}
      backgroundColor={nodeData?.backgroundColor}
      {...rest}
    >
      <NodeResizeControl style={controlStyle} minWidth={100} minHeight={50}>
        <ResizeIcon className="absolute right-1 bottom-1" />
      </NodeResizeControl>
      <div className="absolute inset-0 p-2">
        <textarea
          value={content}
          onChange={handleChange}
          className={`w-full h-full p-1 focus:outline-none focus:ring-0 resize-none text-xs transition-colors bg-transparent ${isDarkBg ? 'text-white' : 'text-gray-700'}`}
          placeholder="输入文本内容..."
        />
      </div>
    </NodeBase>
  );
}

export default memo(TextNode);
