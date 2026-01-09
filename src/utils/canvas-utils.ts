import type { Fabric, CropBoxConfig, MaskConfig, FabricCanvas, FabricObject } from '@/types/fabric-image-editor';

export const createCanvas = (canvasRef: React.RefObject<HTMLCanvasElement>, fabric: Fabric, width: number, height: number): FabricCanvas | null => {
  if (!canvasRef.current) return null;

  const canvas = new fabric.Canvas(canvasRef.current, {
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

export const createCropBox = (fabric: Fabric, config: CropBoxConfig): FabricObject => {
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

export const createMask = (fabric: Fabric, canvas: FabricCanvas, cropBox: FabricObject, maskConfig: MaskConfig = { color: 'rgba(0, 0, 0, 0.7)', opacity: 0.7 }): FabricObject | null => {
  if (!canvas || !cropBox) return null;

  // 直接使用裁剪框的坐标，确保坐标系统统一
  const cropBoxLeft = cropBox.left || 0;
  const cropBoxTop = cropBox.top || 0;
  const cropBoxWidth = cropBox.width || 0;
  const cropBoxHeight = cropBox.height || 0;

  // 使用推荐的 clipPath + 奇偶填充规则方式
  // 创建全屏遮罩层，通过 clipPath 实现挖空效果
  const maskLayer = new fabric.Rect({
    left: 0,
    top: 0,
    width: canvas.width,
    height: canvas.height,
    fill: maskConfig.color,
    selectable: false,
    evented: false,
    // 核心：使用 clipPath + 奇偶填充规则实现挖空效果
    clipPath: new fabric.Path(getMaskPath(canvas.width, canvas.height, cropBoxLeft, cropBoxTop, cropBoxWidth, cropBoxHeight), { 
      fillRule: 'evenodd' 
    })
  });

  return maskLayer as FabricObject;
};

// 生成遮罩路径的工具函数
const getMaskPath = (canvasWidth: number, canvasHeight: number, cropBoxLeft: number, cropBoxTop: number, cropBoxWidth: number, cropBoxHeight: number): string => {
  // 严格按照Fabric.js路径格式：外层全屏路径 + 内层裁剪框路径
  // 外层路径：顺时针，内层路径：逆时针，确保奇偶填充规则正确工作
  return `M 0 0 L ${canvasWidth} 0 L ${canvasWidth} ${canvasHeight} L 0 ${canvasHeight} L 0 0 z M ${cropBoxLeft} ${cropBoxTop} L ${cropBoxLeft + cropBoxWidth} ${cropBoxTop} L ${cropBoxLeft + cropBoxWidth} ${cropBoxTop + cropBoxHeight} L ${cropBoxLeft} ${cropBoxTop + cropBoxHeight} L ${cropBoxLeft} ${cropBoxTop} z`;
};

// 缓存上一次的裁剪框边界，用于增量更新
let lastBounds: { left: number; top: number; width: number; height: number } | null = null;

// 重置边界缓存，在创建新遮罩层时调用
export const resetMaskBoundsCache = () => {
  lastBounds = null;
};

export const updateMaskClipPath = (canvas: FabricCanvas | null, cropBox: FabricObject | null, maskLayer: FabricObject | null) => {
  if (!canvas || !cropBox || !maskLayer) return;

  // 直接使用裁剪框的坐标，确保坐标系统统一
  const cropBoxLeft = cropBox.left || 0;
  const cropBoxTop = cropBox.top || 0;
  const cropBoxWidth = cropBox.width || 0;
  const cropBoxHeight = cropBox.height || 0;

  // 检查边界是否发生变化，避免不必要的更新
  if (lastBounds && 
      Math.abs(lastBounds.left - cropBoxLeft) < 0.5 &&
      Math.abs(lastBounds.top - cropBoxTop) < 0.5 &&
      Math.abs(lastBounds.width - cropBoxWidth) < 0.5 &&
      Math.abs(lastBounds.height - cropBoxHeight) < 0.5) {
    // 边界变化很小，跳过更新
    return;
  }

  // 更新缓存
  lastBounds = { 
    left: cropBoxLeft, 
    top: cropBoxTop, 
    width: cropBoxWidth, 
    height: cropBoxHeight 
  };

  // 更新遮罩层的 clipPath 路径
  if (maskLayer.clipPath) {
    maskLayer.clipPath.set({
      path: getMaskPath(canvas.width, canvas.height, cropBoxLeft, cropBoxTop, cropBoxWidth, cropBoxHeight)
    });
    maskLayer.clipPath.setCoords();
  }
  
  // 确保遮罩层自身坐标正确
  maskLayer.setCoords();
  
  // 立即重绘整个画布，确保遮罩层与裁剪框同步更新
  canvas.renderAll();
};

export const destroyCanvas = (canvas: FabricCanvas | null) => {
  if (canvas) {
    try {
      // 先清除所有对象
      canvas.clear();
      // 然后销毁Canvas
      canvas.dispose();
    } catch (error) {
      console.warn('Error while disposing canvas:', error);
    }
  }
};