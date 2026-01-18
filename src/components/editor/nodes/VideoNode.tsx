'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { NodeResizeControl } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { VideoFile } from '@mui/icons-material';
import { NodeBase } from './NodeBase';
import { ResizeIcon } from '@/components/editor';
import { ScanningAnimation } from '@/components/editor/ScanningAnimation';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export interface VideoNodeData {
  label?: string;
  videoUrl?: string;
  onDelete?: (nodeId: string) => void;
  isLoading?: boolean;
  onGenerateVideo?: (nodeId: string, prompt: string, config: any) => void;
}

function VideoNode({ data, id, selected }: NodeProps) {
  const nodeData = data as VideoNodeData;
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoUrl = nodeData.videoUrl;

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

    // 确定视频类型
    let videoType = 'video/mp4';
    // 如果是Data URL，尝试从URL中提取类型
    if (videoUrl.startsWith('data:')) {
      const typeMatch = videoUrl.match(/data:(video\/[^;]+);/);
      if (typeMatch && typeMatch[1]) {
        videoType = typeMatch[1];
      }
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
          type: videoType
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

  // 处理首尾帧生成视频点击事件
  const handleFirstLastFrameGenerate = () => {
    console.log('首尾帧生成视频');
  };

  // 处理首帧生成视频点击事件
  const handleFirstFrameGenerate = () => {
    console.log('首帧生成视频');
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
          <>
            {/* 显示loading状态或生成选项 */}
            {isLoading || nodeData.isLoading ? (
              <div className="w-full h-full">
                <ScanningAnimation isActive={true} duration={1500} />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-start justify-center gap-2 p-4">
                <button
                  onClick={handleFirstLastFrameGenerate}
                  className="px-3 py-1 text-xs text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                >
                  首尾帧生成视频
                </button>
                <button
                  onClick={handleFirstFrameGenerate}
                  className="px-3 py-1 text-xs text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                >
                  首帧生成视频
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </NodeBase>
  );
}

export default memo(VideoNode);
