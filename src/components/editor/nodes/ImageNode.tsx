'use client';

import { NodeResizeControl } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Image as ImageIcon } from '@mui/icons-material';
import { NodeBase } from './NodeBase';
import { ResizeIcon } from '@/components/editor';
import { ScanningAnimation } from '@/components/editor/ScanningAnimation';
import Image from 'next/image';
import { ImageNodeData } from '@/lib/types/editor/image';
import { useImageNode } from '@/hooks/nodes/useImageNode';

function ImageNode({ data, id, selected }: NodeProps) {
  const nodeData = data as ImageNodeData;
  
  const {
    imageUrl,
    isLoading,
    isProcessing,
    processingProgress,
    error,
    fileInputRef,
    handleButtonClick,
    handleImageSelect,
    handleEditStart
  } = useImageNode({
    data: nodeData as ImageNodeData,
    id: id as string,
    selected: selected as boolean,
    onDelete: nodeData.onDelete,
    onReplace: nodeData.onReplace,
    onEditStart: nodeData.onEditStart,
    onCropStart: nodeData.onCropStart,
    onImageUpdate: nodeData.onImageUpdate,
    onDownload: nodeData.onDownload,
    onBackgroundRemove: nodeData.onBackgroundRemove
  });

  return (
    <NodeBase
      data={{ ...data, isLoading, isProcessing, processingProgress, error }}
      id={id}
      selected={selected}
      nodeType="image"
      onReplace={handleButtonClick}
      onEditStart={handleEditStart}
      onDownload={nodeData?.onDownload}
      onBackgroundRemove={nodeData?.onBackgroundRemove}
      hasImage={!!imageUrl}
    >
      {/* 首帧/尾帧标签 */}
      {nodeData.frameType && (
        <div className="absolute -top-4 left-0 text-gray-400 text-xs z-10">
          {nodeData.frameType === 'first' ? '首帧' : '尾帧'}
        </div>
      )}
      
      <div className="absolute inset-0 p-2">
        {/* 处理中状态：显示扫描动画 */}
        {isProcessing ? (
          <div className="h-full w-full relative">
            <ScanningAnimation 
              isActive={true}
              duration={1500}
              className="h-full w-full"
            />
          </div>
        ) : isLoading ? (
          <div className="h-full w-full relative flex items-center justify-center">
            {/* 加载状态指示器 */}
            <div className="w-12 h-12 border-4 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 bg-white bg-opacity-70 rounded-md"></div>
          </div>
        ) : imageUrl ? (
          <div className="h-full w-full relative">
            <Image
              src={imageUrl}
              alt="上传的图片"
              fill
              sizes='100%'
              className="object-contain rounded-md"
            />
            
            {/* 错误信息显示 */}
            {error && (
              <div className="absolute inset-0 bg-red-100 bg-opacity-80 rounded-md flex items-center justify-center p-4">
                <p className="text-red-800 text-sm text-center">{error}</p>
              </div>
            )}
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
