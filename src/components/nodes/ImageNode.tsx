'use client';

import { memo, useEffect, useState } from 'react';
import { NodeResizeControl } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Image as ImageIcon } from '@mui/icons-material';
import { useFileUpload } from '../../hooks/useFileUpload';
import { NodeBase } from './NodeBase';
import ResizeIcon from './ResizeIcon';
import Image from 'next/image';
import CustomImageEditor from '../CustomImageEditor';

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

  // 编辑状态管理
  const [isEditing, setIsEditing] = useState(false);
  
  // 裁剪状态管理
  const [isCropping, setIsCropping] = useState(false);
  const [cropData, setCropData] = useState({
    imageWidth: 0,
    imageHeight: 0,
    imageX: 0,
    imageY: 0,
    cropX: 0,
    cropY: 0,
    cropWidth: 0,
    cropHeight: 0,
    naturalWidth: 0,
    naturalHeight: 0
  });
  const [selectedRatio, setSelectedRatio] = useState<string | null>(null);
  const [ratioMenuOpen, setRatioMenuOpen] = useState(false);
  
  const ratios = [
    { label: '自由', value: null },
    { label: '1:1', value: '1:1' },
    { label: '4:3', value: '4:3' },
    { label: '3:4', value: '3:4' },
    { label: '16:9', value: '16:9' },
    { label: '9:16', value: '9:16' }
  ];

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

  // 打开编辑器
  const handleEditStart = () => {
    setIsEditing(true);
  };

  // 保存编辑结果
  const handleEditSave = (result: string) => {
    setImageUrl(result);
    setIsEditing(false);
  };

  // 取消编辑
  const handleEditCancel = () => {
    setIsEditing(false);
  };
  
  // 打开裁剪模式
  const handleCropStart = () => {
    if (!imageUrl) return;
    
    // 获取页面可视区域大小
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 计算放大后图片的尺寸（占可视区域的80%）
    const imageWidth = viewportWidth * 0.8;
    const imageHeight = viewportHeight * 0.8;
    
    // 计算图片位置（居中显示）
    const imageX = (viewportWidth - imageWidth) / 2;
    const imageY = (viewportHeight - imageHeight) / 2;
    
    // 计算裁剪框初始大小（占放大后图片的80%）
    const cropWidth = imageWidth * 0.8;
    const cropHeight = imageHeight * 0.8;
    
    // 计算裁剪框初始位置（居中显示）
    const cropX = imageX + (imageWidth - cropWidth) / 2;
    const cropY = imageY + (imageHeight - cropHeight) / 2;
    
    // 获取图片原始尺寸
    const img = new window.Image();
    img.onload = () => {
      setCropData({
        imageWidth,
        imageHeight,
        imageX,
        imageY,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      });
      setIsCropping(true);
    };
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
  };
  
  // 取消裁剪
  const handleCropCancel = () => {
    setIsCropping(false);
    setSelectedRatio(null);
    setRatioMenuOpen(false);
  };
  
  // 确认裁剪
  const handleCropConfirm = () => {
    if (!imageUrl) return;
    
    const { 
      imageWidth, imageHeight, imageX, imageY, 
      cropX, cropY, cropWidth, cropHeight,
      naturalWidth, naturalHeight 
    } = cropData;
    
    // 计算裁剪区域在原始图片上的位置和大小
    const scaleX = naturalWidth / imageWidth;
    const scaleY = naturalHeight / imageHeight;
    
    const sx = (cropX - imageX) * scaleX;
    const sy = (cropY - imageY) * scaleY;
    const sw = cropWidth * scaleX;
    const sh = cropHeight * scaleY;
    
    // 创建Canvas进行裁剪
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, sw);
    canvas.height = Math.max(1, sh);
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const img = new window.Image();
      img.onload = () => {
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setImageUrl(url);
          }
          handleCropCancel();
        }, 'image/png');
      };
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
    } else {
      handleCropCancel();
    }
  };
  
  // 选择宽高比
  const handleRatioSelect = (ratio: string | null) => {
    setSelectedRatio(ratio);
    setRatioMenuOpen(false);
    
    if (ratio && cropData.imageWidth > 0 && cropData.imageHeight > 0) {
      const { imageWidth, imageHeight, cropWidth, cropX, cropY } = cropData;
      const [width, height] = ratio.split(':').map(Number);
      const aspectRatio = width / height;
      
      // 根据宽高比调整裁剪框大小
      let newCropWidth = cropWidth;
      let newCropHeight = newCropWidth / aspectRatio;
      
      // 确保裁剪框不超出图片边界
      if (newCropHeight > imageHeight) {
        newCropHeight = imageHeight;
        newCropWidth = newCropHeight * aspectRatio;
      }
      
      // 调整裁剪框位置，保持中心不变
      const newCropX = cropX + (cropWidth - newCropWidth) / 2;
      const newCropY = cropY + (cropData.cropHeight - newCropHeight) / 2;
      
      setCropData(prev => ({
        ...prev,
        cropX: Math.max(prev.imageX, Math.min(newCropX, prev.imageX + prev.imageWidth - newCropWidth)),
        cropY: Math.max(prev.imageY, Math.min(newCropY, prev.imageY + prev.imageHeight - newCropHeight)),
        cropWidth: newCropWidth,
        cropHeight: newCropHeight
      }));
    }
  };
  
  // 裁剪框拖拽和调整
  const handleCropMouseDown = (e: React.MouseEvent, type: 'move' | 'resize' | string) => {
    e.preventDefault();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startCropX = cropData.cropX;
    const startCropY = cropData.cropY;
    const startCropWidth = cropData.cropWidth;
    const startCropHeight = cropData.cropHeight;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      if (type === 'move') {
        // 拖拽整个裁剪框
        const newCropX = startCropX + dx;
        const newCropY = startCropY + dy;
        
        setCropData(prev => ({
          ...prev,
          cropX: Math.max(prev.imageX, Math.min(newCropX, prev.imageX + prev.imageWidth - prev.cropWidth)),
          cropY: Math.max(prev.imageY, Math.min(newCropY, prev.imageY + prev.imageHeight - prev.cropHeight))
        }));
      } else {
        // 调整裁剪框大小
        let newCropX = startCropX;
        let newCropY = startCropY;
        let newCropWidth = startCropWidth;
        let newCropHeight = startCropHeight;
        
        if (type.includes('n')) newCropHeight -= dy;
        if (type.includes('s')) newCropHeight += dy;
        if (type.includes('w')) newCropWidth -= dx;
        if (type.includes('e')) newCropWidth += dx;
        
        if (type.includes('n')) newCropY = startCropY + dy;
        if (type.includes('w')) newCropX = startCropX + dx;
        
        // 确保裁剪框大小不小于最小值
        const minSize = 50;
        newCropWidth = Math.max(minSize, newCropWidth);
        newCropHeight = Math.max(minSize, newCropHeight);
        
        // 应用宽高比
        if (selectedRatio) {
          const [width, height] = selectedRatio.split(':').map(Number);
          const aspectRatio = width / height;
          
          if (type.includes('n') || type.includes('s')) {
            // 垂直方向调整，保持宽高比
            newCropWidth = newCropHeight * aspectRatio;
          } else {
            // 水平方向调整，保持宽高比
            newCropHeight = newCropWidth / aspectRatio;
          }
        }
        
        // 确保裁剪框不超出图片边界
        newCropX = Math.max(cropData.imageX, newCropX);
        newCropY = Math.max(cropData.imageY, newCropY);
        newCropWidth = Math.min(newCropWidth, cropData.imageWidth - (newCropX - cropData.imageX));
        newCropHeight = Math.min(newCropHeight, cropData.imageHeight - (newCropY - cropData.imageY));
        
        setCropData(prev => ({
          ...prev,
          cropX: newCropX,
          cropY: newCropY,
          cropWidth: newCropWidth,
          cropHeight: newCropHeight
        }));
      }
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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
      onCropStart={handleCropStart}
    >
      <NodeResizeControl className="group" style={controlStyle} minWidth={100} minHeight={50}>
        <ResizeIcon className="absolute right-0 bottom-0" />
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
            
            {/* 图片编辑器 */}
            {isEditing && (
              <div className="absolute inset-0 z-30">
                <CustomImageEditor
                  imageUrl={imageUrl}
                  onSave={handleEditSave}
                  onCancel={handleEditCancel}
                />
              </div>
            )}
            
            {/* 裁剪模式 */}
            {isCropping && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
                {/* 放大显示的图片 */}
                <div 
                  className="relative" 
                  style={{
                    position: 'absolute',
                    left: cropData.imageX,
                    top: cropData.imageY,
                    width: cropData.imageWidth,
                    height: cropData.imageHeight
                  }}
                >
                  <Image
                    src={imageUrl}
                    alt="裁剪图片"
                    width={cropData.imageWidth}
                    height={cropData.imageHeight}
                    className="object-contain"
                  />
                  
                  {/* 裁剪框 */}
                  <div
                    className="absolute border-2 border-green-400 bg-transparent cursor-move"
                    style={{
                      left: cropData.cropX - cropData.imageX,
                      top: cropData.cropY - cropData.imageY,
                      width: cropData.cropWidth,
                      height: cropData.cropHeight
                    }}
                    onMouseDown={(e) => handleCropMouseDown(e, 'move')}
                  >
                    {/* 裁剪框调整手柄 */}
                    {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((handle) => (
                      <div
                        key={handle}
                        className="absolute w-3 h-3 bg-white border-2 border-green-400"
                        style={{
                          left: handle.includes('w') ? -6 : handle.includes('e') ? 'calc(100% - 6px)' : 'calc(50% - 6px)',
                          top: handle.includes('n') ? -6 : handle.includes('s') ? 'calc(100% - 6px)' : 'calc(50% - 6px)',
                          cursor: `${handle.includes('n') || handle.includes('s') ? 'ns' : ''}${handle.includes('w') || handle.includes('e') ? 'ew' : ''}-resize`
                        }}
                        onMouseDown={(e) => handleCropMouseDown(e, handle)}
                      />
                    ))}
                  </div>
                </div>
                
                {/* 底部功能按钮 */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-60">
                  <button
                    onClick={handleCropCancel}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    取消
                  </button>
                  
                  {/* 宽高比选择按钮 */}
                  <div className="relative">
                    <button
                      onClick={() => setRatioMenuOpen(!ratioMenuOpen)}
                      className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      {selectedRatio || '自由'} 宽高比
                    </button>
                    
                    {/* 宽高比下拉菜单 */}
                    {ratioMenuOpen && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white rounded-md shadow-lg z-70 min-w-[120px]">
                        {ratios.map((ratio) => (
                          <button
                            key={ratio.value || 'free'}
                            onClick={() => handleRatioSelect(ratio.value)}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedRatio === ratio.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                          >
                            {ratio.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={handleCropConfirm}
                    className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    确认裁剪
                  </button>
                </div>
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
    </NodeBase>
  );
}

export default memo(ImageNode);
