import { useCallback, useRef } from 'react';
import type { FabricObject } from '@/types/editor/fabric';

/**
 * 遮罩层管理hook
 */
export const useCropMask = () => {
  const maskRef = useRef<FabricObject | null>(null);

  // 创建遮罩层
  const createMask = useCallback((
    fabric: any,
    canvas: any,
    width: number,
    height: number,
    opacity: number = 0.7
  ): FabricObject | null => {
    if (!fabric || !canvas) return null;

    // 移除现有的遮罩层
    if (maskRef.current) {
      canvas.remove(maskRef.current);
    }

    const maskLayer = new fabric.Rect({
      left: 0,
      top: 0,
      width,
      height,
      fill: 'rgba(0, 0, 0, 0.7)',
      opacity,
      selectable: false,
      evented: false,
      originX: 'left',
      originY: 'top'
    });

    maskRef.current = maskLayer;
    canvas.add(maskLayer);
    canvas.renderAll();

    return maskLayer;
  }, []);

  // 更新遮罩透明度
  const updateMaskOpacity = useCallback((opacity: number) => {
    if (maskRef.current) {
      maskRef.current.set({ opacity });
      // 重新渲染需要通过canvas进行
    }
  }, []);

  // 显示/隐藏遮罩
  const toggleMask = useCallback((show: boolean) => {
    if (maskRef.current) {
      maskRef.current.set({ visible: show });
      // 重新渲染需要通过canvas进行
    }
  }, []);

  // 移除遮罩层
  const removeMask = useCallback((canvas: any) => {
    if (maskRef.current && canvas) {
      canvas.remove(maskRef.current);
      maskRef.current = null;
    }
  }, []);

  // 更新遮罩裁剪路径
  const updateMaskClipPath = useCallback((
    cropBoxBounds: { left: number; top: number; width: number; height: number }
  ) => {
    if (!maskRef.current) return;

    // 这里可以实现更复杂的遮罩路径更新逻辑
    // 例如使用clipPath或者动态计算遮罩区域
  }, []);

  return {
    maskRef,
    createMask,
    updateMaskOpacity,
    toggleMask,
    removeMask,
    updateMaskClipPath
  };
};