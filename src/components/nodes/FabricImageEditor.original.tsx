'use client';

import { useEffect, useRef, useState } from 'react';
import type { ImageCropEditorOptions, CropHistoryRecord } from '@/types/editor/fabric'; 
import { useHistory } from '@/hooks/useHistory';
import { useDebounce } from '@/hooks/useDebounce';
import { Refresh, Undo, Redo } from '@mui/icons-material';
import { Tooltip } from '@mui/material';

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
      const viewportWidth = window.innerWidth * 0.8;
      const viewportHeight = window.innerHeight * 0.8;
      
      const aspectRatio = imgWidth / imgHeight;
      
      // 确保图片完全显示在viewport内，并且不超过80%的视口大小
      let scale: number;
      if (aspectRatio >= 1) {
        // 横屏或正方形图片：以宽度为基准
        scale = Math.min(viewportWidth / imgWidth, viewportHeight / imgHeight);
      } else {
        // 竖屏图片：以高度为基准
        scale = Math.min(viewportHeight / imgHeight, viewportWidth / imgWidth);
      }

      fabric.Image.fromURL(url, {
        crossOrigin: 'anonymous'
      })
      .then((img: any) => {
        if (!img || !canvasRef.current) {
          setLoadingError('Failed to load image.');
          return;
        }

        imageRef.current = img;
      
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      
      const htmlCanvas = canvasRef.current;
      if (htmlCanvas) {
        htmlCanvas.width = scaledWidth;
        htmlCanvas.height = scaledHeight;
      }
      
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
      
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: scaledWidth,
        height: scaledHeight,
        preserveObjectStacking: true,
        selection: true,
        backgroundColor: '#ffffff',
        renderOnAddRemove: true,
        skipTargetFind: false,
      });
      
      // 修复upper-canvas背景问题
      if (canvas.upperCanvasEl) {
        canvas.upperCanvasEl.style.backgroundColor = 'transparent';
        canvas.upperCanvasEl.style.background = 'transparent';
      }
      
      fabricCanvasRef.current = canvas;
      
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
      
      canvas.add(img);
      
      canvas.sendObjectToBack(img);
      canvas.renderAll();
      
      createCropBox();
      saveCurrentStateToHistory();
      
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

  originalImage.src = url;
}



  // 更新遮罩层
  const updateMaskClipPath = () => {
    if (!fabricCanvasRef.current || !cropBoxRef.current || !maskRef.current || !fabricRef.current) return;
    const fabric = fabricRef.current;
    const canvas = fabricCanvasRef.current;
    const cropBox = cropBoxRef.current;
    const maskGroup = maskRef.current;

    // 获取裁剪框的实际边界
    const bounds = cropBox.getBoundingRect(true);

    // 更新四个遮罩矩形的位置和尺寸
    if (maskGroup && maskGroup._objects && maskGroup._objects.length === 4) {
      const [topMask, bottomMask, leftMask, rightMask] = maskGroup._objects;

      // 计算每个遮罩矩形的绝对坐标
      // topMask: 从 (0,0) 到 (canvas.width, bounds.top)
      topMask.set({
        left: 0,
        top: 0,
        width: canvas.width,
        height: bounds.top
      });
      topMask.setCoords();

      // bottomMask: 从 (0, bounds.top + bounds.height) 到 (canvas.width, canvas.height)
      bottomMask.set({
        left: 0,
        top: bounds.top + bounds.height,
        width: canvas.width,
        height: canvas.height - (bounds.top + bounds.height)
      });
      bottomMask.setCoords();

      // leftMask: 从 (0, bounds.top) 到 (bounds.left, bounds.top + bounds.height)
      leftMask.set({
        left: 0,
        top: bounds.top,
        width: bounds.left,
        height: bounds.height
      });
      leftMask.setCoords();

      // rightMask: 从 (bounds.left + bounds.width, bounds.top) 到 (canvas.width, bounds.top + bounds.height)
      rightMask.set({
        left: bounds.left + bounds.width,
        top: bounds.top,
        width: canvas.width - (bounds.left + bounds.width),
        height: bounds.height
      });
      rightMask.setCoords();
    }
    canvas.renderAll();
  };

  // 创建遮罩层
  const createMask = () => {
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

    // 获取裁剪框的实际边界（相对于画布的绝对坐标）
    const bounds = cropBox.getBoundingRect(true);

    // 创建四个矩形来模拟洞形遮罩效果
    // 使用 fabric.Group 但确保子对象使用绝对坐标
    const maskGroup = new fabric.Group([], {
      selectable: false,
      evented: false,
      originX: 'left',
      originY: 'top'
    });

    // 创建四个遮罩矩形：上、下、左、右
    // 使用Math.max确保尺寸不为负数
    const masks = [
      // 上遮罩
      new fabric.Rect({
        left: 0,
        top: 0,
        width: canvas.width,
        height: Math.max(0, bounds.top),
        fill: 'rgba(0, 0, 0, 0.6)',
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top'
      }),
      // 下遮罩
      new fabric.Rect({
        left: 0,
        top: bounds.top + bounds.height,
        width: canvas.width,
        height: Math.max(0, canvas.height - (bounds.top + bounds.height)),
        fill: 'rgba(0, 0, 0, 0.6)',
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top'
      }),
      // 左遮罩
      new fabric.Rect({
        left: 0,
        top: bounds.top,
        width: Math.max(0, bounds.left),
        height: Math.max(0, bounds.height),
        fill: 'rgba(0, 0, 0, 0.6)',
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top'
      }),
      // 右遮罩
      new fabric.Rect({
        left: bounds.left + bounds.width,
        top: bounds.top,
        width: Math.max(0, canvas.width - (bounds.left + bounds.width)),
        height: Math.max(0, bounds.height),
        fill: 'rgba(0, 0, 0, 0.6)',
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top'
      })
    ];

    masks.forEach(maskRect => {
      maskGroup.add(maskRect);
      maskRect.setCoords();
    });

    // 设置 Group 本身的坐标为原点，确保子对象坐标是绝对的
    maskGroup.set({
      left: 0,
      top: 0,
      width: canvas.width,
      height: canvas.height
    });
    maskGroup.setCoords();

    maskRef.current = maskGroup;

    // 将遮罩层添加到图片之上，裁剪框之下
    canvas.add(maskGroup);
    canvas.sendObjectToBack(img);
    canvas.bringObjectToFront(cropBox);
    canvas.renderAll();
  };

  // 创建裁剪框
  const createCropBox = () => {
    if (!fabricCanvasRef.current || !imageRef.current || !fabricRef.current) return;
    const fabric = fabricRef.current;
    const canvas = fabricCanvasRef.current;
    const img = imageRef.current;
    
    const imgWidth = img.width * img.scaleX;
    const imgHeight = img.height * img.scaleY;
    
    // 计算裁剪框初始尺寸：图片的80%，保持宽高比
    const scaleFactor = 0.8;
    let cropWidth = imgWidth * scaleFactor;
    let cropHeight = imgHeight * scaleFactor;
    
    // 确保不小于最小裁剪尺寸
    cropWidth = Math.max(cropWidth, defaultOptions.minCropSize?.width || 100);
    cropHeight = Math.max(cropHeight, defaultOptions.minCropSize?.height || 100);

    // 计算裁剪框初始位置，使其居中显示
    const cropBoxLeft = (img.width * img.scaleX - cropWidth) / 2;
    const cropBoxTop = (img.height * img.scaleY - cropHeight) / 2;
    
    const cropBox = new fabric.Rect({
      width: cropWidth,
      height: cropHeight,
      left: cropBoxLeft,
      top: cropBoxTop,
      fill: 'transparent',
      stroke: defaultOptions.cropBoxStyle?.borderColor || '#ffffff',
      strokeWidth: defaultOptions.cropBoxStyle?.borderWidth || 2,
      strokeDashArray: [2, 4],
      cornerSize: defaultOptions.cropBoxStyle?.cornerSize || 4,
      cornerColor: defaultOptions.cropBoxStyle?.cornerColor || '#ffffff',
      cornerStyle: 'rect',
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
    
    cropBox.on('moving', (e: any) => {
      if (!e.target) return;
      updateMaskClipPath();
      debouncedSaveHistory();
    });
    
    cropBox.on('scaling', (e: any) => {
      if (!e.target) return;
      updateMaskClipPath();
      debouncedSaveHistory();
    });
    
    cropBox.on('rotating', (e: any) => {
      if (!e.target) return;
      updateMaskClipPath();
      debouncedSaveHistory();
    });
    
    cropBoxRef.current = cropBox;
    canvas.add(cropBox);
    canvas.setActiveObject(cropBox);
    
    // 创建遮罩层
    createMask();
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

  const redo = () => {
    const nextState = redoHistory();
    if (nextState) {
      restoreFromHistory(nextState);
    }
  };

  const restoreFromHistory = (record: CropHistoryRecord) => {
    if (!fabricCanvasRef.current || !cropBoxRef.current || !imageRef.current) return;

    const cropBox = cropBoxRef.current;
    const img = imageRef.current;

    cropBox.set({
      left: record.cropBox.left,
      top: record.cropBox.top,
      width: record.cropBox.width,
      height: record.cropBox.height
    });

    img.set({
      scaleX: record.scaleX,
      scaleY: record.scaleY
    });

    // 更新遮罩层的clipPath
    updateMaskClipPath();
    fabricCanvasRef.current?.renderAll();
  };

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
    const cropLeft = ((cropBox.left || 0) - imgLeft) / imgScaleX;
    const cropTop = ((cropBox.top || 0) - imgTop) / imgScaleY;
    const cropWidth = (cropBox.width || 0) / imgScaleX;
    const cropHeight = (cropBox.height || 0) / imgScaleY;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropWidth;
    tempCanvas.height = cropHeight;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) return;

    const originalImage = new Image();
    originalImage.crossOrigin = 'anonymous';

    return new Promise<void>((resolve) => {
      originalImage.onload = () => {
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

        const croppedImageUrl = tempCanvas.toDataURL('image/png');
        onCropComplete(croppedImageUrl);
        resolve();
      };

      originalImage.src = imageUrl;
    });
  };

  const resetCropBox = () => {
    if (!fabricCanvasRef.current || !cropBoxRef.current) return;

    const canvas = fabricCanvasRef.current;
    canvas.remove(cropBoxRef.current);

    cropBoxRef.current = null;

    createCropBox();
    saveCurrentStateToHistory();
  };

  const destroyEditor = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
    }

    imageRef.current = null;
    cropBoxRef.current = null;
    maskRef.current = null;
  };

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
  }, []);

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
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent">
      {/* 画布容器 - 居中显示，限制最大尺寸 */}
      <div className="flex items-center justify-center overflow-auto">
        <canvas
          ref={canvasRef}
          className="shadow-2xl rounded-lg"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            cursor: 'default',
            display: 'block',
            backgroundColor: '#f5f5f5'
          }}
        />
      </div>

      {/* 工具栏 - 紧挨着画布底部外侧，间隔8px */}
      <div className="mt-2 flex justify-center items-center text-white gap-4">
        <Tooltip title="重置" placement="top">
          <button
            onClick={resetCropBox}
            className="text-xs flex items-center justify-center px-2 py-2  hover:bg-gray-600 rounded-md transition-colors"
            aria-label="重置"
          >
            <Refresh fontSize="small" />
          </button>
        </Tooltip>
        <Tooltip title="撤销" placement="top">
          <span>
            <button
              onClick={undo}
              className="text-xs flex items-center justify-center px-2 py-2 hover:bg-gray-600 rounded-md transition-colors"
              disabled={!canUndo}
              aria-label="撤销"
            >
              <Undo fontSize="small" />
            </button>
          </span>
        </Tooltip>
        <Tooltip title="重做" placement="top">
          <span>
            <button
              onClick={redo}
              className="text-xs flex items-center justify-center px-2 py-2  hover:bg-gray-600 rounded-md transition-colors"
              disabled={!canRedo}
              aria-label="重做"
            >
              <Redo fontSize="small" />
            </button>
          </span>
        </Tooltip>
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
          确认
        </button>
      </div>
    </div>
  );
};

export default FabricImageEditor;