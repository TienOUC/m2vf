// Fabric图片编辑器类型定义
export type Fabric = any;

// Fabric对象接口
export interface FabricObject {
  set: (options: Record<string, unknown>) => void;
  getBoundingRect: (absolute?: boolean) => { left: number; top: number; width: number; height: number };
  setCoords: () => void;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  on: (event: string, callback: (e: unknown) => void) => void;
  off: (event: string, callback?: (e: unknown) => void) => void;
  clipPath?: {
    set: (options: Record<string, unknown>) => void;
    setCoords: () => void;
  };
}

// Fabric画布接口
export interface FabricCanvas {
  dispose: () => void;
  add: (object: FabricObject) => void;
  remove: (object: FabricObject) => void;
  clear: () => void;
  renderAll: () => void;
  setActiveObject: (object: FabricObject) => void;
  sendObjectToBack: (object: FabricObject) => void;
  bringObjectToFront: (object: FabricObject) => void;
  setDimensions: (dimensions: { width: number; height: number }) => void;
  upperCanvasEl?: HTMLCanvasElement;
  width: number;
  height: number;
}

// 组件属性接口
export interface FabricImageEditorProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

// 裁剪历史记录
export interface CropHistoryRecord {
  cropBox: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  scaleX: number;
  scaleY: number;
  rotation?: number;
  timestamp: number;
}

// 历史记录管理配置
export interface HistoryManagerConfig {
  maxSteps: number;
  autoSave: boolean;
  saveDelay: number;
}

// 历史记录操作类型
export type HistoryActionType = 'save' | 'undo' | 'redo' | 'reset' | 'clear';

// 历史记录事件类型
export interface HistoryEvent {
  type: HistoryActionType;
  timestamp: number;
  record?: CropHistoryRecord;
}

// 编辑器配置选项
export interface ImageCropEditorOptions {
  imageUrl: string;
  canvasWidth: number;
  canvasHeight: number;
  minCropSize?: { width: number; height: number };
  cropBoxStyle?: {
    borderWidth: number;
    borderColor: string;
    borderStyle: string;
    cornerSize: number;
    cornerColor: string;
  };
  maskStyle?: {
    color: string;
    opacity: number;
  };
  initialRatio?: number | null;
  maxHistorySteps?: number;
}

// 画布引用类型
export interface CanvasRefs {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  fabricCanvasRef: React.RefObject<FabricCanvas | null>;
  imageRef: React.RefObject<FabricObject | null>;
  cropBoxRef: React.RefObject<FabricObject | null>;
  maskRef: React.RefObject<FabricObject | null>;
  fabricRef: React.RefObject<Fabric | null>;
}

// 编辑器状态
export interface EditorState {
  fabricLoaded: boolean;
  loadingError: string | null;
}

// 图片尺寸信息
export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  scale: number;
  scaledWidth: number;
  scaledHeight: number;
}

// 裁剪框配置
export interface CropBoxConfig {
  width: number;
  height: number;
  left: number;
  top: number;
  stroke: string;
  strokeWidth: number;
  strokeDashArray: number[];
  cornerSize: number;
  cornerColor: string;
  minWidth: number;
  minHeight: number;
}

// 遮罩层配置
export interface MaskConfig {
  color: string;
  opacity: number;
}

// 裁剪坐标计算
export interface CropCoordinates {
  cropLeft: number;
  cropTop: number;
  cropWidth: number;
  cropHeight: number;
  imgLeft: number;
  imgTop: number;
  imgScaleX: number;
  imgScaleY: number;
}