'use client';

import { useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/ui/useDebounce';
import { useFabricCanvas } from '@/hooks/utils/useFabricCanvas';
import { useImageLoader } from '@/hooks/utils/useImageLoader';
import { useCropHistory } from '@/hooks/utils/useCropHistory';
import { createCanvas, createCropBox, createMask, updateMaskClipPath, destroyCanvas, resetMaskBoundsCache } from '@/utils/fabric/fabric';
import { calculateCropBoxPosition, calculateCropCoordinates, performCrop } from '@/utils/fabric/crop';
import type { FabricImageEditorProps, ImageCropEditorOptions, FabricCanvas, FabricObject } from '@/types/editor/fabric';
import { EditorContainer, NodeOperationsToolbar, LoadingState, ErrorState } from '@/components/editor';

const FabricImageEditor: React.FC<FabricImageEditorProps> = ({ imageUrl, onCropComplete, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  
  // 使用自定义hooks
  const { fabricRef, fabricLoaded, loadingError } = useFabricCanvas();
  const { imageRef, loadImage } = useImageLoader(fabricRef);
  const { saveHistory, undoHistory, redoHistory, canUndo, canRedo, restoreFromHistory } = useCropHistory(5);
  
  const cropBoxRef = useRef<FabricObject | null>(null);
  const maskRef = useRef<FabricObject | null>(null);
  
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
        saveCurrentStateToHistory();
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
    
    // 获取裁剪框当前状态
    const cropBounds = cropBox.getBoundingRect(true);
    let newLeft = cropBounds.left;
    let newTop = cropBounds.top;
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
      
      // 使用防抖保存历史记录，但提供取消机制
      debouncedSaveHistory();
    }
  };

  // 立即保存当前状态（用于关键操作）
  const saveCurrentStateImmediately = () => {
    // 取消防抖操作，避免状态不一致
    cancelSaveHistory();
    // 立即保存状态
    saveCurrentStateToHistory();
  };

  // 保存当前状态到历史记录
  const saveCurrentStateToHistory = () => {
    if (!fabricCanvasRef.current || !cropBoxRef.current || !imageRef.current) return;

    const cropBox = cropBoxRef.current;
    const img = imageRef.current;

    saveHistory(cropBox, img);
  };

  // 使用防抖函数，添加取消机制
  const { debouncedCallback: debouncedSaveHistory, cancel: cancelSaveHistory } = useDebounce(
    saveCurrentStateToHistory,
    300
  );

  // 撤销操作
  const undo = () => {
    // 取消防抖操作，确保状态一致
    cancelSaveHistory();
    
    const previousState = undoHistory();
    if (previousState) {
      restoreFromHistory(previousState, cropBoxRef.current, imageRef.current, fabricCanvasRef.current);
      updateMaskClipPath(fabricCanvasRef.current, cropBoxRef.current, maskRef.current);
      // 立即保存当前状态
      saveCurrentStateImmediately();
    }
  };

  // 重做操作
  const redo = () => {
    // 取消防抖操作，确保状态一致
    cancelSaveHistory();
    
    const nextState = redoHistory();
    if (nextState) {
      restoreFromHistory(nextState, cropBoxRef.current, imageRef.current, fabricCanvasRef.current);
      updateMaskClipPath(fabricCanvasRef.current, cropBoxRef.current, maskRef.current);
      // 立即保存当前状态
      saveCurrentStateImmediately();
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

  // 重置裁剪框
  const resetCropBox = () => {
    if (!fabricCanvasRef.current || !cropBoxRef.current) return;

    const canvas = fabricCanvasRef.current;
    canvas.remove(cropBoxRef.current);
    
    if (maskRef.current) {
      canvas.remove(maskRef.current);
      maskRef.current = null;
    }

    cropBoxRef.current = null;
    createCropBoxAndMask();
    // 立即保存状态，确保同步
    saveCurrentStateImmediately();
  };

  // 销毁编辑器
  const destroyEditor = () => {
    // 取消防抖操作，确保状态一致
    cancelSaveHistory();
    
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
        undo();
      }
      else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo]);

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
        onReset={resetCropBox}
        onUndo={undo}
        onRedo={redo}
        onCancel={onCancel}
        onCrop={handleCrop}
        canUndo={canUndo}
        canRedo={canRedo}
      />
    </div>
  );
};

export default FabricImageEditor;