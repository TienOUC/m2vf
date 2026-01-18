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
      try {
        // 计算裁剪坐标
        const coordinates = calculateCropCoordinates(imageRef.current, cropBoxRef.current);
        
        // 验证裁剪坐标
        if (coordinates.cropWidth <= 0 || coordinates.cropHeight <= 0) {
          throw new Error('Invalid crop dimensions: please adjust the crop area');
        }
        
        // 执行裁剪操作
        const croppedImageUrl = await performCrop(imageUrl, coordinates);
        
        // 调用回调函数返回裁剪结果
        onCropComplete(croppedImageUrl);
      } catch (error) {
        console.error('Crop operation failed:', error);
        // 可以考虑添加错误提示给用户
        onCropComplete('');
      }
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
    const imgWidth = imgBounds.width;
    const imgHeight = imgBounds.height;
    
    // 获取裁剪框当前状态
    const currentLeft = cropBox.left || 0;
    const currentTop = cropBox.top || 0;
    const currentWidth = cropBox.width || 0;
    const currentHeight = cropBox.height || 0;
    const aspectRatio = cropBox.get('aspectRatio') as number | undefined;
    const lockAspectRatio = cropBox.get('lockAspectRatio') || false;
    
    // 使用默认配置中的最小尺寸
    const minWidth = defaultOptions.minCropSize?.width || 100;
    const minHeight = defaultOptions.minCropSize?.height || 100;
    
    // 初始值设为当前值
    let newLeft = currentLeft;
    let newTop = currentTop;
    let newWidth = currentWidth;
    let newHeight = currentHeight;
    
    // 1. 应用宽高比约束
    if (lockAspectRatio && typeof aspectRatio === 'number') {
      // 确保宽度和高度严格符合宽高比
      newHeight = newWidth / aspectRatio;
    }
    
    // 2. 确保裁剪框尺寸不超过图片尺寸
    if (newWidth > imgWidth) {
      newWidth = imgWidth;
      if (lockAspectRatio && typeof aspectRatio === 'number') {
        newHeight = newWidth / aspectRatio;
      }
    }
    
    if (newHeight > imgHeight) {
      newHeight = imgHeight;
      if (lockAspectRatio && typeof aspectRatio === 'number') {
        newWidth = newHeight * aspectRatio;
      }
    }
    
    // 3. 应用最小尺寸约束
    if (newWidth < minWidth || newHeight < minHeight) {
      if (lockAspectRatio && typeof aspectRatio === 'number') {
        if (aspectRatio >= 1) {
          // 横屏或正方形，以宽度为基准
          newWidth = minWidth;
          newHeight = newWidth / aspectRatio;
        } else {
          // 竖屏，以高度为基准
          newHeight = minHeight;
          newWidth = newHeight * aspectRatio;
        }
      } else {
        // 没有宽高比约束，直接应用最小尺寸
        newWidth = Math.max(minWidth, newWidth);
        newHeight = Math.max(minHeight, newHeight);
      }
    }
    
    // 4. 确保裁剪框完全在图片范围内
    // 计算裁剪框的最大允许位置
    const maxLeft = imgLeft + imgWidth - newWidth;
    const maxTop = imgTop + imgHeight - newHeight;
    
    // 确保裁剪框不超出图片范围
    newLeft = Math.max(imgLeft, Math.min(newLeft, maxLeft));
    newTop = Math.max(imgTop, Math.min(newTop, maxTop));
    
    // 5. 变化检测：只有当值发生变化时才更新，避免不必要的渲染
    if (Math.abs(currentLeft - newLeft) > 0.1 || 
        Math.abs(currentTop - newTop) > 0.1 || 
        Math.abs(currentWidth - newWidth) > 0.1 || 
        Math.abs(currentHeight - newHeight) > 0.1) {
      cropBox.set({
        left: newLeft,
        top: newTop,
        width: newWidth,
        height: newHeight
      });
      cropBox.setCoords();
    }
  }, [defaultOptions.minCropSize]);
  
  // 处理宽高比变化
  const handleAspectRatioChange = useCallback((aspectRatio: number | null) => {
    setCurrentAspectRatio(aspectRatio);
    // 如果有裁剪框，应用新的宽高比约束并调整尺寸
    if (cropBoxRef.current && imageRef.current && fabricCanvasRef.current) {
      const cropBox = cropBoxRef.current;
      const canvas = fabricCanvasRef.current;
      const img = imageRef.current;
      
      // 获取图片在画布上的实际尺寸
      const imgBounds = img.getBoundingRect(true);
      const imgLeft = imgBounds.left;
      const imgTop = imgBounds.top;
      const imgWidth = imgBounds.width;
      const imgHeight = imgBounds.height;
      
      // 获取当前裁剪框的尺寸和位置
      const currentLeft = cropBox.left || 0;
      const currentTop = cropBox.top || 0;
      const currentWidth = cropBox.width || 0;
      const currentHeight = cropBox.height || 0;
      
      // 计算裁剪框中心点
      const centerX = currentLeft + currentWidth / 2;
      const centerY = currentTop + currentHeight / 2;
      
      // 获取最小尺寸约束
      const minWidth = defaultOptions.minCropSize?.width || 100;
      const minHeight = defaultOptions.minCropSize?.height || 100;
      
      // 1. 首先设置宽高比约束，确保后续调整尺寸时宽高比生效
      cropBox.set({
        lockAspectRatio: aspectRatio !== null,
        aspectRatio: aspectRatio !== null ? aspectRatio : undefined
      });
      
      let newWidth: number;
      let newHeight: number;
      
      if (aspectRatio !== null) {
        // 有宽高比约束
        // 计算在图片范围内，该宽高比下的最大可能尺寸
        let maxWidth = imgWidth;
        let maxHeight = maxWidth / aspectRatio;
        
        // 如果高度超出图片范围，则以图片高度为基准
        if (maxHeight > imgHeight) {
          maxHeight = imgHeight;
          maxWidth = maxHeight * aspectRatio;
        }
        
        // 确保不小于最小尺寸约束
        if (maxWidth < minWidth || maxHeight < minHeight) {
          // 以最小尺寸为基准计算
          if (aspectRatio >= 1) {
            // 横屏或正方形，以宽度为基准
            maxWidth = minWidth;
            maxHeight = maxWidth / aspectRatio;
          } else {
            // 竖屏，以高度为基准
            maxHeight = minHeight;
            maxWidth = maxHeight * aspectRatio;
          }
        }
        
        // 计算新的尺寸，保持中心点不变
        newWidth = maxWidth;
        newHeight = maxHeight;
        
        // 如果当前裁剪框面积小于最大尺寸，则保持当前面积
        const currentArea = currentWidth * currentHeight;
        const maxArea = maxWidth * maxHeight;
        
        if (currentArea < maxArea) {
          // 计算与当前面积相近的尺寸，同时保持宽高比
          newWidth = Math.sqrt(currentArea * aspectRatio);
          newHeight = newWidth / aspectRatio;
          
          // 确保不小于最小尺寸
          newWidth = Math.max(newWidth, minWidth);
          newHeight = Math.max(newHeight, minHeight);
        }
      } else {
        // 自由比例，保持当前尺寸
        newWidth = currentWidth;
        newHeight = currentHeight;
      }
      
      // 计算新的左上角位置，保持中心点不变
      let newLeft = centerX - newWidth / 2;
      let newTop = centerY - newHeight / 2;
      
      // 确保裁剪框完全在图片范围内
      newLeft = Math.max(newLeft, imgLeft);
      newTop = Math.max(newTop, imgTop);
      
      // 确保裁剪框右边界不超出图片
      const maxLeft = imgLeft + imgWidth - newWidth;
      const maxTop = imgTop + imgHeight - newHeight;
      newLeft = Math.min(newLeft, maxLeft);
      newTop = Math.min(newTop, maxTop);
      
      // 2. 更新裁剪框的尺寸和位置
      cropBox.set({
        left: newLeft,
        top: newTop,
        width: newWidth,
        height: newHeight
      });
      
      // 3. 更新裁剪框坐标
      cropBox.setCoords();
      
      // 4. 更新遮罩层，使用现有的updateMaskClipPath函数
      if (maskRef.current) {
        updateMaskClipPath(canvas, cropBox, maskRef.current);
      }
      
      // 5. 立即重绘画布，确保所有更新同步显示
      canvas.renderAll();
    }
  }, [defaultOptions.minCropSize, updateMaskClipPath]);

  // 处理裁剪历史记录保存的节流
  const saveHistoryThrottleRef = useRef<number | null>(null);
  
  // 带节流的历史记录保存函数
  const throttledSaveCropHistory = useCallback((cropBox: FabricObject, image: FabricObject) => {
    if (saveHistoryThrottleRef.current) {
      cancelAnimationFrame(saveHistoryThrottleRef.current);
    }
    
    saveHistoryThrottleRef.current = requestAnimationFrame(() => {
      saveCropHistory(cropBox, image);
      saveHistoryThrottleRef.current = null;
    });
  }, [saveCropHistory]);

  // 处理裁剪框变化
  const handleCropBoxChange = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const cropBox = cropBoxRef.current;
    const mask = maskRef.current;
    const img = imageRef.current;
    
    if (canvas && cropBox && img) {
      // 应用边界约束
      constrainCropBox(cropBox, img);
      
      // 立即更新遮罩层，确保视觉同步
      if (mask) {
        updateMaskClipPath(canvas, cropBox, mask);
      } else {
        // 如果mask为空，重新创建遮罩层
        // 直接调用createMaskLayer，不将其作为依赖，避免变量提升问题
        (async () => {
          if (fabricRef.current && fabricCanvasRef.current && imageRef.current && cropBoxRef.current) {
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
          }
        })();
      }
      
      // 自动保存历史记录（带节流）
      throttledSaveCropHistory(cropBox, img);
    }
  }, [constrainCropBox, throttledSaveCropHistory]);

  // 清理裁剪框事件监听器
  const cleanupCropBoxEventListeners = useCallback(() => {
    if (cropBoxRef.current) {
      try {
        // 移除所有事件监听器
        cropBoxRef.current.off('moving');
        cropBoxRef.current.off('scaling');
        
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
  }, [cleanupCropBoxEventListeners, handleCropBoxChange]);

  // 创建遮罩层
  const createMaskLayer = useCallback(() => {
    if (!fabricCanvasRef.current || !imageRef.current || !cropBoxRef.current || !fabricRef.current) return;
    
    const fabric = fabricRef.current;
    const canvas = fabricCanvasRef.current;
    const img = imageRef.current;
    const cropBox = cropBoxRef.current;

    if (maskRef.current) {
      // 如果遮罩层已经存在，直接更新其clipPath，避免重建
      updateMaskClipPath(canvas, cropBox, maskRef.current);
      
      // 确保层级顺序正确
      canvas.sendObjectToBack(img);
      canvas.bringObjectToFront(maskRef.current);
      canvas.bringObjectToFront(cropBox);
    } else {
      // 遮罩层不存在时，创建新遮罩层
      const maskGroup = createMask(fabric, canvas, cropBox);
      if (!maskGroup) return;

      maskRef.current = maskGroup;

      // 将遮罩层添加到画布，正确的层级顺序：裁剪框 → 遮罩层 → 图片
      canvas.add(maskGroup);
      canvas.sendObjectToBack(img);
      canvas.bringObjectToFront(maskGroup);
      canvas.bringObjectToFront(cropBox);
    }
  }, [fabricRef, updateMaskClipPath]);

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
    
    // 直接应用初始约束，不需要requestAnimationFrame
    constrainCropBox(cropBox, img);
    
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