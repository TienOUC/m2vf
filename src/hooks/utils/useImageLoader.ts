import { useRef } from 'react';
import type { Fabric, FabricObject, FabricCanvas } from '@/types/editor/fabric';

// 图片尺寸缓存
const imageSizeCache = new Map<string, { width: number; height: number }>();

export const useImageLoader = (fabricRef: React.RefObject<Fabric | null>) => {
  const imageRef = useRef<FabricObject | null>(null);

  const loadImage = async (url: string, canvas: FabricCanvas | null, canvasRef: React.RefObject<HTMLCanvasElement>): Promise<boolean> => {
    if (!canvasRef.current || !fabricRef.current) return false;
    
    const fabric = fabricRef.current;
    
    if (!url || typeof url !== 'string' || url.length === 0) {
      return false;
    }

    try {
      // 检查是否有缓存的图片尺寸
      let imgWidth = 0;
      let imgHeight = 0;
      
      if (imageSizeCache.has(url)) {
        const cachedSize = imageSizeCache.get(url)!;
        imgWidth = cachedSize.width;
        imgHeight = cachedSize.height;
      }

      // 使用Fabric.Image直接加载图片，避免双重加载
      const img = await fabric.Image.fromURL(url, {
        crossOrigin: 'anonymous'
      });

      if (!img || !canvasRef.current) {
        return false;
      }

      imageRef.current = img;

      // 如果没有缓存，获取图片原始尺寸并缓存
      if (imgWidth === 0 || imgHeight === 0) {
        imgWidth = img.width || 0;
        imgHeight = img.height || 0;
        
        if (imgWidth > 0 && imgHeight > 0) {
          imageSizeCache.set(url, { width: imgWidth, height: imgHeight });
        }
      }

      if (imgWidth === 0 || imgHeight === 0) {
        return false;
      }

      // 获取Canvas容器的实际尺寸
      const container = canvasRef.current.parentElement;
      const containerWidth = container ? container.clientWidth : window.innerWidth * 0.8;
      const containerHeight = container ? container.clientHeight : window.innerHeight * 0.8;
      
      const aspectRatio = imgWidth / imgHeight;
      
      // 确保图片完全显示在容器内，并保持宽高比
      let scale: number;
      if (aspectRatio >= 1) {
        // 横屏或正方形图片：以宽度为基准
        scale = Math.min(containerWidth / imgWidth, containerHeight / imgHeight);
      } else {
        // 竖屏图片：以高度为基准
        scale = Math.min(containerHeight / imgHeight, containerWidth / imgWidth);
      }

      // 限制最大缩放比例，避免图片过大
      scale = Math.min(scale, 1);

      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      
      const htmlCanvas = canvasRef.current;
      if (htmlCanvas) {
        htmlCanvas.width = scaledWidth;
        htmlCanvas.height = scaledHeight;
      }
      
      // 复用现有Canvas而不是重新创建
      if (canvas) {
        // 清除Canvas上的所有对象
        canvas.clear();
        // 更新Canvas尺寸
        canvas.setDimensions({ width: scaledWidth, height: scaledHeight });
      } else {
        // 如果没有现有Canvas，创建新的
        const newCanvas = new fabric.Canvas(canvasRef.current, {
          width: scaledWidth,
          height: scaledHeight,
          preserveObjectStacking: true,
          selection: true,
          backgroundColor: '#ffffff',
          renderOnAddRemove: true,
          skipTargetFind: false,
        });
        
        // 修复upper-canvas背景问题
        if (newCanvas.upperCanvasEl) {
          newCanvas.upperCanvasEl.style.backgroundColor = 'transparent';
          newCanvas.upperCanvasEl.style.background = 'transparent';
        }
        
        // 将新Canvas返回给调用者
        return true;
      }
      
      // 图片使用左上角原点(0,0)，与裁剪框和遮罩统一坐标系统
      img.set({
        left: 0,
        top: 0,
        scaleX: scale, 
        scaleY: scale, 
        selectable: false,
        evented: false,
        originX: 'left',  // 统一使用左上角原点
        originY: 'top'
      });
      
      if (canvas) {
        canvas.add(img);
        canvas.sendObjectToBack(img);
        canvas.renderAll();
      }
      
      return true;
    } catch (error) {
      console.error('Image loading error:', error);
      return false;
    }
  };

  return {
    imageRef,
    loadImage
  };
};