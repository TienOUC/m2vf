'use client';

import { memo, useRef, useEffect} from 'react';
import { NodeResizeControl } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Video } from 'lucide-react';
import { NodeBase } from './NodeBase';
import { ResizeIcon } from '@/components/editor';
import { ScanningAnimation } from '@/components/editor/ScanningAnimation';
import { useVideoNodesStore, type VideoNodesState } from '@/lib/stores/videoNodesStore';
import type { VideoNodeData } from '@/lib/types/editor/video';

function VideoNode({ data, id, selected }: NodeProps) {
  const nodeData = data as VideoNodeData;
  
  // 从全局状态获取视频节点信息
  const videoNodeState = useVideoNodesStore((state: VideoNodesState) => state.getVideoNode(id));
  
  // 使用全局状态中的视频 URL 和加载状态
  const videoUrl = videoNodeState?.videoUrl;
  const isLoading = videoNodeState?.isLoading || false;
  const hasConnectedFrameNodes = videoNodeState?.hasConnectedFrameNodes || false;

  // 简化视频播放器逻辑，使用原生video元素代替复杂的videojs初始化
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // 当videoUrl变化时更新视频源
  useEffect(() => {
    // 确保容器存在
    if (!videoContainerRef.current) {
      return;
    }
    
    // 清除容器内容
    videoContainerRef.current.innerHTML = '';
    
    if (videoUrl) {
      // 创建新的video元素
      const newVideoElement = document.createElement('video');
      newVideoElement.className = 'w-full h-full object-cover rounded-md';
      newVideoElement.controls = true;
      newVideoElement.src = videoUrl;
      
      // 添加到容器
      videoContainerRef.current.appendChild(newVideoElement);
      
      // 尝试加载视频
      newVideoElement.load();
    }
  }, [videoUrl]);

  // 处理首尾帧生成视频点击事件
  const handleFirstLastFrameGenerate = () => {
    console.log('VideoNode按钮点击事件触发，节点ID:', id);
    console.log('onFirstLastFrameGenerate回调存在:', !!nodeData.onFirstLastFrameGenerate);
    if (nodeData.onFirstLastFrameGenerate) {
      console.log('调用onFirstLastFrameGenerate回调');
      nodeData.onFirstLastFrameGenerate(id);
    }
  };

  // 处理首帧生成视频点击事件
  const handleFirstFrameGenerate = () => {
    console.log('VideoNode首帧生成视频按钮点击事件触发，节点ID:', id);
    console.log('onFirstFrameGenerate回调存在:', !!nodeData.onFirstFrameGenerate);
    if (nodeData.onFirstFrameGenerate) {
      console.log('调用onFirstFrameGenerate回调');
      nodeData.onFirstFrameGenerate(id);
    }
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
      icon={<Video size={16} className="text-gray-500" />}
      title="视频"
      nodeType="video"
    >
      <NodeResizeControl className="group group-selected" style={controlStyle} minWidth={100} minHeight={75}>
        <ResizeIcon className="absolute right-[-10px] bottom-[-10px]" />
      </NodeResizeControl>
      <div className="absolute inset-0">
        {/* 视频容器 */}
        <div ref={videoContainerRef} className="w-full h-full rounded-md" />
        
        {/* 当没有视频URL时，显示loading或生成选项 */}
        {!videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* 显示loading状态 */}
            {isLoading ? (
              <div className="w-full h-full">
                <ScanningAnimation isActive={true} duration={1500} />
              </div>
            ) : (
              // 只有当没有连接的帧节点时，才显示生成选项
              !hasConnectedFrameNodes && (
                <div className="w-full h-full flex flex-col items-start justify-center gap-2 p-4">
                  <button
                    onClick={handleFirstLastFrameGenerate}
                    className="px-3 py-1 text-xs text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    首尾帧生成视频
                  </button>
                  <button
                    onClick={handleFirstFrameGenerate}
                    className="px-3 py-1 text-xs text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    首帧生成视频
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </NodeBase>
  );
}

export default memo(VideoNode);
