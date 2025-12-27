'use client';

import { memo, useEffect } from 'react';
import { NodeResizeControl } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Audiotrack } from '@mui/icons-material';
import { useFileUpload } from '../../hooks/useFileUpload';
import { NodeBase } from './NodeBase';
import ResizeIcon from './ResizeIcon';

export interface AudioNodeData {
  label?: string;
  audioUrl?: string;
  onTypeChange?: (
    nodeId: string,
    newType: 'text' | 'image' | 'video' | 'audio'
  ) => void;
  onDelete?: (nodeId: string) => void;
  onReplace?: (nodeId: string) => void;
}

function AudioNode({ data, id, selected, ...rest }: NodeProps) {
  const nodeData = data as AudioNodeData;

  // 使用公共 hook 处理文件上传
  const {
    fileInputRef,
    fileUrl: audioUrl,
    setFileUrl: setAudioUrl,
    handleFileSelect,
    handleButtonClick
  } = useFileUpload('audio/');

  // 如果初始有音频 URL，使用它 - 修复为useEffect
  useEffect(() => {
    if (nodeData?.audioUrl && !audioUrl) {
      setAudioUrl(nodeData.audioUrl);
    }
  }, [nodeData?.audioUrl, audioUrl, setAudioUrl]);

  // 音频选择回调，更新 audioUrl
  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e, (url) => {
      setAudioUrl(url);
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
      icon={<Audiotrack fontSize="small" className="text-gray-500" />}
      title="音频"
      nodeType="audio"
      onReplace={handleButtonClick}
      {...rest}
    >
      <NodeResizeControl style={controlStyle} minWidth={100} minHeight={50}>
        <ResizeIcon className="absolute right-1 bottom-1" />
      </NodeResizeControl>
      <div className="absolute inset-0 p-2">
        {audioUrl ? (
          <div className="h-full w-full">
            <audio src={audioUrl} controls className="w-full h-full p-2">
              您的浏览器不支持音频播放
            </audio>
          </div>
        ) : (
          <button
            onClick={handleButtonClick}
            className="w-full h-full border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center hover:border-gray-500 hover:bg-gray-50 transition-colors text-gray-500"
          >
            <Audiotrack className="text-3xl mb-2" />
            <span className="text-sm">点击上传音频</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleAudioSelect}
          className="hidden"
        />
      </div>
    </NodeBase>
  );
}

export default memo(AudioNode);
