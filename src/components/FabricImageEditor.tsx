'use client';

import { useEffect, useRef, useState } from 'react';
import type { ImageCropEditorOptions, CropHistoryRecord } from '../types/image-editor'; // 修复：移除未使用的ImageCropEditorInstance类型导入
import { useHistory } from '../hooks/useHistory';
import { useDebounce } from '../hooks/useDebounce';

// 修复：使用动态导入加载fabric，确保只在客户端执行
let fabric: any = null;
if (typeof window !== 'undefined') {
  fabric = require('fabric').default;
}

interface FabricImageEditorProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

const FabricImageEditor: React.FC<FabricImageEditorProps> = ({ imageUrl, onCropComplete, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const imageRef = useRef<fabric.Image | null>(null);
  const cropBoxRef = useRef<fabric.Rect | null>(null);
  const maskRef = useRef<fabric.Rect | null>(null);
  
  // 使用自定义Hook管理历史记录，获取canUndo和canRedo状态
  const { save: saveHistory, undo: undoHistory, redo: redoHistory, getCurrentState, canUndo, canRedo } = useHistory<CropHistoryRecord>(5);
  
  // 默认配置
  const defaultOptions: ImageCropEditorOptions = {
    imageUrl,
    canvasWidth: window.innerWidth * 0.8,
    canvasHeight: window.innerHeight * 0.8,
    minCropSize: { width: 100, height: 100 },
    cropBoxStyle: {
      borderWidth: 2,
      borderColor: '#ffffff',
      borderStyle: 'dashed',
      cornerSize: 8,
      cornerColor: '#ffffff'
    },
    maskStyle: {
      color: '#000000',
      opacity: 0.7
    },
    initialRatio: 1
    // 移除：maxHistorySteps 已通过 useHistory Hook 内部处理
  };

  // 初始化画布
  const initCanvas = () => {
    if (!canvasRef.current) return;
    
    // 修复：确保fabric已经被正确加载
    if (!fabric) {
      console.error('fabric.js not loaded properly');
      return;
    }

    // 创建fabric画布
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: defaultOptions.canvasWidth,
      height: defaultOptions.canvasHeight,
      preserveObjectStacking: true,
      selection: false,
      backgroundColor: '#f5f5f5'
    });

    fabricCanvasRef.current = canvas;

    // 加载图片
    loadImage(imageUrl);
  };

  // 加载图片并适配尺寸
  const loadImage = (url: string) => {
    if (!fabricCanvasRef.current) return;
    
    // 修复：确保fabric已经被正确加载
    if (!fabric) {
      console.error('fabric.js not loaded properly');
      return;
    }

    // 修复：使用正确的fromURL方法签名，回调函数作为第三个参数
    fabric.Image.fromURL(url, {}, (img: any) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      imageRef.current = img;

      // 计算图片适配尺寸（保持比例，最大化显示）
      const canvasWidth = canvas.width || defaultOptions.canvasWidth;
      const canvasHeight = canvas.height || defaultOptions.canvasHeight;
      const imgWidth = img.width || 0;
      const imgHeight = img.height || 0;

      // 计算缩放比例
      const scale = Math.min(
        canvasWidth / imgWidth,
        canvasHeight / imgHeight
      );

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

      // 创建遮罩层
      createMask();

      // 创建裁剪框
      createCropBox();

      // 保存初始状态到历史记录
      saveCurrentStateToHistory();
    });
  };

  // 创建遮罩层
  const createMask = () => {
    if (!fabricCanvasRef.current || !imageRef.current) return;
    
    // 修复：确保fabric已经被正确加载
    if (!fabric) {
      console.error('fabric.js not loaded properly');
      return;
    }

    const canvas = fabricCanvasRef.current;
    const img = imageRef.current;

    // 创建完整的遮罩层
    const mask = new fabric.Rect({
      left: img.left || 0,
      top: img.top || 0,
      width: (img.width || 0) * (img.scaleX || 1),
      height: (img.height || 0) * (img.scaleY || 1),
      fill: defaultOptions.maskStyle?.color || '#000000',
      opacity: defaultOptions.maskStyle?.opacity || 0.7,
      selectable: false,
      evented: false,
      excludeFromExport: true
    });

    maskRef.current = mask;
    canvas.add(mask);
  };

  // 创建裁剪框
  const createCropBox = () => {
    if (!fabricCanvasRef.current || !imageRef.current) return;
    
    // 修复：确保fabric已经被正确加载
    if (!fabric) {
      console.error('fabric.js not loaded properly');
      return;
    }

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

    // 创建裁剪框
    const cropBox = new fabric.Rect({
      left,
      top,
      width: initialSize,
      height: initialSize,
      fill: 'transparent',
      stroke: defaultOptions.cropBoxStyle?.borderColor || '#ffffff',
      strokeWidth: defaultOptions.cropBoxStyle?.borderWidth || 2,
      strokeDashArray: [5, 5], // 虚线边框
      cornerSize: defaultOptions.cropBoxStyle?.cornerSize || 8,
      cornerColor: defaultOptions.cropBoxStyle?.cornerColor || '#ffffff',
      cornerStyle: 'rect',
      transparentCorners: false,
      hasControls: true,
      hasBorders: true,
      lockRotation: true,
      minWidth: defaultOptions.minCropSize?.width || 100,
      minHeight: defaultOptions.minCropSize?.height || 100,
      borderColor: defaultOptions.cropBoxStyle?.borderColor || '#ffffff',
      borderScaleFactor: 1,
      padding: 0
    });

    // 监听裁剪框变化事件
    cropBox.on('moving', debouncedSaveHistory);
    cropBox.on('scaling', debouncedSaveHistory);

    cropBoxRef.current = cropBox;
    canvas.add(cropBox);
    canvas.setActiveObject(cropBox);

    // 创建裁剪区域的孔（用于显示裁剪区域内的图片）
    updateMaskHole();
  };

  // 更新遮罩层的孔（显示裁剪区域内的图片）
  const updateMaskHole = () => {
    if (!maskRef.current || !cropBoxRef.current || !fabricCanvasRef.current) return;
    
    // 修复：确保fabric已经被正确加载
    if (!fabric) {
      console.error('fabric.js not loaded properly');
      return;
    }

    const canvas = fabricCanvasRef.current;
    const mask = maskRef.current;
    const cropBox = cropBoxRef.current;

    // 移除旧的裁剪区域对象
    const oldCropArea = canvas.getObjects().find(obj => {
      // 修复：使用get方法访问自定义属性
      const type = obj.get('type');
      return type === 'crop-area';
    });
    if (oldCropArea) {
      canvas.remove(oldCropArea);
    }

    // 创建裁剪区域（使用与裁剪框相同的尺寸和位置）
    const cropArea = new fabric.Rect({
      left: cropBox.left || 0,
      top: cropBox.top || 0,
      width: cropBox.width || 0,
      height: cropBox.height || 0,
      fill: 'transparent',
      selectable: false,
      evented: false,
      excludeFromExport: true,
      // 修复：使用set方法设置自定义属性，或直接作为对象属性添加
      type: 'crop-area' // 使用type属性代替data.type，因为fabric对象有内置的type属性
    });

    // 使用合成模式创建裁剪效果
    cropArea.globalCompositeOperation = 'destination-out';
    canvas.add(cropArea);
    // 修复：使用正确的sendToBack方法，这是fabric.js 7.1.0的正确方法名
    canvas.sendToBack(cropArea);
  };

  // 创建保存历史记录的函数
  const saveCurrentStateToHistory = () => {
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

    const canvas = fabricCanvasRef.current;
    const img = imageRef.current;
    const cropBox = cropBoxRef.current;

    // 获取原始图片尺寸
    const originalWidth = img.width || 0;
    const originalHeight = img.height || 0;

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

  // 初始化画布
  useEffect(() => {
    initCanvas();

    return () => {
      destroyEditor();
    };
  }, [imageUrl]);

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

  return (
    <div className="w-full h-full flex flex-col">
      {/* 画布容器 */}
      <div className="flex-1 flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          className="border border-gray-700 shadow-lg"
          style={{
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        />
      </div>

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