'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useFabricCanvas } from '@/hooks/utils/useFabricCanvas';
import { useImageLoader } from '@/hooks/utils/useImageLoader';
import { createCanvas, destroyCanvas } from '@/lib/utils/fabric';
import type { FabricEraseEditorProps, FabricCanvas, FabricObject } from '@/lib/types/editor/fabric';
import { EditorContainer, LoadingState, ErrorState } from '@/components/editor';
import { EraseOperationsToolbar } from '@/components/editor/toolbars/EraseOperationsToolbar';

// 模拟 API 调用
const mockEraseApi = async (imageUrl: string, maskUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 在实际项目中，这里应该调用后端 API
      // 目前直接返回原图，实际应该返回处理后的图片
      console.log('Mock API called with:', { imageUrl, maskUrl });
      resolve(imageUrl); 
    }, 2000);
  });
};

const FabricEraseEditor: React.FC<FabricEraseEditorProps> = ({ imageUrl, onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  
  // 使用自定义hooks
  const { fabricRef, fabricLoaded, loadingError } = useFabricCanvas();
  const { imageRef, loadImage } = useImageLoader(fabricRef);
  
  const [brushSize, setBrushSize] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 初始化画笔
  const initBrush = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const fabric = fabricRef.current;
    if (!canvas || !fabric) return;

    canvas.isDrawingMode = true;
    const brush = new fabric.PencilBrush(canvas);
    brush.color = 'rgba(255, 0, 0, 0.5)';
    brush.width = brushSize;
    canvas.freeDrawingBrush = brush;
  }, [fabricRef, brushSize]);

  // 更新画笔大小
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (canvas && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = brushSize;
    }
  }, [brushSize]);

  // 保存历史记录
  const saveHistory = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const json = JSON.stringify(canvas.toJSON());
    
    // 如果当前不在历史记录末尾，删除后面的记录
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(json);
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // 撤销
  const handleUndo = useCallback(() => {
    // 允许撤销到初始状态（historyIndex = 0）
    if (historyIndex <= 0) return;
    
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const prevIndex = historyIndex - 1;
    const json = history[prevIndex];
    
    // 禁用path:created监听，避免撤销时触发保存
    const originalOnPathCreated = canvas.__eventListeners?.['path:created'];
    if (originalOnPathCreated) {
      canvas.off('path:created');
    }

    canvas.loadFromJSON(JSON.parse(json), () => {
      canvas.renderAll();
      setHistoryIndex(prevIndex);
      // 重新设置画笔，因为loadFromJSON可能会重置状态
      initBrush();
      
      // 恢复监听
      if (originalOnPathCreated) {
        // @ts-ignore - 重新绑定事件监听器
        originalOnPathCreated.forEach((handler: any) => {
          canvas.on('path:created', handler);
        });
      } else {
        // 重新绑定默认监听器
        canvas.on('path:created', () => {
          saveHistory();
        });
      }
    });
  }, [historyIndex, history, initBrush, saveHistory]);

  // 重做
  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const nextIndex = historyIndex + 1;
    const json = history[nextIndex];
    
    // 禁用path:created监听
    const originalOnPathCreated = canvas.__eventListeners?.['path:created'];
    if (originalOnPathCreated) {
      canvas.off('path:created');
    }
    
    canvas.loadFromJSON(JSON.parse(json), () => {
      canvas.renderAll();
      setHistoryIndex(nextIndex);
      initBrush();
      
      // 恢复监听
      if (originalOnPathCreated) {
        // @ts-ignore
        originalOnPathCreated.forEach((handler: any) => {
          canvas.on('path:created', handler);
        });
      } else {
        canvas.on('path:created', () => {
          saveHistory();
        });
      }
    });
  }, [historyIndex, history, initBrush, saveHistory]);

  // 清空画布（只清除笔触）
  const handleClear = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    let hasRemoved = false;
    
    // 保留背景图 (通常是第一个对象或者通过 type 判断)
    // 倒序遍历，避免删除时索引变化问题
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if (obj.type === 'path') { // 笔触通常是 path 类型
        canvas.remove(obj);
        hasRemoved = true;
      }
    }
    
    if (hasRemoved) {
      saveHistory();
    }
  }, [saveHistory]);

  // 生成 Mask 图片
  const getMaskImage = useCallback(async (): Promise<string> => {
    const canvas = fabricCanvasRef.current;
    const img = imageRef.current;
    const fabric = fabricRef.current;
    
    if (!canvas || !img || !fabric) return '';

    // 1. 创建临时 Canvas 用于生成 Mask
    // 使用原图的实际尺寸
    const originalWidth = img.width || 800;
    const originalHeight = img.height || 600;
    
    const tempCanvasEl = document.createElement('canvas');
    tempCanvasEl.width = originalWidth;
    tempCanvasEl.height = originalHeight;
    
    const tempFabricCanvas = new fabric.Canvas(tempCanvasEl);
    
    // 2. 填充黑色背景
    const rect = new fabric.Rect({
      left: 0,
      top: 0,
      width: originalWidth,
      height: originalHeight,
      fill: 'black',
      selectable: false
    });
    tempFabricCanvas.add(rect);
    
    // 3. 将所有笔触(path)复制到临时 Canvas，并改为白色
    // 需要考虑缩放和平移：主画布上的笔触是相对于画布的，我们需要将其映射到原图坐标系
    // 或者，更简单的方法是：
    // 我们的主画布上，图片通常是缩放以适应屏幕的。
    // 笔触是在缩放后的画布上绘制的。
    // 我们需要将笔触恢复到原图的比例。
    
    const scaleX = img.scaleX || 1;
    const scaleY = img.scaleY || 1;
    const imgLeft = img.left || 0;
    const imgTop = img.top || 0;

    const objects = canvas.getObjects();
    
    for (const obj of objects) {
      if (obj.type === 'path') {
        // 克隆对象
        await new Promise<void>((resolve) => {
          obj.clone((cloned: FabricObject) => {
            // 调整坐标系：从画布坐标 -> 原图坐标
            // (CanvasCoord - ImageOffset) / ImageScale
            
            cloned.left = (cloned.left! - imgLeft) / scaleX;
            cloned.top = (cloned.top! - imgTop) / scaleY;
            cloned.scaleX = (cloned.scaleX || 1) / scaleX;
            cloned.scaleY = (cloned.scaleY || 1) / scaleY;
            
            // 设置为白色
            cloned.set({
              stroke: 'white',
              fill: null // path通常只有stroke
            });
            
            tempFabricCanvas.add(cloned);
            resolve();
          });
        });
      }
    }
    
    tempFabricCanvas.renderAll();
    const dataUrl = tempFabricCanvas.toDataURL({
      format: 'png',
      quality: 1
    });
    
    // 清理
    tempFabricCanvas.dispose();
    
    return dataUrl;
  }, [fabricRef, imageRef]);

  // 提交处理
  const handleApply = async () => {
    setIsProcessing(true);
    try {
      const maskUrl = await getMaskImage();
      const newUrl = await mockEraseApi(imageUrl, maskUrl);
      onSave(newUrl);
    } catch (error) {
      console.error('Erase failed:', error);
      // TODO: Show toast error
    } finally {
      setIsProcessing(false);
    }
  };

  // 初始化画布
  const initCanvas = useCallback(async () => {
    if (!canvasRef.current || !fabricRef.current) return;

    const fabric = fabricRef.current;
    
    // 尺寸适配
    const width = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.9, 1200) : 800;
    const height = typeof window !== 'undefined' ? Math.min(window.innerHeight * 0.9, 800) : 600;
    
    const canvas = createCanvas(canvasRef, fabric, width, height);
    if (!canvas) return;

    fabricCanvasRef.current = canvas;
    
    // 监听路径创建事件，保存历史
    canvas.on('path:created', () => {
      saveHistory();
    });
    
    // 加载图片
    const success = await loadImage(imageUrl, canvas, canvasRef);
    if (success) {
      initBrush();
      // 保存初始状态
      saveHistory();
    }
  }, [canvasRef, fabricRef, imageUrl, loadImage, initBrush, saveHistory]);

  // 生命周期管理
  useEffect(() => {
    let isMounted = true;

    // 只有在 fabric 加载完成，且画布尚未初始化时才执行
    if (fabricLoaded && canvasRef.current && !fabricCanvasRef.current) {
      initCanvas();
    }

    const handleBeforeUnload = () => {
      if (fabricCanvasRef.current) {
        destroyCanvas(fabricCanvasRef.current);
        fabricCanvasRef.current = null;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (fabricCanvasRef.current) {
        destroyCanvas(fabricCanvasRef.current);
        fabricCanvasRef.current = null;
      }
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabricLoaded]); // 明确只依赖 fabricLoaded，初始化只执行一次

  // 监听 brushSize 变化
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (canvas && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = brushSize;
    }
  }, [brushSize]);

  if (loadingError) {
    return <ErrorState error={loadingError} onRetry={() => window.location.reload()} />;
  }

  if (!fabricLoaded) {
    return <LoadingState />;
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent">
      <EditorContainer canvasRef={canvasRef} />
      <EraseOperationsToolbar
        onCancel={onCancel}
        onApply={handleApply}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default FabricEraseEditor;
