import type { Fabric, CropBoxConfig, MaskConfig, FabricCanvas, FabricObject } from '@/types/editor/fabric';

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
    // 添加缩放约束事件处理器
    onBeforeScaleRotate: (target: unknown) => {
      // 在缩放前进行约束检查
      return true;
    },
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


  // 使用getBoundingRect()获取裁剪框的实际边界，确保坐标系统统一
  const boundingRect = cropBox.getBoundingRect(true);
  
  const cropBoxLeft = boundingRect.left;
  const cropBoxTop = boundingRect.top;
  const cropBoxWidth = boundingRect.width;
  const cropBoxHeight = boundingRect.height;

  // 使用推荐的 clipPath + 奇偶填充规则方式
  // 创建全屏遮罩层，通过 clipPath 实现挖空效果
  const maskLayer = new fabric.Rect({
    left: 0,
    top: 0,
    width: canvas.width,
    height: canvas.height,
    fill: maskConfig.color,
    opacity: maskConfig.opacity,
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top',
    // 核心：使用 clipPath + 奇偶填充规则实现挖空效果
    clipPath: (() => {
      const path = new fabric.Path(getMaskPath(canvas.width, canvas.height, cropBoxLeft, cropBoxTop, cropBoxWidth, cropBoxHeight), { 
        fillRule: 'evenodd',
        originX: 'left',
        originY: 'top',
        left: 0,
        top: 0,
        absolutePositioned: true
      });
      return path;
    })()
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

  // 使用getBoundingRect()获取裁剪框的实际边界，确保坐标系统统一
  const boundingRect = cropBox.getBoundingRect(true);
  const cropBoxLeft = boundingRect.left;
  const cropBoxTop = boundingRect.top;
  const cropBoxWidth = boundingRect.width;
  const cropBoxHeight = boundingRect.height;

  // 优化：增加阈值避免过于频繁的更新
  if (lastBounds && 
      Math.abs(lastBounds.left - cropBoxLeft) < 1.0 &&
      Math.abs(lastBounds.top - cropBoxTop) < 1.0 &&
      Math.abs(lastBounds.width - cropBoxWidth) < 1.0 &&
      Math.abs(lastBounds.height - cropBoxHeight) < 1.0) {
    // 边界变化很小，跳过更新以提高性能
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
    // 重新创建 clipPath 而不是更新现有对象
    const newPath = new (maskLayer.clipPath.constructor as any)(
      getMaskPath(canvas.width, canvas.height, cropBoxLeft, cropBoxTop, cropBoxWidth, cropBoxHeight),
      {
        fillRule: 'evenodd',
        originX: 'left',
        originY: 'top',
        left: 0,
        top: 0,
        absolutePositioned: true
      }
    );
    
    // 替换 clipPath
    maskLayer.clipPath = newPath;
  }
  
  // 优化：只更新必要的对象，避免全局重绘
  maskLayer.setCoords();
  
  // 标记遮罩层需要重绘
  (maskLayer as any).dirty = true;
  
  // 使用异步重绘提高性能
  (canvas as any).requestRenderAll?.() || canvas.renderAll();
};

export const addImageToCanvas = (fabric: Fabric, canvas: FabricCanvas, imageUrl: string, callback?: (img: FabricObject) => void): void => {
  fabric.Image.fromURL(imageUrl, (img: FabricObject) => {
    // 设置图片原点为左上角，与画布一致
    img.set({
      originX: 'left',
      originY: 'top',
      left: 0,
      top: 0
    });
    canvas.add(img);
    callback?.(img);
  }, {
    crossOrigin: 'anonymous' // 处理跨域图片
  });
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