import { useCallback, useEffect } from 'react';
import { ImageNodeData } from '@/lib/types/editor/image';
import { useImageNodesStore } from '@/lib/stores/imageNodesStore';
import { useFileUpload } from '../utils/useFileUpload';

interface UseImageNodeProps {
  data: ImageNodeData;
  id: string;
  selected: boolean;
  onDelete?: (nodeId: string) => void;
  onReplace?: (nodeId: string) => void;
  onEditStart?: (nodeId: string) => void;
  onCropStart?: (nodeId: string, imageUrl: string) => void;
  onEraseStart?: (nodeId: string, imageUrl: string) => void;
  onImageUpdate?: (nodeId: string, imageUrl: string) => void;
  onDownload?: (nodeId: string) => void;
  onBackgroundRemove?: (nodeId: string) => void;
}

export const useImageNode = ({ 
  data, 
  id, 
  onDelete, 
  onReplace, 
  onEditStart, 
  onCropStart,
  onEraseStart,
  onImageUpdate, 
  onDownload, 
  onBackgroundRemove 
}: UseImageNodeProps) => {
  const nodeData = data;
  
  // 使用全局状态管理
  const imageNodesStore = useImageNodesStore();
  
  // 使用公共 hook 处理文件上传
  const { 
    fileInputRef, 
    handleFileSelect, 
    handleButtonClick 
  } = useFileUpload('image/', nodeData?.imageUrl);
  
  // 初始化节点数据到全局状态
  useEffect(() => {
    // 使用 setTimeout 将状态更新延迟到渲染完成后执行
    const timer = setTimeout(() => {
      // 确保所有图片节点（包括空白节点）都被保存到全局状态
      const existingNode = imageNodesStore.getImageNode(id);
      if (!existingNode || 
          (nodeData?.imageUrl && existingNode.imageUrl !== nodeData.imageUrl) ||
          (nodeData?.isLoading !== undefined && existingNode.isLoading !== nodeData.isLoading) ||
          (nodeData?.isProcessing !== undefined && existingNode.isProcessing !== nodeData.isProcessing) ||
          (nodeData?.processingProgress !== undefined && existingNode.processingProgress !== nodeData.processingProgress) ||
          (nodeData?.error !== undefined && existingNode.error !== nodeData.error)) {
        imageNodesStore.setImageNode(id, {
          // 优先使用全局状态中已有的图片URL，而不是 nodeData 中的内容
          imageUrl: existingNode?.imageUrl || nodeData?.imageUrl,
          isLoading: nodeData?.isLoading || false,
          isProcessing: nodeData?.isProcessing || false,
          processingProgress: nodeData?.processingProgress || 0,
          error: nodeData?.error,
          frameType: nodeData?.frameType,
        });
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [id, nodeData, imageNodesStore]);
  
  // 从组件数据获取节点数据，避免直接访问全局状态
  const imageUrl = nodeData?.imageUrl;
  const isLoading = nodeData?.isLoading || false;
  const isProcessing = nodeData?.isProcessing || false;
  const processingProgress = nodeData?.processingProgress || 0;
  const error = nodeData?.error;
  
  // 图片选择回调，更新 imageUrl
  const handleImageSelectInternal = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e, (url) => {
      // 更新全局状态
      imageNodesStore.updateImageNodeUrl(id, url);
      
      // 通知原始回调
      if (onImageUpdate) {
        onImageUpdate(id, url);
      }
    });
  }, [handleFileSelect, imageNodesStore, id, onImageUpdate]);
  
  // 裁剪状态管理
  const handleEditStartInternal = useCallback(async (nodeId: string) => {
    // 1. 检测图片节点是否已包含有效图片资源
    const currentImageUrl = imageUrl;
    const hasImage = !!currentImageUrl;
    
    if (!hasImage) {
      console.warn('图片节点没有有效的图片资源，无法进行裁剪');
      return;
    }

    try {
      // 2. 响应裁剪按钮的点击事件 - 先调用画布居中逻辑
      if (onEditStart) {
        // 调用 onEditStart 进行画布居中
        onEditStart(nodeId);
        
        // 等待600ms确保画布居中动画完成
        await new Promise(resolve => setTimeout(resolve, 600));
      }
      
      // 3. 居中完成后，通知父组件打开裁剪编辑器
      if (onCropStart && currentImageUrl) {
        onCropStart(nodeId, currentImageUrl);
      }
    } catch (error) {
      console.error('裁剪流程执行失败:', error);
      // 即使出错也尝试打开裁剪编辑器
      if (onCropStart && currentImageUrl) {
        onCropStart(nodeId, currentImageUrl);
      }
    }
  }, [imageUrl, onEditStart, onCropStart]);

  // 擦除状态管理
  const handleEraseStartInternal = useCallback(async (nodeId: string) => {
    const currentImageUrl = imageUrl;
    const hasImage = !!currentImageUrl;
    
    if (!hasImage) {
      console.warn('图片节点没有有效的图片资源，无法进行擦除');
      return;
    }

    try {
      if (onEditStart) {
        onEditStart(nodeId);
        await new Promise(resolve => setTimeout(resolve, 600));
      }
      
      if (onEraseStart && currentImageUrl) {
        onEraseStart(nodeId, currentImageUrl);
      }
    } catch (error) {
      console.error('擦除流程执行失败:', error);
      if (onEraseStart && currentImageUrl) {
        onEraseStart(nodeId, currentImageUrl);
      }
    }
  }, [imageUrl, onEditStart, onEraseStart]);
  
  return {
    // 状态
    imageUrl,
    isLoading,
    isProcessing,
    processingProgress,
    error,
    
    // Refs
    fileInputRef,
    
    // 方法
    handleButtonClick,
    handleImageSelect: handleImageSelectInternal,
    handleEditStart: handleEditStartInternal,
    handleEraseStart: handleEraseStartInternal,
    
    // 原始回调
    onDelete,
    onReplace,
    onEditStart,
    onCropStart,
    onEraseStart,
    onImageUpdate,
    onDownload,
    onBackgroundRemove
  };
};
