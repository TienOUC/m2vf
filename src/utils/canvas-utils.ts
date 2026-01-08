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

export const createMask = (fabric: Fabric, canvas: FabricCanvas, cropBox: FabricObject, maskConfig: MaskConfig = { color: 'rgba(0, 0, 0, 0.6)', opacity: 0.6 }): FabricObject | null => {
  if (!canvas || !cropBox) return null;

  // 获取裁剪框的实际边界（相对于画布的绝对坐标）
  const bounds = cropBox.getBoundingRect(true);

  // 创建四个矩形来模拟洞形遮罩效果
  const maskGroup = new fabric.Group([], {
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top'
  });

  // 创建四个遮罩矩形：上、下、左、右
  const masks = [
    // 上遮罩
    new fabric.Rect({
      left: 0,
      top: 0,
      width: canvas.width,
      height: Math.max(0, bounds.top),
      fill: maskConfig.color,
      selectable: false,
      evented: false,
      originX: 'left',
      originY: 'top'
    }),
    // 下遮罩
    new fabric.Rect({
      left: 0,
      top: bounds.top + bounds.height,
      width: canvas.width,
      height: Math.max(0, canvas.height - (bounds.top + bounds.height)),
      fill: maskConfig.color,
      selectable: false,
      evented: false,
      originX: 'left',
      originY: 'top'
    }),
    // 左遮罩
    new fabric.Rect({
      left: 0,
      top: bounds.top,
      width: Math.max(0, bounds.left),
      height: Math.max(0, bounds.height),
      fill: maskConfig.color,
      selectable: false,
      evented: false,
      originX: 'left',
      originY: 'top'
    }),
    // 右遮罩
    new fabric.Rect({
      left: bounds.left + bounds.width,
      top: bounds.top,
      width: Math.max(0, canvas.width - (bounds.left + bounds.width)),
      height: Math.max(0, bounds.height),
      fill: maskConfig.color,
      selectable: false,
      evented: false,
      originX: 'left',
      originY: 'top'
    })
  ];

  masks.forEach(maskRect => {
    maskGroup.add(maskRect);
    maskRect.setCoords();
  });

  // 设置 Group 本身的坐标为原点，确保子对象坐标是绝对的
  maskGroup.set({
    left: 0,
    top: 0,
    width: canvas.width,
    height: canvas.height
  });
  maskGroup.setCoords();

  return maskGroup as FabricObject;
};

export const updateMaskClipPath = (canvas: FabricCanvas | null, cropBox: FabricObject | null, maskGroup: FabricObject | null) => {
  if (!canvas || !cropBox || !maskGroup) return;

  // 获取裁剪框的实际边界
  const bounds = cropBox.getBoundingRect(true);

  // 更新四个遮罩矩形的位置和尺寸
  if (maskGroup && (maskGroup as any)._objects && (maskGroup as any)._objects.length === 4) {
    const [topMask, bottomMask, leftMask, rightMask] = (maskGroup as any)._objects;

    // 计算每个遮罩矩形的绝对坐标
    // topMask: 从 (0,0) 到 (canvas.width, bounds.top)
    topMask.set({
      left: 0,
      top: 0,
      width: canvas.width,
      height: bounds.top
    });
    topMask.setCoords();

    // bottomMask: 从 (0, bounds.top + bounds.height) 到 (canvas.width, canvas.height)
    bottomMask.set({
      left: 0,
      top: bounds.top + bounds.height,
      width: canvas.width,
      height: canvas.height - (bounds.top + bounds.height)
    });
    bottomMask.setCoords();

    // leftMask: 从 (0, bounds.top) 到 (bounds.left, bounds.top + bounds.height)
    leftMask.set({
      left: 0,
      top: bounds.top,
      width: bounds.left,
      height: bounds.height
    });
    leftMask.setCoords();

    // rightMask: 从 (bounds.left + bounds.width, bounds.top) 到 (canvas.width, bounds.top + bounds.height)
    rightMask.set({
      left: bounds.left + bounds.width,
      top: bounds.top,
      width: canvas.width - (bounds.left + bounds.width),
      height: bounds.height
    });
    rightMask.setCoords();
  }
  canvas.renderAll();
};

export const destroyCanvas = (canvas: FabricCanvas | null) => {
  if (canvas) {
    canvas.dispose();
  }
};