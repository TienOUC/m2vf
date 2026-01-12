import { useCallback, useEffect, useRef } from 'react';
import { useCropStore } from '@/lib/stores';
import { useEnhancedCropHistory } from '@/hooks/utils/useEnhancedCropHistory';
import type { Fabric, FabricCanvas, FabricObject } from '@/lib/types/editor/fabric';
import type { CropCoordinates } from '@/lib/types/crop';

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
    currentAspectRatio,
    isOriginalRatio,
    setImageUrl,
    setFabricLoaded,
    setLoadingError,
    setIsProcessing,
    setImageInfo,
    setCropBox,
    updateAspectRatio,
    resetAll
  } = useCropStore();

  // 使用增强的历史记录管理
  const {
    saveHistory: saveCropHistory,
    undo: undoHistory,
    redo: redoHistory,
    clear: clearHistory,
    setInitialState: setHistoryInitialState,
    applyHistoryRecord,
    canUndo,
    canRedo
  } = useEnhancedCropHistory({
    maxHistorySteps: 20,
    autoSave: true,
    saveDelay: 300
  });

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

  // 更新遮罩路径
  const updateMaskClipPath = useCallback(() => {
    if (!canvasRef.current || !cropBox || !maskRef.current) return;

    const canvas = canvasRef.current;
    
    // 这里可以实现更复杂的遮罩逻辑
    canvas.renderAll();
  }, [cropBox]);



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

  // 应用宽高比约束到裁剪框
  const applyAspectRatioConstraint = useCallback((cropBoxObj: FabricObject, aspectRatio: number | null) => {
    if (!cropBoxObj) return;

    // 移除之前的宽高比约束
    cropBoxObj.off('scaling', handleAspectRatioScale);

    if (aspectRatio !== null) {
      // 添加宽高比约束
      cropBoxObj.on('scaling', handleAspectRatioScale);
    } else {
      // 允许自由缩放
      cropBoxObj.set({ 'lockUniScaling': false });
    }

    function handleAspectRatioScale(e: unknown) {
      // 将事件对象转换为具有scaleX和scaleY属性的对象
      const options = e as { scaleX?: number; scaleY?: number };
      const scaleX = options.scaleX || 1;
      const scaleY = options.scaleY || 1;

      if (aspectRatio !== null) {
        // 保持宽高比
        if (Math.abs(scaleX - 1) > Math.abs(scaleY - 1)) {
          // 主要在水平方向缩放
          const width = cropBoxObj.get<number>('width') || 0;
          cropBoxObj.set({ 'scaleY': scaleX, 'height': width / aspectRatio });
        } else {
          // 主要在垂直方向缩放
          const height = cropBoxObj.get<number>('height') || 0;
          cropBoxObj.set({ 'scaleX': scaleY, 'width': height * aspectRatio });
        }
      }
    }
  }, []);

  // 更新裁剪框尺寸以匹配宽高比
  const updateCropBoxForAspectRatio = useCallback((aspectRatio: number | null) => {
    if (!cropBox || !canvasRef.current || !imageInfo) return;

    const currentWidth = cropBox.get('width') || 0;
    const currentHeight = cropBox.get('height') || 0;
    const currentLeft = cropBox.get('left') || 0;
    const currentTop = cropBox.get('top') || 0;

    let newWidth = currentWidth;
    let newHeight = currentHeight;

    if (aspectRatio !== null) {
      // 基于当前宽度计算新高度（保持宽度不变）
      newHeight = newWidth / aspectRatio;
      
      // 确保新高度不超过图片高度
      if (newHeight > imageInfo.scaledHeight) {
        newHeight = imageInfo.scaledHeight;
        newWidth = newHeight * aspectRatio;
      }
      
      // 确保不小于最小尺寸
      if (newWidth < cropBoxConfig.minWidth) {
        newWidth = cropBoxConfig.minWidth;
        newHeight = newWidth / aspectRatio;
      }
      
      if (newHeight < cropBoxConfig.minHeight) {
        newHeight = cropBoxConfig.minHeight;
        newWidth = newHeight * aspectRatio;
      }
      
      // 保持裁剪框中心位置不变
      const newLeft = currentLeft + (currentWidth - newWidth) / 2;
      const newTop = currentTop + (currentHeight - newHeight) / 2;
      
      // 确保裁剪框在图片范围内
      const clampedLeft = Math.max(0, Math.min(newLeft, imageInfo.scaledWidth - newWidth));
      const clampedTop = Math.max(0, Math.min(newTop, imageInfo.scaledHeight - newHeight));
      
      // 应用新的尺寸和位置
      const fabric = fabricRef.current;
      cropBox.animate({
        width: newWidth,
        height: newHeight,
        left: clampedLeft,
        top: clampedTop
      }, {
        duration: 200,
        onChange: () => canvasRef.current?.renderAll(),
        easing: fabric ? fabric.util.ease.easeOutQuad : undefined
      });
      
      // 应用宽高比约束
      applyAspectRatioConstraint(cropBox, aspectRatio);
    } else {
      // 恢复自由缩放
      applyAspectRatioConstraint(cropBox, null);
    }
  }, [cropBox, canvasRef, imageInfo, cropBoxConfig, applyAspectRatioConstraint]);

  // 处理宽高比选择
  const handleAspectRatioChange = useCallback((aspectRatio: number | null) => {
    updateAspectRatio(aspectRatio, aspectRatio === null);
    updateCropBoxForAspectRatio(aspectRatio);
  }, [updateAspectRatio, updateCropBoxForAspectRatio]);

  // 注册裁剪框事件
  const registerCropBoxEvents = useCallback((cropBoxObj: FabricObject) => {
    const handleChange = () => {
      if (canvasRef.current && cropBoxObj && maskRef.current && imageObjRef.current) {
        updateMaskClipPath();
        // 添加到历史记录
        saveCropHistory(cropBoxObj, imageObjRef.current);
      }
    };

    cropBoxObj.on('moving', handleChange);
    cropBoxObj.on('scaling', handleChange);
    cropBoxObj.on('rotating', handleChange);
    
    // 应用当前宽高比约束
    applyAspectRatioConstraint(cropBoxObj, currentAspectRatio);
  }, [saveCropHistory, updateMaskClipPath, currentAspectRatio, applyAspectRatioConstraint]);

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
  }, [cropBox, cropBoxConfig, imageInfo, setCropBox, registerCropBoxEvents, createMaskLayer]);

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
    const prevRecord = undoHistory();
    if (prevRecord && cropBox && imageObjRef.current && canvasRef.current) {
      applyHistoryRecord(prevRecord, cropBox, imageObjRef.current, canvasRef.current);
      // 重建遮罩以反映新的裁剪区域
      updateMaskClipPath();
    }
  }, [undoHistory, applyHistoryRecord, cropBox, updateMaskClipPath]);

  // 重做操作
  const redo = useCallback(() => {
    const nextRecord = redoHistory();
    if (nextRecord && cropBox && imageObjRef.current && canvasRef.current) {
      applyHistoryRecord(nextRecord, cropBox, imageObjRef.current, canvasRef.current);
      // 重建遮罩以反映新的裁剪区域
      updateMaskClipPath();
    }
  }, [redoHistory, applyHistoryRecord, cropBox, updateMaskClipPath]);

  // 重置裁剪框
  const resetCropBox = useCallback(() => {
    createCropBox();
    // createCropBox会更新cropBox状态，使用useEffect监听状态变化来保存历史记录
  }, [createCropBox]);

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
          // 等待下一个渲染周期，确保cropBox和imageObjRef已更新
          setTimeout(() => {
            if (cropBox && imageObjRef.current) {
              setHistoryInitialState(cropBox, imageObjRef.current);
            }
          }, 0);
        }
      });
    }
  }, [fabricLoaded, imageUrl, loadImage, createCropBox, setHistoryInitialState, cropBox]);

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
    currentAspectRatio,
    isOriginalRatio,
    
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
    handleAspectRatioChange,
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