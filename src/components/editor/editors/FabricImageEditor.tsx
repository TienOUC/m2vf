'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useFabricCanvas } from '@/hooks/utils/useFabricCanvas';
import { useImageLoader } from '@/hooks/utils/useImageLoader';
import { useEnhancedCropHistory } from '@/hooks/utils/useEnhancedCropHistory';
import { createCanvas, createCropBox, createMask, updateMaskClipPath, destroyCanvas } from '@/lib/utils/fabric';
import { calculateCropBoxPosition, calculateCropCoordinates, performCrop } from '@/lib/utils/fabric/crop';
import type { FabricImageEditorProps, FabricCanvas, FabricObject, ImageCropEditorOptions } from '@/lib/types/editor/fabric';
import { EditorContainer, CropOperationsToolbar, LoadingState, ErrorState } from '@/components/editor';

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
        const croppedImageBlob = await performCrop(imageUrl, coordinates);
        
        // 调用回调函数返回裁剪结果
        onCropComplete(croppedImageBlob);
      } catch (error) {
        console.error('Crop operation failed:', error);
        // 可以考虑添加错误提示给用户
        // 发生错误时不传递空字符串，而是直接打印错误，或者调用一个错误回调
      }
    }
  };
  
  // 使用增强的历史记录管理（仅用于保存状态）
  const {
    saveHistory: saveCropHistory,
    setInitialState,
    undo,
    redo,
    canUndo,
    canRedo
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
    
    // 获取图片边界（视觉尺寸）
    const imgBounds = img.getBoundingRect(true);
    const imgLeft = imgBounds.left;
    const imgTop = imgBounds.top;
    const imgWidth = imgBounds.width;
    const imgHeight = imgBounds.height;
    
    // 获取裁剪框当前视觉状态
    const currentScaleX = cropBox.scaleX || 1;
    const currentScaleY = cropBox.scaleY || 1;
    // 使用 getScaledWidth/Height 获取视觉尺寸，或者手动计算
    const currentWidth = cropBox.getScaledWidth ? cropBox.getScaledWidth() : (cropBox.width || 0) * currentScaleX;
    const currentHeight = cropBox.getScaledHeight ? cropBox.getScaledHeight() : (cropBox.height || 0) * currentScaleY;
    const currentLeft = cropBox.left || 0;
    const currentTop = cropBox.top || 0;
    
    const aspectRatio = cropBox.get('aspectRatio') as number | undefined;
    const lockAspectRatio = cropBox.get('lockAspectRatio') || false;
    
    // 使用默认配置中的最小尺寸
    const minWidth = defaultOptions.minCropSize?.width || 100;
    const minHeight = defaultOptions.minCropSize?.height || 100;
    
    // 初始值设为当前视觉值
    let newLeft = currentLeft;
    let newTop = currentTop;
    let newWidth = currentWidth;
    let newHeight = currentHeight;
    
    // 1. 应用宽高比约束
    if (lockAspectRatio && typeof aspectRatio === 'number') {
      // 确保宽度和高度严格符合宽高比
      // 优先保持宽度，调整高度
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
    // 动态计算有效最小尺寸：不能超过图片本身尺寸
    const effectiveMinWidth = Math.min(minWidth, imgWidth);
    const effectiveMinHeight = Math.min(minHeight, imgHeight);

    if (newWidth < effectiveMinWidth || newHeight < effectiveMinHeight) {
      if (lockAspectRatio && typeof aspectRatio === 'number') {
        // 保持宽高比约束：确保宽高都不小于最小值
        const targetW = Math.max(effectiveMinWidth, effectiveMinHeight * aspectRatio);
        newWidth = Math.min(targetW, imgWidth);
        newHeight = newWidth / aspectRatio;
        
        if (newHeight > imgHeight) {
          newHeight = imgHeight;
          newWidth = newHeight * aspectRatio;
        }
      } else {
        // 没有宽高比约束，直接应用最小尺寸
        newWidth = Math.max(effectiveMinWidth, newWidth);
        newHeight = Math.max(effectiveMinHeight, newHeight);
      }
    }
    
    // 4. 确保裁剪框完全在图片范围内
    // 计算裁剪框的最大允许位置
    const maxLeft = imgLeft + imgWidth - newWidth;
    const maxTop = imgTop + imgHeight - newHeight;
    
    // 确保裁剪框不超出图片范围
    newLeft = Math.max(imgLeft, Math.min(newLeft, maxLeft));
    newTop = Math.max(imgTop, Math.min(newTop, maxTop));
    
    // 5. 变化检测与应用
    // 检查是否有实质性变化（位置或尺寸）
    // 注意：即使尺寸数值没变，如果 scale 不为 1，我们也需要重置它
    const hasScale = Math.abs(currentScaleX - 1) > 0.001 || Math.abs(currentScaleY - 1) > 0.001;
    const hasDimChange = Math.abs(currentWidth - newWidth) > 0.1 || Math.abs(currentHeight - newHeight) > 0.1;
    const hasPosChange = Math.abs(currentLeft - newLeft) > 0.1 || Math.abs(currentTop - newTop) > 0.1;

    if (hasScale || hasDimChange || hasPosChange) {
      cropBox.set({
        left: newLeft,
        top: newTop,
        width: newWidth,
        height: newHeight,
        scaleX: 1, // 强制重置缩放
        scaleY: 1
      });
      cropBox.setCoords();
    }
  }, [defaultOptions.minCropSize]);
  
  // 处理撤销操作
  const handleUndo = useCallback(() => {
    if (!fabricCanvasRef.current || !cropBoxRef.current || !imageRef.current) return;
    
    const result = undo();
    if (result) {
      // 恢复状态到画布
      const { cropBox: cropBoxState } = result;
      const cropBox = cropBoxRef.current;
      const canvas = fabricCanvasRef.current;
      const img = imageRef.current;
      
      // 应用裁剪框状态
      cropBox.set(cropBoxState);
      cropBox.setCoords();
      
      // 确保裁剪框在合法范围内
      constrainCropBox(cropBox, img);
      
      // 更新遮罩
      if (maskRef.current) {
        updateMaskClipPath(canvas, cropBox, maskRef.current);
      }
      
      canvas.renderAll();
    }
  }, [undo, constrainCropBox, updateMaskClipPath]);

  // 处理重做操作
  const handleRedo = useCallback(() => {
    if (!fabricCanvasRef.current || !cropBoxRef.current || !imageRef.current) return;
    
    const result = redo();
    if (result) {
      // 恢复状态到画布
      const { cropBox: cropBoxState } = result;
      const cropBox = cropBoxRef.current;
      const canvas = fabricCanvasRef.current;
      const img = imageRef.current;
      
      // 应用裁剪框状态
      cropBox.set(cropBoxState);
      cropBox.setCoords();
      
      // 确保裁剪框在合法范围内
      constrainCropBox(cropBox, img);
      
      // 更新遮罩
      if (maskRef.current) {
        updateMaskClipPath(canvas, cropBox, maskRef.current);
      }
      
      canvas.renderAll();
    }
  }, [redo, constrainCropBox, updateMaskClipPath]);
  
  // 处理宽高比变化
  const handleAspectRatioChange = useCallback((aspectRatio: number | null) => {
    // 处理原图比例的特殊值 -1
    let targetRatio = aspectRatio;
    
    if (aspectRatio === -1 && imageRef.current) {
      // 动态计算原图比例
      const img = imageRef.current;
      // 使用 getScaledWidth/Height 获取准确的显示尺寸
      targetRatio = img.getScaledWidth() / img.getScaledHeight();
    }
    
    // 将状态更新移到最后，避免 React 渲染干扰 Canvas 绘制
    // setCurrentAspectRatio(aspectRatio); 
    
    // 如果有裁剪框，应用新的宽高比约束并调整尺寸
    if (cropBoxRef.current && imageRef.current && fabricCanvasRef.current) {
      const cropBox = cropBoxRef.current;
      const canvas = fabricCanvasRef.current;
      const img = imageRef.current;
      
      // 1. 设置自定义属性，供 constrainCropBox 使用
      cropBox.set({
        lockAspectRatio: targetRatio !== null,
        aspectRatio: targetRatio !== null ? targetRatio : undefined
      });

      // 如果是自由比例，不需要调整尺寸
      if (targetRatio === null) {
        // 继续执行，确保状态更新
      } else {
        // 2. 获取图片边界信息 (使用 getScaledWidth/Height 更可靠)
        const imgWidth = img.getScaledWidth();
        const imgHeight = img.getScaledHeight();
        const imgLeft = img.left || 0;
        const imgTop = img.top || 0;
        
        // 3. 获取当前裁剪框信息
        const currentWidth = cropBox.getScaledWidth();
        const currentHeight = cropBox.getScaledHeight();
        const currentLeft = cropBox.left || 0;
        const currentTop = cropBox.top || 0;
        const centerX = currentLeft + currentWidth / 2;
        const centerY = currentTop + currentHeight / 2;
        
        // 4. 计算新尺寸：尝试保持面积不变
        const currentArea = currentWidth * currentHeight;
        let newHeight = Math.sqrt(currentArea / targetRatio);
        let newWidth = newHeight * targetRatio;
        
        // 5. 边界约束检查
        
        // 5.1 检查最大尺寸限制 (不能超过图片)
        if (newWidth > imgWidth) {
          newWidth = imgWidth;
          newHeight = newWidth / targetRatio;
        }
        
        if (newHeight > imgHeight) {
          newHeight = imgHeight;
          newWidth = newHeight * targetRatio;
        }
        
        // 5.2 检查最小尺寸限制
        const minWidth = defaultOptions.minCropSize?.width || 100;
        const minHeight = defaultOptions.minCropSize?.height || 100;
        
        // 确保不小于最小尺寸，同时不超过图片尺寸
        const effectiveMinWidth = Math.min(minWidth, imgWidth);
        const effectiveMinHeight = Math.min(minHeight, imgHeight);
        
        if (newWidth < effectiveMinWidth) {
          newWidth = effectiveMinWidth;
          newHeight = newWidth / targetRatio;
        }
        
        if (newHeight < effectiveMinHeight) {
          newHeight = effectiveMinHeight;
          newWidth = newHeight * targetRatio;
        }
        
        // 6. 计算新位置：保持中心点不变
        let newLeft = centerX - newWidth / 2;
        let newTop = centerY - newHeight / 2;
        
        // 7. 位置边界约束
        // 确保不超出左/上边界
        newLeft = Math.max(newLeft, imgLeft);
        newTop = Math.max(newTop, imgTop);
        
        // 确保不超出右/下边界
        if (newLeft + newWidth > imgLeft + imgWidth) {
          newLeft = imgLeft + imgWidth - newWidth;
        }
        if (newTop + newHeight > imgTop + imgHeight) {
          newTop = imgTop + imgHeight - newHeight;
        }
        
        // 8. 应用新状态
        cropBox.set({
          width: newWidth,
          height: newHeight,
          scaleX: 1,
          scaleY: 1,
          left: newLeft,
          top: newTop
        });
        
        cropBox.setCoords();
      }
      
      // 9. 更新遮罩
      if (maskRef.current) {
        updateMaskClipPath(canvas, cropBox, maskRef.current);
      }
      
      canvas.renderAll();
    }
    
    // 最后更新 React 状态，减少对 Canvas 渲染的干扰
    setCurrentAspectRatio(aspectRatio);
    
  }, [defaultOptions.minCropSize, updateMaskClipPath]);

  // 新增重置功能
  const handleReset = useCallback(() => {
    if (!fabricCanvasRef.current || !imageRef.current || !cropBoxRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const img = imageRef.current;
    const cropBox = cropBoxRef.current;
    
    // 重置为自由比例
    setCurrentAspectRatio(null);
    
    // 重新计算并应用初始裁剪框（通常是覆盖大部分图片）
    const imgBounds = img.getBoundingRect(true);
    const imgWidth = imgBounds.width;
    const imgHeight = imgBounds.height;
    
    // 使用 calculateCropBoxPosition 重置到默认的 80% 大小居中
    const cropBoxConfig = calculateCropBoxPosition(
      imgWidth,
      imgHeight,
      1,
      defaultOptions.minCropSize || { width: 100, height: 100 }
    );
    
    cropBox.set({
      ...cropBoxConfig,
      lockAspectRatio: false,
      aspectRatio: undefined
    });
    
    cropBox.setCoords();
    
    if (maskRef.current) {
      updateMaskClipPath(canvas, cropBox, maskRef.current);
    }
    
    canvas.renderAll();
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
            
            // 确保创建后立即渲染
            canvas.renderAll();
          }
        })();
      }
      
      // 显式调用渲染，因为 updateMaskClipPath 和 constrainCropBox 不再自动渲染
      canvas.renderAll();
      
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
    // 直接同步处理事件，避免缩放时的视觉抖动（尤其是 scaling 事件需要立即重置 scale 为 1）
    // 历史记录保存已有单独的节流控制，此处无需担心性能问题
    cropBox.on('moving', handleCropBoxChange);
    cropBox.on('scaling', handleCropBoxChange);
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
    
    // 确保所有创建操作完成后渲染一次
    canvas.renderAll();
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
      <CropOperationsToolbar
        onCancel={onCancel}
        onCrop={handleCrop}
        currentAspectRatio={currentAspectRatio}
        onAspectRatioChange={handleAspectRatioChange}
        onReset={handleReset}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo()}
        canRedo={canRedo()}
      />
    </div>
  );
};

export default FabricImageEditor;