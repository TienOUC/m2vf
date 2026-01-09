import { useCallback, useRef } from 'react';
import type { FabricObject } from '@/types/fabric-image-editor';
import type { CropBoxConfig } from '@/types/crop';

/**
 * 裁剪框管理hook
 */
export const useCropBox = () => {
  const cropBoxRef = useRef<FabricObject | null>(null);

  // 创建裁剪框
  const createCropBox = useCallback((
    fabric: any,
    config: CropBoxConfig,
    canvas: any
  ): FabricObject | null => {
    if (!fabric || !canvas) return null;

    const cropBox = new fabric.Rect({
      width: config.width,
      height: config.height,
      left: config.left,
      top: config.top,
      fill: 'transparent',
      stroke: config.stroke,
      strokeWidth: config.strokeWidth,
      strokeDashArray: config.strokeDashArray,
      cornerSize: config.cornerSize,
      cornerColor: config.cornerColor,
      cornerStyle: 'rect',
      transparentCorners: false,
      hasControls: true,
      hasBorders: true,
      lockRotation: true,
      lockUniScaling: false,
      minWidth: config.minWidth,
      minHeight: config.minHeight,
      borderColor: config.stroke,
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

    cropBoxRef.current = cropBox;
    canvas.add(cropBox);
    canvas.setActiveObject(cropBox);
    canvas.renderAll();

    return cropBox;
  }, []);

  // 更新裁剪框位置和尺寸
  const updateCropBox = useCallback((
    left: number,
    top: number,
    width: number,
    height: number
  ) => {
    if (cropBoxRef.current) {
      cropBoxRef.current.set({
        left,
        top,
        width,
        height
      });
      cropBoxRef.current.setCoords();
    }
  }, []);

  // 获取裁剪框边界
  const getCropBoxBounds = useCallback(() => {
    if (cropBoxRef.current) {
      return cropBoxRef.current.getBoundingRect(true);
    }
    return null;
  }, []);

  // 移除裁剪框
  const removeCropBox = useCallback((canvas: any) => {
    if (cropBoxRef.current && canvas) {
      canvas.remove(cropBoxRef.current);
      cropBoxRef.current = null;
    }
  }, []);

  // 注册事件监听器
  const registerEvents = useCallback((
    onMove?: () => void,
    onScale?: () => void,
    onRotate?: () => void
  ) => {
    if (!cropBoxRef.current) return;

    const cropBox = cropBoxRef.current;

    if (onMove) {
      cropBox.on('moving', onMove);
    }

    if (onScale) {
      cropBox.on('scaling', onScale);
    }

    if (onRotate) {
      cropBox.on('rotating', onRotate);
    }
  }, []);

  // 移除事件监听器
  const unregisterEvents = useCallback(() => {
    if (cropBoxRef.current) {
      cropBoxRef.current.off('moving');
      cropBoxRef.current.off('scaling');
      cropBoxRef.current.off('rotating');
    }
  }, []);

  return {
    cropBoxRef,
    createCropBox,
    updateCropBox,
    getCropBoxBounds,
    removeCropBox,
    registerEvents,
    unregisterEvents
  };
};