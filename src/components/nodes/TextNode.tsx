'use client';

import { memo, useState, useCallback } from 'react';
import { NodeResizeControl } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { NodeBase } from './NodeBase';
import ResizeIcon from './ResizeIcon';

export interface TextNodeData {
  label?: string;
  content?: string;
  onTypeChange?: (nodeId: string, newType: 'text' | 'image' | 'video') => void;
  onDelete?: (nodeId: string) => void;
}

function TextNode({ data, id, selected, ...rest }: NodeProps) {
  const nodeData = data as TextNodeData;
  const [content, setContent] = useState(nodeData?.content || '');

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
    },
    []
  );

  const controlStyle = {
    background: 'transparent',
    border: 'none'
  };

  return (
    <NodeBase data={data} id={id} selected={selected} nodeType="text" {...rest}>
      <NodeResizeControl style={controlStyle} minWidth={100} minHeight={50}>
        <ResizeIcon className="absolute right-1 bottom-1" />
      </NodeResizeControl>
      <div className="absolute inset-0 p-2">
        <textarea
          value={content}
          onChange={handleChange}
          className="w-full h-full p-1 border border-gray-200 rounded-md focus:outline-none focus:ring-gray-200 focus:border-gray-300 resize-none text-xs transition-colors"
          placeholder="输入文本内容..."
        />
      </div>
    </NodeBase>
  );
}

export default memo(TextNode);
