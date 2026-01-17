'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useFabricCanvas } from '@/hooks/utils/useFabricCanvas';
import { useImageLoader } from '@/hooks/utils/useImageLoader';
import { useEnhancedCropHistory } from '@/hooks/utils/useEnhancedCropHistory';
import { createCanvas, createCropBox, createMask, updateMaskClipPath, destroyCanvas } from '@/lib/utils/fabric';
import { calculateCropBoxPosition, calculateCropCoordinates, performCrop } from '@/lib/utils/fabric/crop';
import type { FabricImageEditorProps, FabricCanvas, FabricObject, ImageCropEditorOptions } from '@/lib/types/editor/fabric';
import { EditorContainer, NodeOperationsToolbar, LoadingState, ErrorState } from '@/components/editor';

const FabricImageEditor: React.FC<FabricImageEditorProps> = ({ imageUrl, onCropComplete, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  
  // 使用自定义hooks
  const { fabricRef, fabricLoaded, loadingError } = useFabricCanvas();
  const { imageRef, loadImage } = useImageLoader(fabricRef);
  
  const cropBoxRef = useRef<FabricObject | null>(null);
  const maskRef = useRef<FabricObject | null>(null);
  const [currentAspectRatio, setCurrentAspectRatio] = useState<number | null>(null);
  
  // 处理裁剪操作
  const handleCrop = async () => {
    if (fabricCanvasRef.current && imageRef.current && cropBoxRef.current) {
      // 计算裁剪坐标
      const coordinates = calculateCropCoordinates(imageRef.current, cropBoxRef.current);
      // 执行裁剪操作
      const croppedImageUrl = await performCrop(imageUrl, coordinates);
      // 调用回调函数返回裁剪结果
      onCropComplete(croppedImageUrl);
    }
  };
  
  // 使用增强的历史记录管理（仅用于保存状态）
  const {
    saveHistory: saveCropHistory,
    setInitialState
  } = useEnhancedCropHistory({
    maxHistorySteps: 20,
    autoSave: true,
    saveDelay: 300
  });
  
  // 默认配置，使用useMemo缓存避免每次重新渲染
  const defaultOptions = useMemo<ImageCropEditorOptions>(() => ({
    imageUrl,
    canvasWidth: typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.9, 1200) : 800,
    canvasHeight: typeof window !== 'undefined' ? Math.min(window.innerHeight * 0.9, 800) : 600,
    minCropSize: { width: 100, height: 100 },
    cropBoxStyle: {
      borderWidth: 2,
      borderColor: '#ffffff',
      borderStyle: 'dashed',
      cornerSize: 12,
      cornerColor: '#ffffff'
    }
  }), [imageUrl]);

  // 约束裁剪框在图片区域内
  const constrainCropBox = useCallback((cropBox: FabricObject, img: FabricObject) => {
    if (!cropBox || !img) return;
    
    // 获取图片边界
    const imgBounds = img.getBoundingRect(true);
    const imgLeft = imgBounds.left;
    const imgTop = imgBounds.top;
    const imgRight = imgLeft + imgBounds.width;
    const imgBottom = imgTop + imgBounds.height;
    
    // 获取裁剪框当前状态
    let newLeft = cropBox.left || 0;
    let newTop = cropBox.top || 0;
    let newWidth = cropBox.width || 0;
    let newHeight = cropBox.height || 0;
    const aspectRatio = cropBox.get('aspectRatio') as number | undefined;
    const lockAspectRatio = cropBox.get('lockAspectRatio') || false;
    
    // 使用默认配置中的最小尺寸
    const minWidth = defaultOptions.minCropSize?.width || 100;
    const minHeight = defaultOptions.minCropSize?.height || 100;
    
    // 1. 应用宽高比约束
    if (lockAspectRatio && typeof aspectRatio === 'number') {
      // 保持宽高比不变
      newHeight = newWidth / aspectRatio;
    }
    
    // 2. 应用最小尺寸约束
    if (newWidth < minWidth || newHeight < minHeight) {
      if (lockAspectRatio && typeof aspectRatio === 'number') {
        // 有宽高比约束，以最小宽度为基准
        newWidth = minWidth;
        newHeight = newWidth / aspectRatio;
        
        // 如果高度仍然小于最小高度，以最小高度为基准
        if (newHeight < minHeight) {
          newHeight = minHeight;
          newWidth = newHeight * aspectRatio;
        }
      } else {
        // 没有宽高比约束，直接应用最小尺寸
        newWidth = Math.max(minWidth, newWidth);
        newHeight = Math.max(minHeight, newHeight);
      }
    }
    
    // 3. 应用最大尺寸约束
    const maxWidth = imgBounds.width;
    const maxHeight = imgBounds.height;
    if (newWidth > maxWidth || newHeight > maxHeight) {
      if (lockAspectRatio && typeof aspectRatio === 'number') {
        // 有宽高比约束，以最大宽度为基准
        newWidth = maxWidth;
        newHeight = newWidth / aspectRatio;
        
        // 如果高度仍然大于最大高度，以最大高度为基准
        if (newHeight > maxHeight) {
          newHeight = maxHeight;
          newWidth = newHeight * aspectRatio;
        }
      } else {
        // 没有宽高比约束，直接应用最大尺寸
        newWidth = Math.min(newWidth, maxWidth);
        newHeight = Math.min(newHeight, maxHeight);
      }
    }
    
    // 4. 计算裁剪框的右侧和底部位置
    let newRight = newLeft + newWidth;
    let newBottom = newTop + newHeight;
    
    // 5. 应用位置约束 - 确保裁剪框完全在图片范围内
    // 左侧约束
    if (newLeft < imgLeft) {
      newLeft = imgLeft;
      newRight = newLeft + newWidth;
    }
    
    // 右侧约束
    if (newRight > imgRight) {
      newLeft = imgRight - newWidth;
      newRight = imgRight;
    }
    
    // 顶部约束
    if (newTop < imgTop) {
      newTop = imgTop;
      newBottom = newTop + newHeight;
    }
    
    // 底部约束
    if (newBottom > imgBottom) {
      newTop = imgBottom - newHeight;
      newBottom = imgBottom;
    }
    
    // 应用约束
    cropBox.set({
      left: newLeft,
      top: newTop,
      width: newWidth,
      height: newHeight
    });
    cropBox.setCoords();
  }, [defaultOptions.minCropSize?.width, defaultOptions.minCropSize?.height]);
  
  // 处理宽高比变化
  const handleAspectRatioChange = useCallback((aspectRatio: number | null) => {
    setCurrentAspectRatio(aspectRatio);
    // 如果有裁剪框，应用新的宽高比约束并调整尺寸
    if (cropBoxRef.current && imageRef.current && fabricCanvasRef.current) {
      const cropBox = cropBoxRef.current;
      const canvas = fabricCanvasRef.current;
      
      // 获取当前裁剪框的中心位置
      const currentLeft = cropBox.left || 0;
      const currentTop = cropBox.top || 0;
      const currentWidth = cropBox.width || 0;
      const currentHeight = cropBox.height || 0;
      const centerX = currentLeft + currentWidth / 2;
      const centerY = currentTop + currentHeight / 2;
      
      // 获取图片在画布上的实际尺寸
      const img = imageRef.current;
      const imgBounds = img.getBoundingRect(true);
      const imgWidth = imgBounds.width;
      const imgHeight = imgBounds.height;
      
      let newWidth = currentWidth;
      let newHeight = currentHeight;
      
      // 根据新的宽高比重新计算裁剪框尺寸，保持中心位置不变
      if (aspectRatio !== null) {
        // 以当前尺寸为基础，根据新宽高比计算最合适的尺寸
        // 保持面积尽量接近原裁剪框，同时满足宽高比约束
        const currentArea = currentWidth * currentHeight;
        const targetArea = currentArea;
        
        // 计算目标宽度和高度
        let targetWidth = Math.sqrt(targetArea * aspectRatio);
        let targetHeight = targetWidth / aspectRatio;
        
        // 确保不超出图片范围
        if (targetWidth > imgWidth) {
          targetWidth = imgWidth;
          targetHeight = targetWidth / aspectRatio;
        }
        if (targetHeight > imgHeight) {
          targetHeight = imgHeight;
          targetWidth = targetHeight * aspectRatio;
        }
        
        // 确保不小于最小尺寸
        const minSize = defaultOptions.minCropSize || { width: 100, height: 100 };
        if (targetWidth < minSize.width || targetHeight < minSize.height) {
          if (targetWidth < minSize.width) {
            targetWidth = minSize.width;
            targetHeight = targetWidth / aspectRatio;
          }
          if (targetHeight < minSize.height) {
            targetHeight = minSize.height;
            targetWidth = targetHeight * aspectRatio;
          }
        }
        
        newWidth = targetWidth;
        newHeight = targetHeight;
      } else {
        // 自由比例，保持当前尺寸
        newWidth = currentWidth;
        newHeight = currentHeight;
      }
      
      // 计算新的左上角位置，保持中心位置不变
      let newLeft = centerX - newWidth / 2;
      let newTop = centerY - newHeight / 2;
      
      // 确保裁剪框完全在图片范围内
      newLeft = Math.max(newLeft, imgBounds.left);
      newTop = Math.max(newTop, imgBounds.top);
      
      // 确保裁剪框右边界不超出图片
      const maxLeft = imgBounds.left + imgWidth - newWidth;
      const maxTop = imgBounds.top + imgHeight - newHeight;
      newLeft = Math.min(newLeft, maxLeft);
      newTop = Math.min(newTop, maxTop);
      
      // 应用新的宽高比约束和尺寸
      cropBox.set({
        left: newLeft,
        top: newTop,
        width: newWidth,
        height: newHeight,
        lockAspectRatio: aspectRatio !== null,
        aspectRatio: aspectRatio !== null ? aspectRatio : undefined
      });
      
      // 应用约束，确保裁剪框在图片范围内
      constrainCropBox(cropBox, img);
      
      // 更新坐标和遮罩层
      cropBox.setCoords();
      if (maskRef.current) {
        updateMaskClipPath(canvas, cropBox, maskRef.current);
      }
      
      // 重新渲染画布
      canvas.renderAll();
    }
  }, [constrainCropBox, defaultOptions.minCropSize]);

  // 处理裁剪框变化
  const handleCropBoxChange = useCallback(() => {
    if (fabricCanvasRef.current && cropBoxRef.current && maskRef.current && imageRef.current) {
      const canvas = fabricCanvasRef.current;
      
      // 应用边界约束
      constrainCropBox(cropBoxRef.current, imageRef.current);
      
      // 立即更新遮罩层，确保视觉同步
      updateMaskClipPath(canvas, cropBoxRef.current, maskRef.current);
      
      // 自动保存历史记录
      saveCropHistory(cropBoxRef.current, imageRef.current);
      
      // 重新渲染画布，确保视觉效果及时更新
      canvas.renderAll();
    }
  }, [constrainCropBox, saveCropHistory]);

  // 清理裁剪框事件监听器
  const cleanupCropBoxEventListeners = useCallback(() => {
    if (cropBoxRef.current) {
      try {
        // 移除所有事件监听器
        cropBoxRef.current.off('moving');
        cropBoxRef.current.off('scaling');
        cropBoxRef.current.off('rotating');
        
      } catch (error) {
        console.warn('Error removing crop box event listeners:', error);
      }
    }
  }, []);

  // 注册裁剪框事件监听器
  const registerCropBoxEventListeners = useCallback((cropBox: FabricObject) => {
    // 先清理旧的事件监听器
    cleanupCropBoxEventListeners();
    
    // 注册新的事件监听器
    // 为高频事件添加节流，提高拖动流畅度
    let throttleTimer: number | null = null;
    
    const throttledHandleCropBoxChange = () => {
      if (throttleTimer) return;
      throttleTimer = requestAnimationFrame(() => {
        handleCropBoxChange();
        throttleTimer = null;
      });
    };
    
    cropBox.on('moving', throttledHandleCropBoxChange);
    cropBox.on('scaling', throttledHandleCropBoxChange);
    cropBox.on('rotating', throttledHandleCropBoxChange);
  }, [cleanupCropBoxEventListeners, handleCropBoxChange]);

  // 创建遮罩层
  const createMaskLayer = useCallback(() => {
    if (!fabricCanvasRef.current || !imageRef.current || !cropBoxRef.current || !fabricRef.current) return;
    
    const fabric = fabricRef.current;
    const canvas = fabricCanvasRef.current;
    const img = imageRef.current;
    const cropBox = cropBoxRef.current;

    // 移除已存在的遮罩层
    if (maskRef.current) {
      canvas.remove(maskRef.current);
      maskRef.current = null;
    }

    // 创建新遮罩层
    const maskGroup = createMask(fabric, canvas, cropBox);
    if (!maskGroup) return;

    maskRef.current = maskGroup;

    // 将遮罩层添加到画布，正确的层级顺序：裁剪框 → 遮罩层 → 图片
    canvas.add(maskGroup);
    canvas.sendObjectToBack(img);
    canvas.bringObjectToFront(maskGroup);
    canvas.bringObjectToFront(cropBox);
  }, [fabricRef]);

  // 创建裁剪框和遮罩层
  const createCropBoxAndMask = useCallback(() => {
    if (!fabricCanvasRef.current || !imageRef.current || !fabricRef.current) return;
    
    const fabric = fabricRef.current;
    const canvas = fabricCanvasRef.current;
    const img = imageRef.current;
    
    // 获取图片在画布上的实际尺寸（考虑缩放）
    const imgWidth = (img.width || 0) * (img.scaleX || 1);
    const imgHeight = (img.height || 0) * (img.scaleY || 1);
    
    // 计算裁剪框位置和尺寸（使用图片在画布上的实际尺寸）
    const cropBoxConfig = calculateCropBoxPosition(
      imgWidth,
      imgHeight,
      1, // 缩放因子为1，因为已经考虑了缩放
      defaultOptions.minCropSize || { width: 100, height: 100 }
    );
    
    // 创建裁剪框
    const cropBox = createCropBox(fabric, {
      ...cropBoxConfig,
      stroke: defaultOptions.cropBoxStyle?.borderColor || '#ffffff',
      strokeWidth: defaultOptions.cropBoxStyle?.borderWidth || 2,
      strokeDashArray: [2, 4],
      cornerSize: defaultOptions.cropBoxStyle?.cornerSize || 4,
      cornerColor: defaultOptions.cropBoxStyle?.cornerColor || '#ffffff',
      minWidth: defaultOptions.minCropSize?.width || 100,
      minHeight: defaultOptions.minCropSize?.height || 100
    });
    
    // 注册裁剪框事件监听器
    registerCropBoxEventListeners(cropBox);
    
    cropBoxRef.current = cropBox;
    canvas.add(cropBox);
    canvas.setActiveObject(cropBox);
    
    // 应用初始约束
    // 使用 requestAnimationFrame 确保在下一帧渲染时应用约束
    requestAnimationFrame(() => {
      if (imageRef.current) {
        constrainCropBox(cropBox, imageRef.current);
      }
    });
    
    // 创建遮罩层
    createMaskLayer();
  }, [constrainCropBox, registerCropBoxEventListeners, createMaskLayer, defaultOptions.cropBoxStyle, defaultOptions.minCropSize, fabricRef]);

  // 销毁编辑器
  const destroyEditor = useCallback(() => {
    // 清理事件监听器
    cleanupCropBoxEventListeners();
    
    // 销毁Canvas和所有资源
    destroyCanvas(fabricCanvasRef.current);
  }, [cleanupCropBoxEventListeners]);

  // 初始化画布
  const initCanvas = useCallback(async () => {
    if (!canvasRef.current || !fabricRef.current) return;

    const fabric = fabricRef.current;
    
    // 使用默认配置的尺寸创建初始画布，避免临时尺寸
    const canvas = createCanvas(canvasRef, fabric, defaultOptions.canvasWidth, defaultOptions.canvasHeight);
    if (!canvas) return;

    fabricCanvasRef.current = canvas;
    
    // 加载图片
    const success = await loadImage(imageUrl, canvas, canvasRef);
    if (success) {
      // 确保图片加载完成后立即创建裁剪框和遮罩层
      // 使用 requestAnimationFrame 确保在下一帧渲染时执行
      requestAnimationFrame(() => {
        createCropBoxAndMask();
        // 设置初始状态
        if (imageRef.current && cropBoxRef.current) {
          setInitialState(cropBoxRef.current, imageRef.current);
        }
      });
    }
  }, [canvasRef, fabricRef, imageUrl, loadImage, setInitialState, createCropBoxAndMask, defaultOptions.canvasHeight, defaultOptions.canvasWidth]);


  // 初始化画布和清理资源
  useEffect(() => {
    if (fabricLoaded && canvasRef.current) {
      initCanvas();
    }

    const handleBeforeUnload = () => {
      destroyEditor();
    };

    // 监听页面卸载事件
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      destroyEditor();
    };
  }, [fabricLoaded, initCanvas, destroyEditor]);

  // 显示错误状态
  if (loadingError) {
    return <ErrorState error={loadingError} onRetry={() => window.location.reload()} />;
  }

  // 显示加载状态
  if (!fabricLoaded) {
    return <LoadingState />;
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent">
      <EditorContainer canvasRef={canvasRef} />
      <NodeOperationsToolbar
        onCancel={onCancel}
        onCrop={handleCrop}
        currentAspectRatio={currentAspectRatio}
        onAspectRatioChange={handleAspectRatioChange}
      />
    </div>
  );
};

export default FabricImageEditor;