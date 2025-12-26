'use client';

import { memo, useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { TextFields, SwapHoriz, Close, Image as ImageIcon, VideoFile } from '@mui/icons-material';
import NodeToolbar from './NodeToolbar';
import { useNodeBase } from '../../hooks/useNodeBase';
import { NodeBase } from './NodeBase';

export interface TextNodeData {
  label?: string;
  content?: string;
  onTypeChange?: (nodeId: string, newType: 'text' | 'image' | 'video') => void;
  onDelete?: (nodeId: string) => void;
}

function TextNode({ data, id, selected, ...rest }: NodeProps) {
  const nodeData = data as TextNodeData;
  const [content, setContent] = useState(nodeData?.content || '');
  const [isEditing, setIsEditing] = useState(false);
  
  // 使用公共 hook 处理基础节点逻辑
  const { handleTypeChange, handleDelete } = useNodeBase(data, id);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  }, []);

  return (
    <NodeBase
      data={data}
      id={id}
      selected={selected}
      icon={<TextFields fontSize="small" className="text-gray-500" />}
      title="文本"
      nodeType="text"
      {...rest}
    >
      <div>
        {isEditing ? (
          <textarea
            value={content}
            onChange={handleChange}
            onBlur={handleBlur}
            autoFocus
            className="w-full min-h-[80px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 resize-none text-sm transition-colors"
            placeholder="输入文本内容..."
          />
        ) : (
          <div
            onDoubleClick={handleDoubleClick}
            className="min-h-[80px] p-2 text-sm text-gray-700 whitespace-pre-wrap cursor-text hover:bg-gray-50 rounded-md transition-colors"
          >
            {content || '双击编辑文本...'}
          </div>
        )}
      </div>
    </NodeBase>
  );
}

export default memo(TextNode);
