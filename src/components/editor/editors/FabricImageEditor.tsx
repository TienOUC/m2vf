'use client';

import { useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/hooks/ui/useDebounce';
import { useFabricCanvas } from '@/hooks/utils/useFabricCanvas';
import { useImageLoader } from '@/hooks/utils/useImageLoader';
import { useEnhancedCropHistory } from '@/hooks/utils/useEnhancedCropHistory';
import { createCanvas, createCropBox, createMask, updateMaskClipPath, destroyCanvas, resetMaskBoundsCache, restoreFromHistory } from '@/lib/utils/fabric';
import { calculateCropBoxPosition, calculateCropCoordinates, performCrop } from '@/lib/utils/fabric/crop';
import type { FabricImageEditorProps, ImageCropEditorOptions, FabricCanvas, FabricObject } from '@/lib/types/editor/fabric';
import { EditorContainer, NodeOperationsToolbar, LoadingState, ErrorState } from '@/components/editor';

const FabricImageEditor: React.FC<FabricImageEditorProps> = ({ imageUrl, onCropComplete, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  
  // 使用自定义hooks
  const { fabricRef, fabricLoaded, loadingError } = useFabricCanvas();
  const { imageRef, loadImage } = useImageLoader(fabricRef);
  
  const cropBoxRef = useRef<FabricObject | null>(null);
  const maskRef = useRef<FabricObject | null>(null);
  
  // 使用增强的历史记录管理
  const {
    saveHistory: saveCropHistory,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    setInitialState,
    applyHistoryRecord,
    cancelAutoSave
  } = useEnhancedCropHistory({
    maxHistorySteps: 20,
    autoSave: true,
    saveDelay: 300
  });
  
  // 默认配置
  const defaultOptions: ImageCropEditorOptions = {
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
    },
    initialRatio: 1
  };

  // 初始化画布
  const initCanvas = async () => {
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
  };

  // 清理裁剪框事件监听器
  const cleanupCropBoxEventListeners = () => {
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
  };

  // 注册裁剪框事件监听器
  const registerCropBoxEventListeners = (cropBox: FabricObject) => {
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
  };

  // 创建裁剪框和遮罩层
  const createCropBoxAndMask = () => {
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
        canvas.renderAll();
      }
    });
    
    // 创建遮罩层
    createMaskLayer();
  };

  // 创建遮罩层
  const createMaskLayer = () => {
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

    // 重置遮罩层边界缓存
    resetMaskBoundsCache();

    // 创建新遮罩层
    const maskGroup = createMask(fabric, canvas, cropBox);
    if (!maskGroup) return;

    maskRef.current = maskGroup;



    // 将遮罩层添加到画布，正确的层级顺序：裁剪框 → 遮罩层 → 图片
    canvas.add(maskGroup);
    canvas.sendObjectToBack(img);
    canvas.bringObjectToFront(maskGroup);
    canvas.bringObjectToFront(cropBox);
    canvas.renderAll();
  };

  // 约束裁剪框在图片区域内（简化版实现）
  const constrainCropBox = (cropBox: FabricObject, img: FabricObject) => {
    if (!cropBox || !img) return;
    
    // 获取图片边界
    const imgBounds = img.getBoundingRect(true);
    const imgLeft = imgBounds.left;
    const imgTop = imgBounds.top;
    const imgRight = imgLeft + imgBounds.width;
    const imgBottom = imgTop + imgBounds.height;
    
    // 获取裁剪框当前状态 - 使用原始属性而不是屏幕显示边界
    let newLeft = cropBox.left || 0;
    let newTop = cropBox.top || 0;
    let newWidth = cropBox.width || 0;
    let newHeight = cropBox.height || 0;
    
    // 最小尺寸约束
    const minWidth = 50;
    const minHeight = 50;
    newWidth = Math.max(minWidth, newWidth);
    newHeight = Math.max(minHeight, newHeight);
    
    // 最大尺寸约束
    newWidth = Math.min(newWidth, imgBounds.width);
    newHeight = Math.min(newHeight, imgBounds.height);
    
    // 边界位置约束
    newLeft = Math.max(imgLeft, Math.min(newLeft, imgRight - newWidth));
    newTop = Math.max(imgTop, Math.min(newTop, imgBottom - newHeight));
    
    // 应用约束
    cropBox.set({
      left: newLeft,
      top: newTop,
      width: newWidth,
      height: newHeight
    });
    cropBox.setCoords();
  };

  // 处理裁剪框变化
  const handleCropBoxChange = () => {
    if (fabricCanvasRef.current && cropBoxRef.current && maskRef.current && imageRef.current) {
      // 应用边界约束
      constrainCropBox(cropBoxRef.current, imageRef.current);
      
      // 立即更新遮罩层，确保视觉同步
      updateMaskClipPath(fabricCanvasRef.current, cropBoxRef.current, maskRef.current);
      
      // 自动保存历史记录
      saveCropHistory(cropBoxRef.current, imageRef.current);
    }
  };

  // 立即保存当前状态（用于关键操作）
  const saveCurrentStateImmediately = () => {
    if (!fabricCanvasRef.current || !cropBoxRef.current || !imageRef.current) return;
    
    // 取消自动保存，避免冲突
    cancelAutoSave();
    
    // 立即保存当前状态
    saveCropHistory(cropBoxRef.current, imageRef.current);
  };

  // 撤销操作
  const handleUndo = () => {
    // 取消自动保存，确保状态一致
    cancelAutoSave();
    
    const previousState = undo();
    if (previousState) {
      applyHistoryRecord(previousState, cropBoxRef.current, imageRef.current, fabricCanvasRef.current);
      updateMaskClipPath(fabricCanvasRef.current, cropBoxRef.current, maskRef.current);
    }
  };

  // 重做操作
  const handleRedo = () => {
    // 取消自动保存，确保状态一致
    cancelAutoSave();
    
    const nextState = redo();
    if (nextState) {
      applyHistoryRecord(nextState, cropBoxRef.current, imageRef.current, fabricCanvasRef.current);
      updateMaskClipPath(fabricCanvasRef.current, cropBoxRef.current, maskRef.current);
    }
  };

  // 执行裁剪
  const handleCrop = async () => {
    if (!fabricCanvasRef.current || !imageRef.current || !cropBoxRef.current) return;

    const img = imageRef.current;
    const cropBox = cropBoxRef.current;

    // 计算裁剪坐标
    const coordinates = calculateCropCoordinates(img, cropBox);
    
    // 执行裁剪
    const croppedImageUrl = await performCrop(imageUrl, coordinates);
    
    if (croppedImageUrl) {
      onCropComplete(croppedImageUrl);
    }
  };

  // 重置编辑状态
  const resetEditor = () => {
    if (!fabricCanvasRef.current || !imageRef.current || !cropBoxRef.current) return;

    // 取消自动保存
    cancelAutoSave();
    
    // 重置历史记录并恢复初始状态
    const success = reset();
    
    if (success) {
      // 获取初始状态
      const initialState = undo();
      if (initialState) {
        // 应用初始状态
        applyHistoryRecord(initialState, cropBoxRef.current, imageRef.current, fabricCanvasRef.current);
        
        // 更新遮罩层
        updateMaskClipPath(fabricCanvasRef.current, cropBoxRef.current, maskRef.current);
      } else {
        // 如果没有初始状态，重新创建裁剪框
        const canvas = fabricCanvasRef.current;
        canvas.remove(cropBoxRef.current);
        
        if (maskRef.current) {
          canvas.remove(maskRef.current);
          maskRef.current = null;
        }

        cropBoxRef.current = null;
        createCropBoxAndMask();
        
        // 重新设置初始状态
        if (imageRef.current && cropBoxRef.current) {
          setInitialState(cropBoxRef.current, imageRef.current);
        }
      }
    }
  };

  // 销毁编辑器
  const destroyEditor = () => {
    // 取消自动保存，确保状态一致
    cancelAutoSave();
    
    // 清理事件监听器
    cleanupCropBoxEventListeners();
    
    // 销毁Canvas和所有资源
    destroyCanvas(fabricCanvasRef.current);
    
    // 清空所有引用
    fabricCanvasRef.current = null;
    imageRef.current = null;
    cropBoxRef.current = null;
    maskRef.current = null;
  };

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

  // 初始化画布
  useEffect(() => {
    if (fabricLoaded && canvasRef.current) {
      initCanvas();
    }

    return () => {
      destroyEditor();
    };
  }, [fabricLoaded, imageUrl]);

  // 监听组件卸载，确保完全清理
  useEffect(() => {
    const handleBeforeUnload = () => {
      destroyEditor();
    };

    // 监听页面卸载事件
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      destroyEditor();
    };
  }, []);

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
        onReset={resetEditor}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCancel={onCancel}
        onCrop={handleCrop}
        canUndo={canUndo}
        canRedo={canRedo}
      />
    </div>
  );
};

export default FabricImageEditor;