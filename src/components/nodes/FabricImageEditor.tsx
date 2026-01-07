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

  // 初始化画布 - 不设置固定尺寸，后续根据图片实际尺寸调整
  const initCanvas = () => {
    if (!canvasRef.current || !fabricRef.current) return;

    const fabric = fabricRef.current;

    // 创建fabric画布 - 初始尺寸很小，后续根据图片实际尺寸调整
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 100,
      height: 100,
      preserveObjectStacking: true,
      selection: true,
      backgroundColor: '#ffffff',
      renderOnAddRemove: true,
      skipTargetFind: false,
    });

    // 修复upper-canvas背景问题：设置为透明
    const upperCanvas = canvas.upperCanvasEl;
    if (upperCanvas) {
      upperCanvas.style.backgroundColor = 'transparent';
      upperCanvas.style.background = 'transparent';
    }

    fabricCanvasRef.current = canvas;
    loadImage(imageUrl);
  };

  // 加载图片并适配尺寸
  const loadImage = (url: string) => {
    if (!canvasRef.current || !fabricRef.current) return;
    
    const fabric = fabricRef.current;
    
    if (!url || typeof url !== 'string' || url.length === 0) {
      setLoadingError('Invalid image URL provided.');
      return;
    }

    // 先使用原生Image对象获取原始图片尺寸
    const originalImage = new Image();
    originalImage.crossOrigin = 'anonymous';
    originalImage.onload = () => {
      // 获取原始图片尺寸
      const imgWidth = originalImage.naturalWidth;
      const imgHeight = originalImage.naturalHeight;

      if (imgWidth === 0 || imgHeight === 0) {
        setLoadingError('Failed to load image - invalid dimensions.');
        return;
      }

      // 计算图片放大比例和canvas尺寸
      // 1. 获取页面可视区域的80%作为基准
      const viewportWidth = window.innerWidth * 0.8;
      const viewportHeight = window.innerHeight * 0.8;
      
      // 2. 计算图片原始宽高比
      const aspectRatio = imgWidth / imgHeight;
      
      // 3. 计算正确的缩放比例
      // 确保图片完全显示在viewport内，并且不超过80%的视口大小
      let scale: number;
      if (aspectRatio >= 1) {
        // 横屏或正方形图片：以宽度为基准，确保宽度不超过viewport的80%
        scale = Math.min(viewportWidth / imgWidth, viewportHeight / imgHeight);
      } else {
        // 竖屏图片：以高度为基准，确保高度不超过viewport的80%
        scale = Math.min(viewportHeight / imgHeight, viewportWidth / imgWidth);
      }

      // 现在使用fabric.js加载图片
      fabric.Image.fromURL(url, {
        crossOrigin: 'anonymous'
      })
      .then((img: any) => {
        if (!img || !canvasRef.current) {
          setLoadingError('Failed to load image.');
          return;
        }

        imageRef.current = img;
      
      // 4. 使用缩放比例计算图片放大后的实际尺寸
      // 这个尺寸就是图片在canvas中的最终尺寸
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      
      // 5. 直接设置HTML canvas元素的实际尺寸
      const htmlCanvas = canvasRef.current;
      if (htmlCanvas) {
        htmlCanvas.width = scaledWidth;
        htmlCanvas.height = scaledHeight;
      }
      
      // 6. 销毁旧的canvas实例（如果存在）
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
      
      // 7. 使用计算好的尺寸创建新的fabric.Canvas实例
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: scaledWidth,
        height: scaledHeight,
        preserveObjectStacking: true,
        selection: true,
        backgroundColor: '#ffffff',
        renderOnAddRemove: true,
        skipTargetFind: false,
      });
      
      // 8. 修复upper-canvas背景问题
      if (canvas.upperCanvasEl) {
        canvas.upperCanvasEl.style.backgroundColor = 'transparent';
        canvas.upperCanvasEl.style.background = 'transparent';
      }
      
      // 9. 保存canvas引用
      fabricCanvasRef.current = canvas;
      
      // 10. 先将图片重置到原始尺寸和位置
      // 移除所有缩放和定位
      img.set({
        left: 0,
        top: 0,
        scaleX: 1,
        scaleY: 1,
        selectable: false,
        evented: false
      });
      
      // 11. 然后应用计算好的缩放比例
      img.set({
        scaleX: scale,
        scaleY: scale
      });
      
      // 12. 添加图片到画布
      canvas.add(img);
      
      // 13. 使用fabric.js v7.1推荐的setPositionByOrigin方法实现居中
      // 计算画布中心坐标
      const canvasCenterX = canvas.getWidth() / 2;
      const canvasCenterY = canvas.getHeight() / 2;
      
      // 使用setPositionByOrigin方法将图片居中
      // setPositionByOrigin(目标坐标, 原点X, 原点Y)
      // 目标坐标是画布中心，图片原点设为自身中心
      img.setPositionByOrigin(
        new fabric.Point(canvasCenterX, canvasCenterY),
        'center', // 图片的X原点设为自身中心
        'center'  // 图片的Y原点设为自身中心
      );
      
      // 14. 发送图片到图层底部并渲染
      canvas.sendObjectToBack(img);
      canvas.renderAll();
      
      // 12. 创建裁剪框
      // 注释掉遮罩相关功能
      // createMask();
      createCropBox();
      saveCurrentStateToHistory();
      // updateMaskHole();
      
      // 13. 确保裁剪框在最上方
      if (cropBoxRef.current) {
        canvas.bringObjectToFront(cropBoxRef.current);
        canvas.renderAll();
      }
    })
    .catch((error: any) => {
      setLoadingError('Failed to load image.');
      console.error('Image loading error:', error);
    });
  };

  // 设置图片源，触发加载
  originalImage.src = url;
}

  // 创建遮罩层 - 覆盖整个画布
  const createMask = () => {
    if (!fabricCanvasRef.current || !imageRef.current || !fabricRef.current) return;
    
    const canvas = fabricCanvasRef.current;

    // 移除旧的遮罩层
    if (maskRef.current) {
      canvas.remove(maskRef.current);
    }

    maskRef.current = null;
  };

  // 创建裁剪框
  const createCropBox = () => {
    if (!fabricCanvasRef.current || !imageRef.current || !fabricRef.current) return;
    const fabric = fabricRef.current;
    const canvas = fabricCanvasRef.current;
    const img = imageRef.current;
    
    // 获取放大后图片的实际尺寸
    const imgWidth = img.width * img.scaleX;
    const imgHeight = img.height * img.scaleY;
    const imgLeft = img.left || 0;
    const imgTop = img.top || 0;

    // 计算裁剪框初始尺寸（默认1:1比例，最大不超过图片尺寸，最小100x100）
    const initialSize = Math.min(
      Math.min(imgWidth, imgHeight),
      300
    );

    // 计算裁剪框初始位置（居中于图片上）
    const left = imgLeft + (imgWidth - initialSize) / 2;
    const top = imgTop + (imgHeight - initialSize) / 2;

    const cropBox = new fabric.Rect({
      left,
      top,
      width: initialSize,
      height: initialSize,
      fill: 'transparent',
      stroke: defaultOptions.cropBoxStyle?.borderColor || '#ffffff',
      strokeWidth: defaultOptions.cropBoxStyle?.borderWidth || 2,
      strokeDashArray: [5, 5],
      cornerSize: defaultOptions.cropBoxStyle?.cornerSize || 12,
      cornerColor: defaultOptions.cropBoxStyle?.cornerColor || '#ffffff',
      cornerStyle: 'circle',
      transparentCorners: false,
      hasControls: true,
      hasBorders: true,
      lockRotation: true,
      lockUniScaling: false,
      minWidth: defaultOptions.minCropSize?.width || 100,
      minHeight: defaultOptions.minCropSize?.height || 100,
      borderColor: defaultOptions.cropBoxStyle?.borderColor || '#ffffff',
      borderScaleFactor: 1,
      padding: 0,
      moveCursor: 'move',
      hoverCursor: 'move'
    });

    cropBox.on('moving', (e: any) => {
      if (!e.target) return;
      // updateMaskHole();
      debouncedSaveHistory();
    });
    
    cropBox.on('scaling', (e: any) => {
      if (!e.target) return;
      // updateMaskHole();
      debouncedSaveHistory();
    });

    cropBoxRef.current = cropBox;
    canvas.add(cropBox);
    canvas.setActiveObject(cropBox);

    // updateMaskHole();
  };

  // 更新遮罩层的孔（显示裁剪区域内的图片）
  const updateMaskHole = () => {
    if (!cropBoxRef.current || !fabricCanvasRef.current || !fabricRef.current || !imageRef.current) return;
    
    const fabric = fabricRef.current;
    const canvas = fabricCanvasRef.current;
    const cropBox = cropBoxRef.current;
    const img = imageRef.current;

    const cropLeft = cropBox.left || 0;
    const cropTop = cropBox.top || 0;
    const cropWidth = cropBox.width || 0;
    const cropHeight = cropBox.height || 0;
    
    const canvasWidth = canvas.width || defaultOptions.canvasWidth;
    const canvasHeight = canvas.height || defaultOptions.canvasHeight;
    
    // 移除旧的遮罩层
    if (maskRef.current) {
      canvas.remove(maskRef.current);
    }
    
    // 使用SVG路径创建带孔的遮罩
    const maskPath = `M0 0 L${canvasWidth} 0 L${canvasWidth} ${canvasHeight} L0 ${canvasHeight} Z M${cropLeft} ${cropTop} L${cropLeft + cropWidth} ${cropTop} L${cropLeft + cropWidth} ${cropTop + cropHeight} L${cropLeft} ${cropTop + cropHeight} Z`;
    
    const mask = new fabric.Path(maskPath, {
      left: 0,
      top: 0,
      fill: defaultOptions.maskStyle?.color || '#000000',
      opacity: defaultOptions.maskStyle?.opacity || 0.7,
      selectable: false,
      evented: false,
      strokeWidth: 0
    });
    
    maskRef.current = mask;
    canvas.add(mask);
    
    // 确保正确的层级顺序
    canvas.sendObjectToBack(img);
    canvas.bringObjectToFront(mask);
    canvas.bringObjectToFront(cropBox);
    
    canvas.renderAll();
  };

  // 创建保存历史记录的函数
  const saveCurrentStateToHistory = () => {
    if (!fabricCanvasRef.current || !cropBoxRef.current || !imageRef.current) return;

    const cropBox = cropBoxRef.current;
    const img = imageRef.current;

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

    // 注释掉遮罩相关功能
    // updateMaskHole();
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