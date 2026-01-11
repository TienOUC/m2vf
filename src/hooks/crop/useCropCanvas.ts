import { useCallback, useRef } from 'react';
import type { Fabric, FabricCanvas } from '@/types/editor/fabric';

/**
 * Fabric Canvas管理hook
 */
export const useCropCanvas = () => {
  const canvasRef = useRef<FabricCanvas | null>(null);
  const fabricRef = useRef<Fabric | null>(null);

  // 创建Canvas
  const createCanvas = useCallback((
    canvasElement: HTMLCanvasElement,
    width: number,
    height: number
  ): FabricCanvas | null => {
    if (!fabricRef.current || !canvasElement) return null;

    const canvas = new fabricRef.current.Canvas(canvasElement, {
      width,
      height,
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

    canvasRef.current = canvas;
    return canvas;
  }, []);

  // 销毁Canvas
  const destroyCanvas = useCallback(() => {
    if (canvasRef.current) {
      try {
        canvasRef.current.clear();
        canvasRef.current.dispose();
      } catch (error) {
        console.warn('Error while disposing canvas:', error);
      }
      canvasRef.current = null;
    }
  }, []);

  // 更新Canvas尺寸
  const updateCanvasDimensions = useCallback((width: number, height: number) => {
    if (canvasRef.current) {
      canvasRef.current.setDimensions({ width, height });
      canvasRef.current.renderAll();
    }
  }, []);

  return {
    canvasRef,
    fabricRef,
    createCanvas,
    destroyCanvas,
    updateCanvasDimensions
  };
};