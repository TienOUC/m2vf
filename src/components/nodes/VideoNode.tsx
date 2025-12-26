'use client';

import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { VideoFile, SwapHoriz, Close, TextFields, Image as ImageIcon } from '@mui/icons-material';
import NodeToolbar from './NodeToolbar';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useNodeBase } from '../../hooks/useNodeBase';
import { NodeBase } from './NodeBase';

export interface VideoNodeData {
  label?: string;
  videoUrl?: string;
  onTypeChange?: (nodeId: string, newType: 'text' | 'image' | 'video') => void;
  onDelete?: (nodeId: string) => void;
}

function VideoNode({ data, id, selected, ...rest }: NodeProps) {
  const nodeData = data as VideoNodeData;
  
  // 使用公共 hook 处理基础节点逻辑
  const { handleTypeChange, handleDelete } = useNodeBase(data, id);
  
  // 使用公共 hook 处理文件上传
  const {
    fileInputRef,
    fileUrl: videoUrl,
    setFileUrl: setVideoUrl,
    handleFileSelect,
    handleButtonClick
  } = useFileUpload('video/');
  
  // 如果初始有视频 URL，使用它
  useState(() => {
    if (nodeData?.videoUrl && !videoUrl) {
      setVideoUrl(nodeData.videoUrl);
    }
  });
  
  // 视频选择回调，更新 videoUrl
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e, (url) => {
      setVideoUrl(url);
    });
  };

  return (
    <NodeBase
      data={data}
      id={id}
      selected={selected}
      icon={<VideoFile fontSize="small" className="text-gray-500" />}
      title="视频"
      nodeType="video"
      {...rest}
    >
      <div>
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
          onChange={handleVideoSelect}
          className="hidden"
        />
      </div>
    </NodeBase>
  );
}

export default memo(VideoNode);