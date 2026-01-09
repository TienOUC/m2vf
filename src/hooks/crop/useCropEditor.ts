import { useCallback, useEffect, useRef } from 'react';
import { useCropStore, useCropHistoryStore } from '@/lib/stores';
import type { Fabric, FabricCanvas, FabricObject } from '@/types/editor/fabric';
import type { CropCoordinates, CropResult } from '@/types/crop';

interface UseCropEditorProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

/**
 * 裁剪编辑器主hook
 * 整合所有裁剪相关功能的核心hook
 */
export const useCropEditor = ({ imageUrl, onCropComplete, onCancel }: UseCropEditorProps) => {
  // 状态管理
  const {
    fabricLoaded,
    loadingError,
    isProcessing,
    imageInfo,
    mode,
    isActive,
    isDragging,
    cropBox,
    cropBoxConfig,
    maskOpacity,
    showMask,
    selection,
    setImageUrl,
    setFabricLoaded,
    setLoadingError,
    setIsProcessing,
    setImageInfo,
    setMode,
    setIsActive,
    setIsDragging,
    setCropBox,
    updateCropBoxConfig,
    setMaskOpacity,
    setShowMask,
    updateSelection,
    resetCropState,
    resetAll
  } = useCropStore();

  const {
    canUndo,
    canRedo,
    addToHistory,
    undo: undoHistory,
    redo: redoHistory,
    clearHistory
  } = useCropHistoryStore();

  // 引用管理
  const fabricRef = useRef<Fabric | null>(null);
  const canvasRef = useRef<FabricCanvas | null>(null);
  const imageObjRef = useRef<FabricObject | null>(null);
  const maskRef = useRef<FabricObject | null>(null);

  // 初始化Fabric
  const initializeFabric = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && !fabricRef.current) {
        const fabricModule = await import('fabric');
        fabricRef.current = fabricModule.default || fabricModule;
        setFabricLoaded(true);
      }
    } catch (error) {
      console.error('Failed to load fabric.js:', error);
      setLoadingError('Failed to load fabric.js. Please refresh the page.');
    }
  }, [setFabricLoaded, setLoadingError]);

  // 加载图片
  const loadImage = useCallback(async (url: string) => {
    if (!canvasRef.current || !fabricRef.current || !url) return false;

    const fabric = fabricRef.current;
    
    try {
      setIsProcessing(true);
      
      const img = await fabric.Image.fromURL(url, {
        crossOrigin: 'anonymous'
      });

      if (!img) {
        setLoadingError('Failed to load image.');
        return false;
      }

      imageObjRef.current = img;

      // 计算图片尺寸和缩放
      const imgWidth = img.width || 0;
      const imgHeight = img.height || 0;
      
      if (imgWidth === 0 || imgHeight === 0) {
        setLoadingError('Invalid image dimensions.');
        return false;
      }

      const viewportWidth = window.innerWidth * 0.8;
      const viewportHeight = window.innerHeight * 0.8;
      const aspectRatio = imgWidth / imgHeight;
      
      let scale: number;
      if (aspectRatio >= 1) {
        scale = Math.min(viewportWidth / imgWidth, viewportHeight / imgHeight);
      } else {
        scale = Math.min(viewportHeight / imgHeight, viewportWidth / imgWidth);
      }

      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;

      // 更新Canvas尺寸
      canvasRef.current.setDimensions({ width: scaledWidth, height: scaledHeight });
      
      // 设置图片属性
      img.set({
        left: 0,
        top: 0,
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top'
      });

      // 添加到Canvas
      canvasRef.current.add(img);
      canvasRef.current.sendObjectToBack(img);
      canvasRef.current.renderAll();

      // 更新图片信息状态
      setImageInfo({
        url,
        naturalWidth: imgWidth,
        naturalHeight: imgHeight,
        scaledWidth,
        scaledHeight,
        aspectRatio,
        scale,
        left: 0,
        top: 0
      });

      setIsProcessing(false);
      return true;
    } catch (error) {
      console.error('Image loading error:', error);
      setLoadingError('Failed to load image.');
      setIsProcessing(false);
      return false;
    }
  }, [setIsProcessing, setLoadingError, setImageInfo]);

  // 创建裁剪框
  const createCropBox = useCallback(() => {
    if (!canvasRef.current || !fabricRef.current || !imageInfo) return;

    const fabric = fabricRef.current;
    const canvas = canvasRef.current;

    // 移除现有的裁剪框
    if (cropBox) {
      canvas.remove(cropBox);
    }

    // 计算裁剪框初始位置和尺寸
    const scaleFactor = 0.8;
    let cropWidth = imageInfo.scaledWidth * scaleFactor;
    let cropHeight = imageInfo.scaledHeight * scaleFactor;
    
    cropWidth = Math.max(cropWidth, cropBoxConfig.minWidth);
    cropHeight = Math.max(cropHeight, cropBoxConfig.minHeight);
    cropWidth = Math.min(cropWidth, imageInfo.scaledWidth);
    cropHeight = Math.min(cropHeight, imageInfo.scaledHeight);

    const cropBoxLeft = (imageInfo.scaledWidth - cropWidth) / 2;
    const cropBoxTop = (imageInfo.scaledHeight - cropHeight) / 2;

    const newCropBox = new fabric.Rect({
      width: cropWidth,
      height: cropHeight,
      left: cropBoxLeft,
      top: cropBoxTop,
      fill: 'transparent',
      stroke: cropBoxConfig.stroke,
      strokeWidth: cropBoxConfig.strokeWidth,
      strokeDashArray: cropBoxConfig.strokeDashArray,
      cornerSize: cropBoxConfig.cornerSize,
      cornerColor: cropBoxConfig.cornerColor,
      cornerStyle: 'rect',
      transparentCorners: false,
      hasControls: true,
      hasBorders: true,
      lockRotation: true,
      lockUniScaling: false,
      minWidth: cropBoxConfig.minWidth,
      minHeight: cropBoxConfig.minHeight,
      borderColor: cropBoxConfig.stroke,
      borderScaleFactor: 1,
      padding: 0,
      moveCursor: 'move',
      hoverCursor: 'move',
      originX: 'left',
      originY: 'top',
      _controlsVisibility: {
        tl: true,
        tr: true,
        bl: true,
        br: true,
        ml: true,
        mr: true,
        mb: true,
        mt: false
      }
    });

    // 注册事件监听器
    registerCropBoxEvents(newCropBox);

    setCropBox(newCropBox);
    canvas.add(newCropBox);
    canvas.setActiveObject(newCropBox);
    canvas.renderAll();

    // 创建遮罩层
    createMaskLayer();
  }, [cropBox, cropBoxConfig, imageInfo, setCropBox]);

  // 注册裁剪框事件
  const registerCropBoxEvents = useCallback((cropBoxObj: FabricObject) => {
    const handleChange = () => {
      if (canvasRef.current && cropBoxObj && maskRef.current) {
        updateMaskClipPath();
        // 添加到历史记录
        const currentState = getCurrentState();
        addToHistory(currentState);
      }
    };

    cropBoxObj.on('moving', handleChange);
    cropBoxObj.on('scaling', handleChange);
    cropBoxObj.on('rotating', handleChange);
  }, [addToHistory]);

  // 创建遮罩层
  const createMaskLayer = useCallback(() => {
    if (!canvasRef.current || !fabricRef.current || !cropBox || !imageInfo) return;

    const fabric = fabricRef.current;
    const canvas = canvasRef.current;

    // 移除现有遮罩
    if (maskRef.current) {
      canvas.remove(maskRef.current);
    }

    // 创建遮罩层
    const maskLayer = new fabric.Rect({
      left: 0,
      top: 0,
      width: imageInfo.scaledWidth,
      height: imageInfo.scaledHeight,
      fill: 'rgba(0, 0, 0, 0.7)',
      opacity: maskOpacity,
      selectable: false,
      evented: false,
      originX: 'left',
      originY: 'top'
    });

    maskRef.current = maskLayer;
    canvas.add(maskLayer);
    canvas.sendObjectToBack(maskLayer);
    canvas.bringObjectToFront(cropBox);
    canvas.renderAll();
  }, [cropBox, imageInfo, maskOpacity]);

  // 更新遮罩路径
  const updateMaskClipPath = useCallback(() => {
    if (!canvasRef.current || !cropBox || !maskRef.current) return;

    const canvas = canvasRef.current;
    const boundingRect = cropBox.getBoundingRect(true);
    
    // 这里可以实现更复杂的遮罩逻辑
    canvas.renderAll();
  }, [cropBox]);

  // 获取当前状态
  const getCurrentState = useCallback((): any => {
    // 返回当前完整的裁剪状态
    return {
      // 这里应该返回完整的状态对象
    };
  }, []);

  // 执行裁剪
  const handleCrop = useCallback(async () => {
    if (!imageInfo || !cropBox || !imageUrl) return;

    setIsProcessing(true);

    try {
      // 计算裁剪坐标
      const coordinates: CropCoordinates = {
        cropLeft: (cropBox.left || 0) / imageInfo.scale,
        cropTop: (cropBox.top || 0) / imageInfo.scale,
        cropWidth: (cropBox.width || 0) / imageInfo.scale,
        cropHeight: (cropBox.height || 0) / imageInfo.scale,
        imgLeft: imageInfo.left,
        imgTop: imageInfo.top,
        imgScaleX: imageInfo.scale,
        imgScaleY: imageInfo.scale
      };

      // 执行裁剪操作
      const croppedImageUrl = await performCrop(imageUrl, coordinates);

// 传递裁剪后的图片URL给回调函数
      onCropComplete(croppedImageUrl);
    } catch (error) {
      console.error('Crop failed:', error);
      setLoadingError('Failed to crop image.');
    } finally {
      setIsProcessing(false);
    }
  }, [imageInfo, cropBox, imageUrl, setIsProcessing, setLoadingError, onCropComplete]);

  // 撤销操作
  const undo = useCallback(() => {
    const prevState = undoHistory();
    if (prevState) {
      restoreState(prevState);
    }
  }, [undoHistory]);

  // 重做操作
  const redo = useCallback(() => {
    const nextState = redoHistory();
    if (nextState) {
      restoreState(nextState);
    }
  }, [redoHistory]);

  // 恢复状态
  const restoreState = useCallback((state: any) => {
    // 实现状态恢复逻辑
  }, []);

  // 重置裁剪框
  const resetCropBox = useCallback(() => {
    createCropBox();
    const currentState = getCurrentState();
    addToHistory(currentState);
  }, [createCropBox, getCurrentState, addToHistory]);

  // 销毁编辑器
  const destroyEditor = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.dispose();
    }
    resetAll();
    clearHistory();
  }, [resetAll, clearHistory]);

  // 初始化
  useEffect(() => {
    setImageUrl(imageUrl);
    initializeFabric();
  }, [imageUrl, setImageUrl, initializeFabric]);

  // 图片加载和初始化
  useEffect(() => {
    if (fabricLoaded && imageUrl) {
      loadImage(imageUrl).then(success => {
        if (success) {
          createCropBox();
          const initialState = getCurrentState();
          addToHistory(initialState);
        }
      });
    }
  }, [fabricLoaded, imageUrl, loadImage, createCropBox, getCurrentState, addToHistory]);

  // 清理
  useEffect(() => {
    return () => {
      destroyEditor();
    };
  }, [destroyEditor]);

  return {
    // 状态
    fabricLoaded,
    loadingError,
    isProcessing,
    mode,
    isActive,
    isDragging,
    canUndo,
    canRedo,
    
    // 引用
    fabricRef,
    canvasRef,
    imageObjRef,
    maskRef,
    
    // 方法
    handleCrop,
    undo,
    redo,
    resetCropBox,
    onCancel,
    destroyEditor
  };
};

// 辅助函数
const performCrop = (imageUrl: string, coordinates: CropCoordinates): Promise<string> => {
  return new Promise((resolve) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = coordinates.cropWidth;
    tempCanvas.height = coordinates.cropHeight;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) {
      resolve('');
      return;
    }

    const originalImage = new Image();
    originalImage.crossOrigin = 'anonymous';

    originalImage.onload = () => {
      tempCtx.drawImage(
        originalImage,
        coordinates.cropLeft,
        coordinates.cropTop,
        coordinates.cropWidth,
        coordinates.cropHeight,
        0,
        0,
        coordinates.cropWidth,
        coordinates.cropHeight
      );

      const croppedImageUrl = tempCanvas.toDataURL('image/png');
      resolve(croppedImageUrl);
    };

    originalImage.onerror = () => {
      resolve('');
    };

    originalImage.src = imageUrl;
  });
};