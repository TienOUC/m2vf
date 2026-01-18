'use client';

import { memo, useEffect, useRef } from 'react';
import { NodeResizeControl } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { VideoFile } from '@mui/icons-material';
import { useFileUpload } from '@/hooks/utils/useFileUpload';
import { NodeBase } from './NodeBase';
import { ResizeIcon } from '@/components/editor';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export interface VideoNodeData {
  label?: string;
  videoUrl?: string;
  onDelete?: (nodeId: string) => void;
  onReplace?: (nodeId: string) => void;
}

function VideoNode({ data, id, selected, ...rest }: NodeProps) {
  const nodeData = data as VideoNodeData;
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<videojs.Player | null>(null);

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

  // 初始化和更新 Video.js 播放器
  useEffect(() => {
    if (!videoRef.current || !videoUrl) {
      return;
    }

    // 销毁已存在的播放器
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    // 创建新的播放器
    playerRef.current = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      responsive: true,
      fluid: true,
      sources: [
        {
          src: videoUrl,
          type: 'video/mp4'
        }
      ]
    });

    // 组件卸载时销毁播放器
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoUrl]);

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
            <div ref={videoRef} className="video-js vjs-theme-sea vjs-big-play-centered w-full h-full rounded-md" />
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
