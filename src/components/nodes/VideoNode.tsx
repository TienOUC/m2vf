'use client';

import { memo, useState, useCallback, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { VideoFile, SwapHoriz, Close, TextFields, Image as ImageIcon } from '@mui/icons-material';
import NodeToolbar from './NodeToolbar';

export interface VideoNodeData {
  label?: string;
  videoUrl?: string;
  onTypeChange?: (nodeId: string, newType: 'text' | 'image' | 'video') => void;
  onDelete?: (nodeId: string) => void;
}

function VideoNode({ data, id, selected }: NodeProps) {
  const nodeData = data as VideoNodeData;
  const [videoUrl, setVideoUrl] = useState(nodeData?.videoUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setVideoUrl(event.target?.result as string);
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
    <div className="bg-white rounded-lg min-w-[280px] relative transition-colors duration-150 shadow-sm hover:shadow-md">
      {/* 输入连接点 */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-gray-400" />
      
      {/* 节点工具栏 */}
      <NodeToolbar
        nodeId={id}
        onTypeChange={nodeData?.onTypeChange}
        onDelete={nodeData?.onDelete}
        selected={selected}
        type="video"
      />
      
      {/* 节点头部 */}
      <div className="bg-gray-50 text-gray-800 px-3 py-2 rounded-t-md text-sm font-medium flex justify-between items-center">
        <span className="flex items-center gap-1">
          <VideoFile fontSize="small" className="text-gray-500" />
          {nodeData?.label || '视频'}
        </span>
      </div>
      
      {/* 节点内容 */}
      <div className="p-3">
        {videoUrl ? (
          <div className="relative group">
            <video
              src={videoUrl}
              controls
              className="w-full h-auto max-h-[200px] rounded-md border border-gray-200 bg-gray-900"
            >
              您的浏览器不支持视频播放
            </video>
            <button
              onClick={handleButtonClick}
              className="mt-2 w-full px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
            >
              更换视频
            </button>
          </div>
        ) : (
          <button
            onClick={handleButtonClick}
            className="w-full h-[150px] border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors text-gray-500"
          >
            <VideoFile className="text-3xl mb-2" />
            <span className="text-sm">点击上传视频</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
      
      {/* 输出连接点 */}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-gray-400" />
    </div>
  );
}

export default memo(VideoNode);