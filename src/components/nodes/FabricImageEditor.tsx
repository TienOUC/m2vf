'use client';

import { useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useFabricCanvas } from '@/hooks/useFabricCanvas';
import { useImageLoader } from '@/hooks/useImageLoader';
import { useCropHistory } from '@/hooks/useCropHistory';
import { createCanvas, createCropBox, createMask, updateMaskClipPath, destroyCanvas } from '@/utils/canvas-utils';
import { calculateCropBoxPosition, calculateCropCoordinates, performCrop } from '@/utils/crop-utils';
import type { FabricImageEditorProps, ImageCropEditorOptions, FabricCanvas, FabricObject } from '@/types/fabric-image-editor';
import CanvasContainer from './CanvasContainer';
import Toolbar from './Toolbar';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

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
    
    // 创建初始画布
    const canvas = createCanvas(canvasRef, fabric, 100, 100);
    if (!canvas) return;

    fabricCanvasRef.current = canvas;
    
    // 加载图片
    const success = await loadImage(imageUrl, canvas, canvasRef);
    if (success) {
      // 确保图片加载完成后立即创建裁剪框和遮罩层
      setTimeout(() => {
        createCropBoxAndMask();
        saveCurrentStateToHistory();
      }, 100);
    }
  };

  // 创建裁剪框和遮罩层
  const createCropBoxAndMask = () => {
    if (!fabricCanvasRef.current || !imageRef.current || !fabricRef.current) return;
    
    const fabric = fabricRef.current;
    const canvas = fabricCanvasRef.current;
    const img = imageRef.current;
    
    const imgWidth = (img.width || 0) * (img.scaleX || 1);
    const imgHeight = (img.height || 0) * (img.scaleY || 1);
    
    // 计算裁剪框位置和尺寸
    const cropBoxConfig = calculateCropBoxPosition(
      img.width || 0,
      img.height || 0,
      img.scaleX || 1,
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
    
    // 添加裁剪框事件监听
    cropBox.on('moving', () => handleCropBoxChange());
    cropBox.on('scaling', () => handleCropBoxChange());
    cropBox.on('rotating', () => handleCropBoxChange());
    
    cropBoxRef.current = cropBox;
    canvas.add(cropBox);
    canvas.setActiveObject(cropBox);
    
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

    // 创建新遮罩层
    const maskGroup = createMask(fabric, canvas, cropBox);
    if (!maskGroup) return;

    maskRef.current = maskGroup;

    // 将遮罩层添加到图片之上，裁剪框之下
    canvas.add(maskGroup);
    canvas.sendObjectToBack(img);
    canvas.bringObjectToFront(cropBox);
    canvas.renderAll();
  };

  // 处理裁剪框变化
  const handleCropBoxChange = () => {
    if (fabricCanvasRef.current && cropBoxRef.current && maskRef.current) {
      updateMaskClipPath(fabricCanvasRef.current, cropBoxRef.current, maskRef.current);
      debouncedSaveHistory();
    }
  };

  // 保存当前状态到历史记录
  const saveCurrentStateToHistory = () => {
    if (!fabricCanvasRef.current || !cropBoxRef.current || !imageRef.current) return;

    const cropBox = cropBoxRef.current;
    const img = imageRef.current;

    saveHistory(cropBox, img);
  };

  // 使用防抖函数
  const { debouncedCallback: debouncedSaveHistory } = useDebounce(
    saveCurrentStateToHistory,
    300
  );

  // 撤销操作
  const undo = () => {
    const previousState = undoHistory();
    if (previousState) {
      restoreFromHistory(previousState, cropBoxRef.current, imageRef.current, fabricCanvasRef.current);
      updateMaskClipPath(fabricCanvasRef.current, cropBoxRef.current, maskRef.current);
    }
  };

  // 重做操作
  const redo = () => {
    const nextState = redoHistory();
    if (nextState) {
      restoreFromHistory(nextState, cropBoxRef.current, imageRef.current, fabricCanvasRef.current);
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
    saveCurrentStateToHistory();
  };

  // 销毁编辑器
  const destroyEditor = () => {
    destroyCanvas(fabricCanvasRef.current);
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
      <CanvasContainer canvasRef={canvasRef} />
      <Toolbar
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