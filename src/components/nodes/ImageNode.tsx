'use client';

import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Image as ImageIcon, SwapHoriz, Close, TextFields, VideoFile } from '@mui/icons-material';
import NodeToolbar from './NodeToolbar';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useNodeBase } from '../../hooks/useNodeBase';
import { NodeBase } from './NodeBase';

export interface ImageNodeData {
  label?: string;
  imageUrl?: string;
  onTypeChange?: (nodeId: string, newType: 'text' | 'image' | 'video') => void;
  onDelete?: (nodeId: string) => void;
}

function ImageNode({ data, id, selected, ...rest }: NodeProps) {
  const nodeData = data as ImageNodeData;
  
  // 使用公共 hook 处理基础节点逻辑
  const { handleTypeChange, handleDelete } = useNodeBase(data, id);
  
  // 使用公共 hook 处理文件上传
  const {
    fileInputRef,
    fileUrl: imageUrl,
    setFileUrl: setImageUrl,
    handleFileSelect,
    handleButtonClick
  } = useFileUpload('image/');
  
  // 如果初始有图片 URL，使用它
  useState(() => {
    if (nodeData?.imageUrl && !imageUrl) {
      setImageUrl(nodeData.imageUrl);
    }
  });
  
  // 图片选择回调，更新 imageUrl
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e, (url) => {
      setImageUrl(url);
    });
  };

  return (
    <NodeBase
      data={data}
      id={id}
      selected={selected}
      icon={<ImageIcon fontSize="small" className="text-gray-500" />}
      title="图片"
      nodeType="image"
      {...rest}
    >
      <div>
        {imageUrl ? (
          <div className="relative group">
            <img
              src={imageUrl}
              alt="上传的图片"
              className="w-full h-auto max-h-[200px] object-contain rounded-md border border-gray-200"
            />
            <button
              onClick={handleButtonClick}
              className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md text-sm"
            >
              更换图片
            </button>
          </div>
        ) : (
          <button
            onClick={handleButtonClick}
            className="w-full h-[150px] border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors text-gray-500"
          >
            <ImageIcon className="text-3xl mb-2" />
            <span className="text-sm">点击上传图片</span>
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
