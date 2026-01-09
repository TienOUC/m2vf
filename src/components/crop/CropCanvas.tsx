import { useEffect, useRef } from 'react';
import { useCropStore } from '@/lib/stores';
import { useCropCanvas, useCropBox, useCropMask } from '@/hooks/crop';
import type { FabricImageEditorProps } from '@/types/editor/fabric';

interface CropCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  imageUrl: string;
}

/**
 * 裁剪画布组件
 * 负责Canvas渲染和Fabric.js初始化
 */
export const CropCanvas: React.FC<CropCanvasProps> = ({ 
  canvasRef: externalCanvasRef,
  imageUrl 
}) => {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;
  
  const { fabricLoaded, imageInfo } = useCropStore();
  
  const {
    canvasRef: fabricCanvasRef,
    fabricRef,
    createCanvas,
    destroyCanvas
  } = useCropCanvas();
  
  const {
    createCropBox,
    removeCropBox,
    registerEvents
  } = useCropBox();
  
  const {
    createMask,
    removeMask
  } = useCropMask();

  // 初始化Canvas
  useEffect(() => {
    if (fabricLoaded && canvasRef.current && fabricRef.current && imageInfo) {
      // 创建Canvas
      const canvas = createCanvas(
        canvasRef.current,
        imageInfo.scaledWidth,
        imageInfo.scaledHeight
      );
      
      if (canvas) {
        // 这里应该加载图片并创建裁剪框
        // 由于这是示例，具体的实现会比较复杂
      }
    }
    
    return () => {
      destroyCanvas();
      if (fabricCanvasRef.current) {
        removeCropBox(fabricCanvasRef.current);
        removeMask(fabricCanvasRef.current);
      }
    };
  }, [fabricLoaded, imageUrl, imageInfo, createCanvas, destroyCanvas, removeCropBox, removeMask]);

  return (
    <div className="flex items-center justify-center">
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
  );
};