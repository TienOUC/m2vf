import { useCallback, useEffect, useState } from 'react';
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
  onImageUpdate, 
  onDownload, 
  onBackgroundRemove 
}: UseImageNodeProps) => {
  const nodeData = data;
  
  // 使用全局状态管理
  const imageNodesStore = useImageNodesStore();
  
  // 本地状态
  const [isCropping, setIsCropping] = useState(false);
  
  // 使用公共 hook 处理文件上传
  const { 
    fileInputRef, 
    handleFileSelect, 
    handleButtonClick 
  } = useFileUpload('image/', nodeData?.imageUrl);
  
  // 初始化节点数据到全局状态
  useEffect(() => {
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
      });
    }
  }, [id, nodeData, imageNodesStore]);
  
  // 从全局状态获取节点数据
  const nodeFromStore = imageNodesStore.getImageNode(id);
  const imageUrl = nodeFromStore?.imageUrl;
  const isLoading = nodeFromStore?.isLoading || false;
  const isProcessing = nodeFromStore?.isProcessing || false;
  const processingProgress = nodeFromStore?.processingProgress || 0;
  const error = nodeFromStore?.error;
  
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

    if (isCropping) {
      console.warn('裁剪操作正在进行中，请等待完成');
      return;
    }

    setIsCropping(true);
    
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
    } finally {
      setIsCropping(false);
    }
  }, [imageUrl, isCropping, onEditStart, onCropStart]);
  
  // 更新图片URL的公共方法
  const updateImageUrl = useCallback((newImageUrl: string) => {
    imageNodesStore.updateImageNodeUrl(id, newImageUrl);
    if (onImageUpdate) {
      onImageUpdate(id, newImageUrl);
    }
  }, [imageNodesStore, id, onImageUpdate]);
  
  // 更新加载状态的公共方法
  const updateLoadingState = useCallback((newLoadingState: boolean) => {
    imageNodesStore.updateImageNodeLoadingState(id, newLoadingState);
  }, [imageNodesStore, id]);
  
  // 更新处理状态的公共方法
  const updateProcessingState = useCallback((newProcessingState: boolean, progress?: number) => {
    imageNodesStore.updateImageNodeProcessingState(id, newProcessingState, progress);
  }, [imageNodesStore, id]);
  
  // 更新错误状态的公共方法
  const updateError = useCallback((newError?: string) => {
    imageNodesStore.updateImageNodeError(id, newError);
  }, [imageNodesStore, id]);
  
  return {
    // 状态
    imageUrl,
    isLoading,
    isProcessing,
    processingProgress,
    error,
    isCropping,
    
    // Refs
    fileInputRef,
    
    // 方法
    handleButtonClick,
    handleImageSelect: handleImageSelectInternal,
    handleEditStart: handleEditStartInternal,
    updateImageUrl,
    updateLoadingState,
    updateProcessingState,
    updateError,
    
    // 原始回调
    onDelete,
    onReplace,
    onEditStart,
    onCropStart,
    onImageUpdate,
    onDownload,
    onBackgroundRemove
  };
};
