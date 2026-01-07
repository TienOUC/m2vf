'use client';

import { useEffect, useRef, useState } from 'react';
import type { ImageCropEditorOptions, CropHistoryRecord } from '@/types/image-editor'; 
import { useHistory } from '@/hooks/useHistory';
import { useDebounce } from '@/hooks/useDebounce';

// fabric.js 类型声明
type Fabric = any;

interface FabricImageEditorProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

const FabricImageEditor: React.FC<FabricImageEditorProps> = ({ imageUrl, onCropComplete, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any>(null);
  const imageRef = useRef<any>(null);
  const cropBoxRef = useRef<any>(null);
  const maskRef = useRef<any>(null);
  const fabricRef = useRef<Fabric | null>(null);
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  const { save: saveHistory, undo: undoHistory, redo: redoHistory, canUndo, canRedo } = useHistory<CropHistoryRecord>(5);
  
  // 默认配置 - 全屏显示，图片放大展示
  const defaultOptions: ImageCropEditorOptions = {
    imageUrl,
    // 使用适当的尺寸，不超过可视区域的90%
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
    maskStyle: {
      color: '#000000',
      opacity: 0.7
    },
    initialRatio: 1
  };

  // 加载 fabric.js
  useEffect(() => {
    const loadFabric = async () => {
      try {
        if (typeof window !== 'undefined' && !fabricRef.current) {
          // 使用动态导入加载 fabric.js
          const fabricModule = await import('fabric');
          fabricRef.current = fabricModule.default || fabricModule;
          setFabricLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load fabric.js:', error);
        setLoadingError('Failed to load fabric.js. Please refresh the page.');
      }
    };

    loadFabric();
    
    // 清理函数
    return () => {
      // 确保组件卸载时，重置状态
      setFabricLoaded(false);
      fabricRef.current = null;
    };
  }, []);

  // 初始化画布
  const initCanvas = () => {
    if (!canvasRef.current || !fabricRef.current) return;

    const fabric = fabricRef.current;

    // 创建fabric画布 - 使用适当尺寸，白色背景
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: defaultOptions.canvasWidth,
      height: defaultOptions.canvasHeight,
      preserveObjectStacking: true,
      selection: false,
      backgroundColor: '#ffffff', // 白色背景，确保图片可见
      // 添加渲染配置
      renderOnAddRemove: true,
      skipTargetFind: false,
    });

    fabricCanvasRef.current = canvas;
    loadImage(imageUrl);
  };

  // 加载图片并适配尺寸
  const loadImage = (url: string) => {
    if (!fabricCanvasRef.current || !fabricRef.current) return;
    
    const fabric = fabricRef.current;
    const canvas = fabricCanvasRef.current;

    // 检查 URL 是否有效
    if (!url || typeof url !== 'string' || url.length === 0) {
      setLoadingError('Invalid image URL provided.');
      return;
    }

    // 清空画布上所有对象，确保重新加载
    canvas.clear();
    imageRef.current = null;
    maskRef.current = null;
    cropBoxRef.current = null;

    // 使用 fabric.Image.fromURL 加载图片（Promise 方式）
    fabric.Image.fromURL(url, {
      crossOrigin: 'anonymous'
    })
    .then((img: any) => {
      if (!img) {
        setLoadingError('Failed to load image.');
        return;
      }

      if (!canvas) return;

      imageRef.current = img;

      // 计算图片适配尺寸（保持比例，放大预览显示）
      const canvasWidth = canvas.width || defaultOptions.canvasWidth;
      const canvasHeight = canvas.height || defaultOptions.canvasHeight;
      const imgWidth = img.width;
      const imgHeight = img.height;

      // 如果图片尺寸为0，说明加载失败
      if (imgWidth === 0 || imgHeight === 0) {
        setLoadingError('Failed to load image - invalid dimensions.');
        return;
      }

      // 计算缩放比例 - 图片放大预览，占满可视区域的80-90%
      // 优先使用较大的缩放比例，让图片更清晰可见
      const scaleX = (canvasWidth * 0.85) / imgWidth;
      const scaleY = (canvasHeight * 0.85) / imgHeight;
      const scaleToFit = Math.min(scaleX, scaleY);
      
      // 如果原图较小，放大显示（至少放大1.2倍）
      // 如果原图较大，缩小到合适尺寸（不超过画布的90%）
      const minScale = Math.max(scaleToFit, 1.2); // 至少放大1.2倍
      const maxScaleX = (canvasWidth * 0.95) / imgWidth;
      const maxScaleY = (canvasHeight * 0.95) / imgHeight;
      const maxScale = Math.min(maxScaleX, maxScaleY);
      const scale = Math.min(minScale, maxScale); // 取较小值，确保图片完全显示

      // 计算图片位置（居中显示）
      const left = (canvasWidth - imgWidth * scale) / 2;
      const top = (canvasHeight - imgHeight * scale) / 2;

      // 设置图片属性
      img.set({
        left,
        top,
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false
      });

      // 添加图片到画布
      canvas.add(img);
      
      // 确保图片在最底层
      canvas.sendObjectToBack(img);

      // 创建遮罩层（覆盖整个画布）
      createMask();

      // 创建裁剪框（在遮罩层上方）
      createCropBox();

      // 保存初始状态到历史记录
      saveCurrentStateToHistory();
      
      // 先更新遮罩层的孔，创建完整的遮罩层
      updateMaskHole();
      // 确保裁剪框在最上方
      canvas.bringObjectToFront(cropBoxRef.current);
      // 渲染画布
      canvas.renderAll();
    })
    .catch((error: any) => {
      setLoadingError('Failed to load image.');
      console.error('Image loading error:', error);
    });
  };

  // 创建遮罩层 - 覆盖整个画布
  const createMask = () => {
    console.log('createMask')
    if (!fabricCanvasRef.current || !imageRef.current || !fabricRef.current) return;
    
    const fabric = fabricRef.current;
    const canvas = fabricCanvasRef.current;

    // 移除旧的遮罩层
    if (maskRef.current) {
      canvas.remove(maskRef.current);
    }

    // 初始化遮罩引用为 null，等待 updateMaskHole 创建真正的遮罩
    maskRef.current = null;
  };

  // 创建裁剪框
  const createCropBox = () => {
   console.log('createCropBox')
    if (!fabricCanvasRef.current || !imageRef.current || !fabricRef.current) return;
    const fabric = fabricRef.current;
    const canvas = fabricCanvasRef.current;
    const img = imageRef.current;
    
    const imgWidth = (img.width || 0) * (img.scaleX || 1);
    const imgHeight = (img.height || 0) * (img.scaleY || 1);
    const imgLeft = img.left || 0;
    const imgTop = img.top || 0;

    // 计算裁剪框初始尺寸（默认1:1比例，最大不超过图片尺寸，最小100x100）
    const initialSize = Math.min(
      Math.min(imgWidth, imgHeight),
      300
    );

    // 计算裁剪框初始位置（居中）
    const left = imgLeft + (imgWidth - initialSize) / 2;
    const top = imgTop + (imgHeight - initialSize) / 2;

    // 创建裁剪框 - 可自由拖动和调整大小
    const cropBox = new fabric.Rect({
      left,
      top,
      width: initialSize,
      height: initialSize,
      fill: 'transparent',
      stroke: defaultOptions.cropBoxStyle?.borderColor || '#ffffff',
      strokeWidth: defaultOptions.cropBoxStyle?.borderWidth || 2,
      strokeDashArray: [5, 5], // 虚线边框
      cornerSize: defaultOptions.cropBoxStyle?.cornerSize || 12, // 增大控制点
      cornerColor: defaultOptions.cropBoxStyle?.cornerColor || '#ffffff',
      cornerStyle: 'circle', // 圆形控制点，更美观
      transparentCorners: false,
      hasControls: true, // 启用控制点，可以调整大小
      hasBorders: true, // 启用边框
      lockRotation: true, // 锁定旋转
      lockUniScaling: false, // 允许非等比缩放
      minWidth: defaultOptions.minCropSize?.width || 100,
      minHeight: defaultOptions.minCropSize?.height || 100,
      borderColor: defaultOptions.cropBoxStyle?.borderColor || '#ffffff',
      borderScaleFactor: 1,
      padding: 0,
      moveCursor: 'move', // 移动时的光标
      hoverCursor: 'move' // 悬停时的光标
    });

    // 监听裁剪框变化事件
    cropBox.on('moving', (e: any) => {
      // 限制裁剪框在图片范围内移动
      const currentCanvas = fabricCanvasRef.current;
      const img = imageRef.current;
      if (img && currentCanvas) {
        const imgLeft = img.left || 0;
        const imgTop = img.top || 0;
        const imgWidth = (img.width || 0) * (img.scaleX || 1);
        const imgHeight = (img.height || 0) * (img.scaleY || 1);
        const cropWidth = cropBox.width || 0;
        const cropHeight = cropBox.height || 0;
        
        // 限制移动范围
        const newLeft = Math.max(imgLeft, Math.min(e.target.left, imgLeft + imgWidth - cropWidth));
        const newTop = Math.max(imgTop, Math.min(e.target.top, imgTop + imgHeight - cropHeight));
        
        cropBox.set({
          left: newLeft,
          top: newTop
        });
        currentCanvas.renderAll();
      }
      debouncedSaveHistory();
    });
    
    cropBox.on('scaling', (e: any) => {
      // 限制裁剪框在图片范围内缩放
      const currentCanvas = fabricCanvasRef.current;
      const img = imageRef.current;
      if (img && currentCanvas) {
        const imgLeft = img.left || 0;
        const imgTop = img.top || 0;
        const imgWidth = (img.width || 0) * (img.scaleX || 1);
        const imgHeight = (img.height || 0) * (img.scaleY || 1);
        
        const targetCropBox = e.target;
        const cropLeft = targetCropBox.left || 0;
        const cropTop = targetCropBox.top || 0;
        const cropWidth = targetCropBox.width || 0;
        const cropHeight = targetCropBox.height || 0;
        
        // 确保裁剪框不超出图片范围
        let newLeft = cropLeft;
        let newTop = cropTop;
        let newWidth = cropWidth;
        let newHeight = cropHeight;
        
        if (cropLeft < imgLeft) {
          newLeft = imgLeft;
          newWidth = cropWidth - (imgLeft - cropLeft);
        }
        if (cropTop < imgTop) {
          newTop = imgTop;
          newHeight = cropHeight - (imgTop - cropTop);
        }
        if (cropLeft + cropWidth > imgLeft + imgWidth) {
          newWidth = imgLeft + imgWidth - newLeft;
        }
        if (cropTop + cropHeight > imgTop + imgHeight) {
          newHeight = imgTop + imgHeight - newTop;
        }
        
        // 确保最小尺寸
        if (newWidth < (defaultOptions.minCropSize?.width || 100)) {
          newWidth = defaultOptions.minCropSize?.width || 100;
        }
        if (newHeight < (defaultOptions.minCropSize?.height || 100)) {
          newHeight = defaultOptions.minCropSize?.height || 100;
        }
        
        targetCropBox.set({
          left: newLeft,
          top: newTop,
          width: newWidth,
          height: newHeight
        });
        currentCanvas.renderAll();
      }
      debouncedSaveHistory();
    });

    cropBoxRef.current = cropBox;
    canvas.add(cropBox);
    canvas.setActiveObject(cropBox);

    // 创建裁剪区域的孔（用于显示裁剪区域内的图片）
    updateMaskHole();
  };

  // 更新遮罩层的孔（显示裁剪区域内的图片）
  const updateMaskHole = () => {
    console.log('updateMaskHole')
    if (!cropBoxRef.current || !fabricCanvasRef.current || !fabricRef.current) return;
    
    const fabric = fabricRef.current;
    const canvas = fabricCanvasRef.current;
    const cropBox = cropBoxRef.current;

    // 获取裁剪框的位置和尺寸
    const cropLeft = cropBox.left || 0;
    const cropTop = cropBox.top || 0;
    const cropWidth = cropBox.width || 0;
    const cropHeight = cropBox.height || 0;
    
    // 创建一个包含透明洞的遮罩矩形
    // 首先创建一个覆盖整个画布的遮罩
    const canvasWidth = canvas.width || defaultOptions.canvasWidth;
    const canvasHeight = canvas.height || defaultOptions.canvasHeight;
    
    // 移除旧的遮罩层
    if (maskRef.current) {
      canvas.remove(maskRef.current);
    }
    
    // 创建背景遮罩（全黑）
    const backgroundMask = new fabric.Rect({
      left: 0,
      top: 0,
      width: canvasWidth,
      height: canvasHeight,
      fill: defaultOptions.maskStyle?.color || '#000000',
      opacity: defaultOptions.maskStyle?.opacity || 0.7,
      selectable: false,
      evented: false,
    });
    
    // 创建裁剪区域（透明区域）
    const cropArea = new fabric.Rect({
      left: cropLeft,
      top: cropTop,
      width: cropWidth,
      height: cropHeight,
      fill: 'rgba(0,0,0,0)', // 透明
      selectable: false,
      evented: false,
      stroke: defaultOptions.cropBoxStyle?.borderColor || '#ffffff',
      strokeWidth: defaultOptions.cropBoxStyle?.borderWidth || 2,
      strokeDashArray: [5, 5], // 虚线边框
    });
    
    // 将背景遮罩和裁剪区域组合成一个组
    const maskGroup = new fabric.Group([backgroundMask, cropArea], {
      selectable: false,
      evented: false,
    });
    
    // 更新遮罩引用
    maskRef.current = maskGroup;
    
    // 添加新的遮罩到画布
    canvas.add(maskGroup);
    
    // 确保裁剪框始终在最上方，方便用户操作
    canvas.bringObjectToFront(cropBox);
    
    // 渲染画布
    canvas.renderAll();
  };

  // 创建保存历史记录的函数
  const saveCurrentStateToHistory = () => {
    console.log('saveCurrentStateToHistory')
    if (!fabricCanvasRef.current || !cropBoxRef.current || !imageRef.current) return;

    const cropBox = cropBoxRef.current;
    const img = imageRef.current;

    // 创建历史记录
    const record: CropHistoryRecord = {
      cropBox: {
        left: cropBox.left || 0,
        top: cropBox.top || 0,
        width: cropBox.width || 0,
        height: cropBox.height || 0
      },
      scaleX: img.scaleX || 1,
      scaleY: img.scaleY || 1
    };

    // 使用自定义Hook保存历史记录
    saveHistory(record);
  };

  // 使用自定义Hook创建防抖函数
  const { debouncedCallback: debouncedSaveHistory } = useDebounce(
    saveCurrentStateToHistory,
    300
  );

  // 撤销操作
  const undo = () => {
    // 使用自定义Hook执行撤销
    const previousState = undoHistory();
    if (previousState) {
      restoreFromHistory(previousState);
    }
  };

  // 重做操作
  const redo = () => {
    // 使用自定义Hook执行重做
    const nextState = redoHistory();
    if (nextState) {
      restoreFromHistory(nextState);
    }
  };

  // 从历史记录恢复状态
  const restoreFromHistory = (record: CropHistoryRecord) => {
    if (!fabricCanvasRef.current || !cropBoxRef.current || !imageRef.current) return;

    const cropBox = cropBoxRef.current;
    const img = imageRef.current;

    // 恢复裁剪框状态
    cropBox.set({
      left: record.cropBox.left,
      top: record.cropBox.top,
      width: record.cropBox.width,
      height: record.cropBox.height
    });

    // 恢复图片缩放状态
    img.set({
      scaleX: record.scaleX,
      scaleY: record.scaleY
    });

    // 更新画布
    fabricCanvasRef.current?.renderAll();

    // 更新遮罩层孔
    updateMaskHole();
  };

  // 执行裁剪
  const handleCrop = async () => {
    if (!fabricCanvasRef.current || !imageRef.current || !cropBoxRef.current) return;

    const img = imageRef.current;
    const cropBox = cropBoxRef.current;

    // 获取裁剪框在图片上的实际位置和尺寸（考虑缩放）
    const imgLeft = img.left || 0;
    const imgTop = img.top || 0;
    const imgScaleX = img.scaleX || 1;
    const imgScaleY = img.scaleY || 1;

    // 计算裁剪区域相对于原始图片的坐标
    const cropLeft = (cropBox.left || 0 - imgLeft) / imgScaleX;
    const cropTop = (cropBox.top || 0 - imgTop) / imgScaleY;
    const cropWidth = (cropBox.width || 0) / imgScaleX;
    const cropHeight = (cropBox.height || 0) / imgScaleY;

    // 创建临时画布用于裁剪
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropWidth;
    tempCanvas.height = cropHeight;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) return;

    // 加载原始图片
    const originalImage = new Image();
    originalImage.crossOrigin = 'anonymous';

    return new Promise<void>((resolve) => {
      originalImage.onload = () => {
        // 在临时画布上绘制裁剪区域
        tempCtx.drawImage(
          originalImage,
          cropLeft,
          cropTop,
          cropWidth,
          cropHeight,
          0,
          0,
          cropWidth,
          cropHeight
        );

        // 获取裁剪后的图片URL
        const croppedImageUrl = tempCanvas.toDataURL('image/png');

        // 调用裁剪完成回调
        onCropComplete(croppedImageUrl);

        resolve();
      };

      originalImage.src = imageUrl;
    });
  };

  // 重置裁剪框
  const resetCropBox = () => {
    if (!fabricCanvasRef.current || !cropBoxRef.current || !maskRef.current) return;

    const canvas = fabricCanvasRef.current;
    canvas.remove(cropBoxRef.current);
    canvas.remove(maskRef.current);

    cropBoxRef.current = null;
    maskRef.current = null;

    createMask();
    createCropBox();
    saveCurrentStateToHistory();
  };

  // 销毁编辑器
  const destroyEditor = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
    }

    imageRef.current = null;
    cropBoxRef.current = null;
    maskRef.current = null;
  };

  // 键盘事件监听（撤销/重做）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z 或 Command+Z 撤销
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      // Ctrl+Y 或 Command+Y 重做
      else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 初始化画布 - 等待 fabric.js 加载完成
  useEffect(() => {
    if (fabricLoaded && canvasRef.current) {
      initCanvas();
    }

    return () => {
      destroyEditor();
    };
  }, [fabricLoaded, imageUrl]);

  // 监听裁剪框变化，更新遮罩层
  useEffect(() => {
    if (!fabricCanvasRef.current || !cropBoxRef.current) return;

    const canvas = fabricCanvasRef.current;
    const cropBox = cropBoxRef.current;

    const handleObjectMoving = () => {
      updateMaskHole();
    };

    const handleObjectScaling = () => {
      updateMaskHole();
    };

    canvas.on('object:moving', handleObjectMoving);
    canvas.on('object:scaling', handleObjectScaling);

    return () => {
      canvas.off('object:moving', handleObjectMoving);
      canvas.off('object:scaling', handleObjectScaling);
    };
  }, []);

  // 显示加载状态或错误信息
  if (loadingError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 text-white">
        <div className="text-center p-8">
          <p className="text-xl mb-4">加载失败</p>
          <p className="text-sm text-gray-300 mb-4">{loadingError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  if (!fabricLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">正在加载图片编辑器...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      {/* 画布容器 - 居中显示，限制最大尺寸 */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-4">
        <canvas
          ref={canvasRef}
          className="shadow-2xl border border-gray-300 rounded-lg"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            cursor: 'default',
            display: 'block',
            backgroundColor: '#f5f5f5'
          }}
        />
      </div>

      {/* 工具栏 - 固定在底部 */}
      <div className="flex justify-center items-center p-4 text-white gap-4">
        <button
          onClick={resetCropBox}
          className="text-xs flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
        >
          重置
        </button>
        <button
          onClick={undo}
          className="text-xs flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
          disabled={!canUndo}
        >
          撤销
        </button>
        <button
          onClick={redo}
          className="text-xs flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
          disabled={!canRedo}
        >
          重做
        </button>
        <button
          onClick={onCancel}
          className="text-xs flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleCrop}
          className="text-xs flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors font-medium"
        >
          确认裁剪
        </button>
      </div>
    </div>
  );
};

export default FabricImageEditor;