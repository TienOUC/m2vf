'use client';

import { memo } from 'react';
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

  // 打开裁剪编辑器 - 先居中画布，再通知父组件打开裁剪编辑器
  const handleEditStart = (nodeId: string) => {
    // 1. 检测图片节点是否已包含有效图片资源
    const imageUrl = nodeData?.imageUrl;
    const hasImage = !!imageUrl;
    
    if (hasImage) {
      // 2. 响应裁剪按钮的点击事件 - 先调用画布居中逻辑
      if (nodeData?.onEditStart) {
        // 3-6. 画布居中逻辑在 page.tsx 的 onEditStart 中实现
        // 它会计算偏移量、平滑移动画布，确保节点精确居中
        nodeData.onEditStart(nodeId);
        
        // 7. 画布居中完成后，通知父组件打开裁剪编辑器
        // 使用 setTimeout 确保画布移动动画开始后再通知
        setTimeout(() => {
          // 通过回调通知父组件打开裁剪编辑器
          if (nodeData?.onCropStart && imageUrl) {
            nodeData.onCropStart(nodeId, imageUrl);
          }
        }, 100); // 延迟100ms，让画布移动动画开始
      } else {
        // 如果没有 onEditStart 回调，直接通知父组件打开裁剪编辑器
        if (nodeData?.onCropStart && imageUrl) {
          nodeData.onCropStart(nodeId, imageUrl);
        }
      }
    }
  };

  // 裁剪完成回调 - 现在由父组件处理
  // handleCropComplete 函数已移除，由父组件直接更新节点数据

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
        {nodeData?.imageUrl ? (
          <div className="h-full w-full relative">
            <Image
              src={nodeData.imageUrl}
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
      
      {/* 裁剪编辑器现在在 page.tsx 中作为 Overlay 渲染 */}
      
      {/* 将 NodeResizeControl 放在最后，确保它在最上层 */}
      <NodeResizeControl className="group" style={{ background: 'transparent', border: 'none' }} minWidth={100} minHeight={50}>
        <ResizeIcon className="absolute right-0 bottom-0" />
      </NodeResizeControl>
    </NodeBase>
  );
}

export default memo(ImageNode);
