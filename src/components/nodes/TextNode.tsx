'use client';

import { memo, useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { TextFields, SwapHoriz, Close, Image as ImageIcon, VideoFile } from '@mui/icons-material';
import NodeToolbar from './NodeToolbar';

export interface TextNodeData {
  label?: string;
  content?: string;
  onTypeChange?: (nodeId: string, newType: 'text' | 'image' | 'video') => void;
  onDelete?: (nodeId: string) => void;
}

function TextNode({ data, id, selected }: NodeProps) {
  const nodeData = data as TextNodeData;
  const [content, setContent] = useState(nodeData?.content || '');
  const [isEditing, setIsEditing] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  }, []);

  const handleTypeChange = useCallback((newType: 'text' | 'image' | 'video') => {
    if (nodeData?.onTypeChange && id) {
      nodeData.onTypeChange(id, newType);
    }
    setShowTypeMenu(false);
  }, [nodeData, id]);

  const handleDelete = useCallback(() => {
    if (nodeData?.onDelete && id) {
      nodeData.onDelete(id);
    }
  }, [nodeData, id]);

  return (
    <div className="bg-white rounded-lg min-w-[200px] relative transition-colors duration-150 shadow-sm hover:shadow-md">
      {/* 输入连接点 */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-gray-400" />
      
      {/* 节点工具栏 */}
      <NodeToolbar
        nodeId={id}
        onTypeChange={nodeData?.onTypeChange}
        onDelete={nodeData?.onDelete}
        selected={selected}
        type="text"
      />
      
      {/* 节点头部 */}
      <div className="bg-gray-50 text-gray-800 px-3 py-2 rounded-t-md text-sm font-medium flex justify-between items-center">
        <span className="flex items-center gap-1">
          <TextFields fontSize="small" className="text-gray-500" />
          {nodeData?.label || '文本'}
        </span>
      </div>
      
      {/* 节点内容 */}
      <div className="p-3">
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
      
      {/* 输出连接点 */}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-gray-400" />
    </div>
  );
}

export default memo(TextNode);
