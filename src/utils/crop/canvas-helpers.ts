import type { Fabric, FabricCanvas, FabricObject } from '@/types/fabric-image-editor';
import type { CropBoxConfig, MaskConfig } from '@/types/crop';

/**
 * 画布相关工具函数
 */

/**
 * 创建Fabric Canvas实例
 */
export const createCanvas = (
  canvasElement: HTMLCanvasElement,
  fabric: Fabric,
  width: number,
  height: number
): FabricCanvas | null => {
  if (!canvasElement || !fabric) return null;

  const canvas = new fabric.Canvas(canvasElement, {
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

  return canvas as FabricCanvas;
};

/**
 * 销毁Canvas实例
 */
export const destroyCanvas = (canvas: FabricCanvas | null) => {
  if (canvas) {
    try {
      canvas.clear();
      canvas.dispose();
    } catch (error) {
      console.warn('Error while disposing canvas:', error);
    }
  }
};

/**
 * 更新Canvas尺寸
 */
export const updateCanvasDimensions = (
  canvas: FabricCanvas | null,
  width: number,
  height: number
) => {
  if (canvas) {
    canvas.setDimensions({ width, height });
    canvas.renderAll();
  }
};

/**
 * 创建裁剪框
 */
export const createCropBox = (
  fabric: Fabric,
  config: CropBoxConfig
): FabricObject => {
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

  return cropBox as FabricObject;
};

/**
 * 创建遮罩层
 */
export const createMask = (
  fabric: Fabric,
  canvas: FabricCanvas,
  width: number,
  height: number,
  config: MaskConfig = { color: 'rgba(0, 0, 0, 0.7)', opacity: 0.7 }
): FabricObject | null => {
  if (!canvas) return null;

  const maskLayer = new fabric.Rect({
    left: 0,
    top: 0,
    width,
    height,
    fill: config.color,
    opacity: config.opacity,
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top'
  });

  return maskLayer as FabricObject;
};

/**
 * 更新遮罩裁剪路径
 */
export const updateMaskClipPath = (
  canvas: FabricCanvas | null,
  cropBox: FabricObject | null,
  maskLayer: FabricObject | null
) => {
  if (!canvas || !cropBox || !maskLayer) return;

  // 获取裁剪框边界
  const boundingRect = cropBox.getBoundingRect(true);
  
  // 这里可以实现更复杂的遮罩路径更新逻辑
  canvas.renderAll();
};