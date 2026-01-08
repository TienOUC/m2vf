import { useRef } from 'react';
import type { Fabric, FabricObject, FabricCanvas } from '@/types/fabric-image-editor';

export const useImageLoader = (fabricRef: React.RefObject<Fabric | null>) => {
  const imageRef = useRef<FabricObject | null>(null);

  const loadImage = async (url: string, canvas: FabricCanvas | null, canvasRef: React.RefObject<HTMLCanvasElement>): Promise<boolean> => {
    if (!canvasRef.current || !fabricRef.current) return false;
    
    const fabric = fabricRef.current;
    
    if (!url || typeof url !== 'string' || url.length === 0) {
      return false;
    }

    return new Promise((resolve) => {
      // 先使用原生Image对象获取原始图片尺寸
      const originalImage = new Image();
      originalImage.crossOrigin = 'anonymous';
      originalImage.onload = () => {
        // 获取原始图片尺寸
        const imgWidth = originalImage.naturalWidth;
        const imgHeight = originalImage.naturalHeight;

        if (imgWidth === 0 || imgHeight === 0) {
          resolve(false);
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
        .then((img: FabricObject) => {
          if (!img || !canvasRef.current) {
            resolve(false);
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
          
          if (canvas) {
            canvas.dispose();
          }
          
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
          
          newCanvas.add(img);
          newCanvas.sendObjectToBack(img);
          newCanvas.renderAll();
          
          resolve(true);
        })
        .catch((error: unknown) => {
          console.error('Image loading error:', error);
          resolve(false);
        });
      };

      originalImage.onerror = () => {
        resolve(false);
      };

      originalImage.src = url;
    });
  };

  return {
    imageRef,
    loadImage
  };
};