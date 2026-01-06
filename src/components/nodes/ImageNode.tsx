'use client';

import { memo, useState } from 'react';
import { NodeResizeControl } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Image as ImageIcon } from '@mui/icons-material';
import { useFileUpload } from '../../hooks/useFileUpload';
import { NodeBase } from './NodeBase';
import ResizeIcon from './ResizeIcon';
import Image from 'next/image';
import FabricImageEditor from '../FabricImageEditor';

export interface ImageNodeData {
  label?: string;
  imageUrl?: string;
  onTypeChange?: (nodeId: string, newType: 'text' | 'image' | 'video') => void;
  onDelete?: (nodeId: string) => void;
  onReplace?: (nodeId: string) => void;
  onEditStart?: () => void;
}

function ImageNode({ data, id, selected }: NodeProps) {
  const nodeData = data as ImageNodeData;
  const [localImageUrl, setLocalImageUrl] = useState<string>(nodeData?.imageUrl || '');
  const [isCropping, setIsCropping] = useState<boolean>(false);
  
  // 使用公共 hook 处理文件上传
  const {
    fileInputRef,
    fileUrl,
    handleFileSelect,
    handleButtonClick
  } = useFileUpload('image/');

  // 图片选择回调，更新 imageUrl
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e, (url) => {
      setLocalImageUrl(url);
    });
  };

  // 打开裁剪编辑器
  const handleEditStart = () => {
    if (localImageUrl || fileUrl) {
      setIsCropping(true);
    }
  };

  // 裁剪完成回调
  const handleCropComplete = (croppedImageUrl: string) => {
    setLocalImageUrl(croppedImageUrl);
    setIsCropping(false);
  };

  // 取消裁剪
  const handleCropCancel = () => {
    setIsCropping(false);
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
      onEditStart={handleEditStart}
    >
      <div className="absolute inset-0 p-2">
        {localImageUrl || fileUrl ? (
          <div className="h-full w-full relative">
            <Image
              src={localImageUrl || fileUrl}
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
      
      {/* 裁剪编辑器 */}
      {isCropping && (
        <div className="absolute inset-0 z-50">
          <FabricImageEditor
            imageUrl={localImageUrl || fileUrl}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        </div>
      )}
      
      {/* 将 NodeResizeControl 放在最后，确保它在最上层 */}
      <NodeResizeControl className="group" style={controlStyle} minWidth={100} minHeight={50}>
        <ResizeIcon className="absolute right-0 bottom-0" />
      </NodeResizeControl>
    </NodeBase>
  );
}

export default memo(ImageNode);
