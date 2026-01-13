'use client';

import { memo, useEffect } from 'react';
import { NodeResizeControl } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { VideoFile } from '@mui/icons-material';
import { useFileUpload } from '@/hooks/utils/useFileUpload';
import { NodeBase } from './NodeBase';
import { ResizeIcon } from '@/components/editor';

export interface VideoNodeData {
  label?: string;
  videoUrl?: string;
  onDelete?: (nodeId: string) => void;
  onReplace?: (nodeId: string) => void;
}

function VideoNode({ data, id, selected, ...rest }: NodeProps) {
  const nodeData = data as VideoNodeData;

  // 使用公共 hook 处理文件上传
  const {
    fileInputRef,
    fileUrl: videoUrl,
    setFileUrl: setVideoUrl,
    handleFileSelect,
    handleButtonClick
  } = useFileUpload('video/');

  // 如果初始有视频 URL，使用它 - 修复为useEffect
  useEffect(() => {
    if (nodeData?.videoUrl && !videoUrl) {
      setVideoUrl(nodeData.videoUrl);
    }
  }, [nodeData?.videoUrl, videoUrl, setVideoUrl]);

  // 视频选择回调，更新 videoUrl
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e, (url) => {
      setVideoUrl(url);
    });
  };

  const controlStyle = {
    background: 'transparent',
    border: 'none'
  };

  return (
    <NodeBase
      data={data}
      id={id}
      selected={selected}
      icon={<VideoFile fontSize="small" className="text-gray-500" />}
      title="视频"
      nodeType="video"
      onReplace={handleButtonClick}
    >
      <NodeResizeControl className="group" style={controlStyle} minWidth={100} minHeight={50}>
        <ResizeIcon className="absolute right-0 bottom-0" />
      </NodeResizeControl>
      <div className="absolute inset-0 p-2">
        {videoUrl ? (
          <div className="h-full w-full">
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-contain rounded-md"
            >
              您的浏览器不支持视频播放
            </video>
          </div>
        ) : (
          <button
            onClick={handleButtonClick}
            className="w-full h-full border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center hover:border-gray-500 hover:bg-gray-50 transition-colors text-gray-500"
          >
            <VideoFile className="text-3xl mb-2" />
            <span className="text-xs">点击上传视频</span>
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
