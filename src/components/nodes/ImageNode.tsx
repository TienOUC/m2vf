'use client';

import { memo, useEffect } from 'react';
import { NodeResizeControl } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Image as ImageIcon } from '@mui/icons-material';
import { useFileUpload } from '../../hooks/useFileUpload';
import { NodeBase } from './NodeBase';
import ResizeIcon from './ResizeIcon';
import Image from 'next/image';

export interface ImageNodeData {
  label?: string;
  imageUrl?: string;
  onTypeChange?: (nodeId: string, newType: 'text' | 'image' | 'video') => void;
  onDelete?: (nodeId: string) => void;
  onReplace?: (nodeId: string) => void;
}

function ImageNode({ data, id, selected, ...rest }: NodeProps) {
  const nodeData = data as ImageNodeData;

  // 使用公共 hook 处理文件上传
  const {
    fileInputRef,
    fileUrl: imageUrl,
    setFileUrl: setImageUrl,
    handleFileSelect,
    handleButtonClick
  } = useFileUpload('image/');

  // 如果初始有图片 URL，使用它 - 修复为useEffect
  useEffect(() => {
    if (nodeData?.imageUrl && !imageUrl) {
      setImageUrl(nodeData.imageUrl);
    }
  }, [nodeData?.imageUrl, imageUrl, setImageUrl]);

  // 图片选择回调，更新 imageUrl
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e, (url) => {
      setImageUrl(url);
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
      nodeType="image"
      onReplace={handleButtonClick}
    >
      <NodeResizeControl className="group" style={controlStyle} minWidth={100} minHeight={50}>
        <ResizeIcon className="absolute right-1 bottom-1" />
      </NodeResizeControl>
      <div className="absolute inset-0 p-2">
        {imageUrl ? (
          <div className="h-full w-full relative">
            {' '}
            {/* 添加 relative */}
            <Image
              src={imageUrl}
              alt="上传的图片"
              fill
              className="object-contain rounded-md"
            />
          </div>
        ) : (
          <button
            onClick={handleButtonClick}
            className="w-full h-full border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center hover:border-gray-500 hover:bg-gray-50 transition-colors text-gray-500"
          >
            <ImageIcon className="text-3xl mb-2" />
            <span className="text-xs">点击上传图片</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>
    </NodeBase>
  );
}

export default memo(ImageNode);
