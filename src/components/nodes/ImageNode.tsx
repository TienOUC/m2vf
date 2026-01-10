'use client';

import { NodeResizeControl } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Image as ImageIcon } from '@mui/icons-material';
import { useFileUpload } from '@/hooks/useFileUpload';
import { NodeBase } from './NodeBase';
import ResizeIcon from './ResizeIcon';
import Image from 'next/image';
import { useState } from 'react';

export interface ImageNodeData {
  label?: string;
  imageUrl?: string;
  onTypeChange?: (nodeId: string, newType: 'text' | 'image' | 'video') => void;
  onDelete?: (nodeId: string) => void;
  onReplace?: (nodeId: string) => void;
  onEditStart?: (nodeId: string) => void;
  onCropStart?: (nodeId: string, imageUrl: string) => void;
  onImageUpdate?: (nodeId: string, imageUrl: string) => void;
}

function ImageNode({ data, id, selected }: NodeProps) {
  const nodeData = data as ImageNodeData;
  
  // 使用公共 hook 处理文件上传
  const {
    fileInputRef,
    handleFileSelect,
    handleButtonClick
  } = useFileUpload('image/', nodeData?.imageUrl);

  // 图片选择回调，更新 imageUrl
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e, (url) => {
      // 更新节点数据中的imageUrl，确保图片URL被保存
      if (nodeData?.onImageUpdate) {
        nodeData.onImageUpdate(id, url);
      }
    });
  };

  // 裁剪状态管理
  const [isCropping, setIsCropping] = useState(false);

  // 打开裁剪编辑器 - 异步居中画布，再通知父组件打开裁剪编辑器
  const handleEditStart = async (nodeId: string) => {
    // 1. 检测图片节点是否已包含有效图片资源
    const imageUrl = nodeData?.imageUrl;
    const hasImage = !!imageUrl;
    
    if (!hasImage) {
      console.warn('图片节点没有有效的图片资源，无法进行裁剪');
      return;
    }

    if (isCropping) {
      console.warn('裁剪操作正在进行中，请等待完成');
      return;
    }

    setIsCropping(true);
    
    try {
      // 2. 响应裁剪按钮的点击事件 - 先调用画布居中逻辑
      if (nodeData?.onEditStart) {
        // 调用 onEditStart 进行画布居中
        nodeData.onEditStart(nodeId);
        
        // 等待600ms确保画布居中动画完成
        await new Promise(resolve => setTimeout(resolve, 600));
      }
      
      // 3. 居中完成后，通知父组件打开裁剪编辑器
      if (nodeData?.onCropStart && imageUrl) {
        nodeData.onCropStart(nodeId, imageUrl);
      }
    } catch (error) {
      console.error('裁剪流程执行失败:', error);
      // 即使出错也尝试打开裁剪编辑器
      if (nodeData?.onCropStart && imageUrl) {
        nodeData.onCropStart(nodeId, imageUrl);
      }
    } finally {
      setIsCropping(false);
    }
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
        {nodeData?.imageUrl ? (
          <div className="h-full w-full relative">
            <Image
              src={nodeData.imageUrl}
              alt="上传的图片"
              fill
              sizes='100%'
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
      
      <NodeResizeControl className="group" style={{ background: 'transparent', border: 'none' }} minWidth={100} minHeight={50}>
        <ResizeIcon className="absolute right-0 bottom-0" />
      </NodeResizeControl>
    </NodeBase>
  );
}

export default ImageNode;
