'use client';

import { memo, useState, useCallback, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Image as ImageIcon, SwapHoriz, Close, TextFields, VideoFile } from '@mui/icons-material';
import { Tooltip } from '@mui/material';

export interface ImageNodeData {
  label?: string;
  imageUrl?: string;
  onTypeChange?: (nodeId: string, newType: 'text' | 'image' | 'video') => void;
  onDelete?: (nodeId: string) => void;
}

function ImageNode({ data, id }: NodeProps) {
  const nodeData = data as ImageNodeData;
  const [imageUrl, setImageUrl] = useState(nodeData?.imageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
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
    <div className="bg-white rounded-lg shadow-md border-2 border-green-400 min-w-[250px] relative">
      {/* 输入连接点 */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-green-500" />
      
      {/* 节点头部 */}
      <div className="bg-green-500 text-white px-3 py-2 rounded-t-md text-sm font-medium flex justify-between items-center">
        <span className="flex items-center gap-1">
          <ImageIcon fontSize="small" />
          {nodeData?.label || '图片'}
        </span>
        <div className="flex items-center gap-1">
          {/* 类型切换按钮 */}
          <div className="relative">
            <Tooltip title="切换节点类型" arrow>
              <button
                onClick={() => setShowTypeMenu(!showTypeMenu)}
                className="w-6 h-6 bg-white/20 hover:bg-white/30 rounded flex items-center justify-center transition"
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
                <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[100px]">
                  <button
                    onClick={() => handleTypeChange('text')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                  >
                    <TextFields fontSize="small" />
                    <span>文本</span>
                  </button>
                  <button
                    onClick={() => handleTypeChange('video')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2"
                  >
                    <VideoFile fontSize="small" />
                    <span>视频</span>
                  </button>
                </div>
              </>
            )}
          </div>
          {/* 删除按钮 */}
            <Tooltip title="删除节点" arrow>
              <button
                onClick={handleDelete}
                className="w-6 h-6 bg-white/20 hover:bg-red-500 rounded flex items-center justify-center transition"
                aria-label="删除节点"
              >
                <Close fontSize="small" />
              </button>
            </Tooltip>
        </div>
      </div>
      
      {/* 节点内容 */}
      <div className="p-3">
        {imageUrl ? (
          <div className="relative group">
            <img
              src={imageUrl}
              alt="上传的图片"
              className="w-full h-auto max-h-[200px] object-contain rounded"
            />
            <button
              onClick={handleButtonClick}
              className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded text-sm"
            >
              更换图片
            </button>
          </div>
        ) : (
          <button
            onClick={handleButtonClick}
            className="w-full h-[150px] border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center hover:border-green-400 hover:bg-green-50 transition text-gray-500 hover:text-green-600"
          >
            <span className="text-3xl mb-2">📷</span>
            <span className="text-sm">点击上传图片</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
      
      {/* 输出连接点 */}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-green-500" />
    </div>
  );
}

export default memo(ImageNode);
