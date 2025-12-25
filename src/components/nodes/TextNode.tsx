'use client';

import { memo, useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { TextFields, SwapHoriz, Close, Image as ImageIcon, VideoFile } from '@mui/icons-material';
import { Tooltip } from '@mui/material';

export interface TextNodeData {
  label?: string;
  content?: string;
  onTypeChange?: (nodeId: string, newType: 'text' | 'image' | 'video') => void;
  onDelete?: (nodeId: string) => void;
}

function TextNode({ data, id }: NodeProps) {
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
    <div className="bg-white border border-gray-200 rounded-lg min-w-[200px] relative transition-colors duration-150 hover:shadow-sm">
      {/* 输入连接点 */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-gray-400" />
      
      {/* 节点头部 */}
      <div className="bg-gray-50 text-gray-800 px-3 py-2 rounded-t-md text-sm font-medium flex justify-between items-center">
        <span className="flex items-center gap-1">
          <TextFields fontSize="small" className="text-gray-500" />
          {nodeData?.label || '文本'}
        </span>
        <div className="flex items-center gap-1">
          {/* 类型切换按钮 */}
          <Tooltip title="切换节点类型" arrow>
            <button
              onClick={() => setShowTypeMenu(!showTypeMenu)}
              className="w-7 h-7 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="切换节点类型"
            >
              <SwapHoriz fontSize="small" />
            </button>
          </Tooltip>
          
          {/* 类型选择菜单 */}
          {showTypeMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowTypeMenu(false)}
              />
              <div className="absolute right-0 top-8 bg-white rounded-md shadow-sm border border-gray-200 py-1 z-20 min-w-[120px] w-32">
                <button
                  onClick={() => handleTypeChange('image')}
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <ImageIcon fontSize="small" />
                  <span>图片</span>
                </button>
                <button
                  onClick={() => handleTypeChange('video')}
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <VideoFile fontSize="small" />
                  <span>视频</span>
                </button>
              </div>
            </>
          )}
          
          {/* 删除按钮 */}
          <Tooltip title="删除节点" arrow>
            <button
              onClick={handleDelete}
              className="w-7 h-7 p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              aria-label="删除节点"
            >
              <Close fontSize="small" />
            </button>
          </Tooltip>
        </div>
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
