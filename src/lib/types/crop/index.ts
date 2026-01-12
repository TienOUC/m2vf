// 裁剪功能类型定义

// 基础类型
export type EditorMode = 'select' | 'crop' | 'move' | 'resize';
export type CropAction = 'idle' | 'dragging' | 'resizing' | 'rotating';

// 宽高比选项
export type AspectRatioOption = {
  label: string;
  value: number | null;
  width: number;
  height: number;
};

// 预设宽高比
export const ASPECT_RATIOS: AspectRatioOption[] = [
  { label: '原图比例', value: null, width: 0, height: 0 },
  { label: '1:1', value: 1, width: 1, height: 1 },
  { label: '4:3', value: 4/3, width: 4, height: 3 },
  { label: '3:4', value: 3/4, width: 3, height: 4 },
  { label: '16:9', value: 16/9, width: 16, height: 9 },
  { label: '9:16', value: 9/16, width: 9, height: 16 }
];

// 图片信息
export interface ImageInfo {
  url: string;
  naturalWidth: number;
  naturalHeight: number;
  scaledWidth: number;
  scaledHeight: number;
  aspectRatio: number;
  scale: number;
  left: number;
  top: number;
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

// 选择状态
export interface SelectionState {
  isSelected: boolean;
  isResizing: boolean;
  isMoving: boolean;
}

// 裁剪状态
export interface CropState {
  // 基础状态
  imageUrl: string;
  fabricLoaded: boolean;
  loadingError: string | null;
  isProcessing: boolean;
  
  // 图片信息
  imageInfo: ImageInfo | null;
  
  // 编辑器状态
  mode: EditorMode;
  isActive: boolean;
  isDragging: boolean;
  
  // 裁剪框状态
  cropBox: any | null; // Fabric对象，暂时使用any
  cropBoxConfig: CropBoxConfig;
  
  // 宽高比设置
  currentAspectRatio: number | null;
  isOriginalRatio: boolean;
  
  // 遮罩层状态
  maskOpacity: number;
  showMask: boolean;
  
  // 选择状态
  selection: SelectionState;
}

// 裁剪动作
export interface CropActions {
  setImageUrl: (url: string) => void;
  setFabricLoaded: (loaded: boolean) => void;
  setLoadingError: (error: string | null) => void;
  setIsProcessing: (processing: boolean) => void;
  setImageInfo: (info: ImageInfo | null) => void;
  setMode: (mode: EditorMode) => void;
  setIsActive: (active: boolean) => void;
  setIsDragging: (dragging: boolean) => void;
  setCropBox: (cropBox: any | null) => void;
  updateCropBoxConfig: (config: Partial<CropBoxConfig>) => void;
  setMaskOpacity: (opacity: number) => void;
  setShowMask: (show: boolean) => void;
  updateSelection: (selection: Partial<SelectionState>) => void;
  resetCropState: () => void;
  resetAll: () => void;
  // 宽高比相关
  setCurrentAspectRatio: (aspectRatio: number | null) => void;
  setIsOriginalRatio: (isOriginal: boolean) => void;
  updateAspectRatio: (aspectRatio: number | null, isOriginal: boolean) => void;
}

// 裁剪历史记录
export interface CropHistoryRecord {
  timestamp: number;
  state: CropState;
  action: string;
}

// 裁剪坐标
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

// 裁剪结果
export interface CropResult {
  imageUrl: string;
  coordinates: CropCoordinates;
  timestamp: number;
}

// 事件处理函数类型
export type CropEventHandler = (data: any) => void;
export type CropCallback = (result: CropResult) => void;
export type ErrorCallback = (error: string) => void;

// 遮罩配置
export interface MaskConfig {
  color: string;
  opacity: number;
}

// 裁剪框控制点类型
export type ControlPoint = 'tl' | 'tr' | 'bl' | 'br' | 'ml' | 'mr' | 'mt' | 'mb';

// 裁剪框可见性配置
export interface ControlsVisibility {
  tl: boolean;
  tr: boolean;
  bl: boolean;
  br: boolean;
  ml: boolean;
  mr: boolean;
  mt: boolean;
  mb: boolean;
}

// 裁剪事件类型
export interface CropEvent {
  type: 'move' | 'scale' | 'rotate' | 'select';
  target: 'cropBox' | 'image' | 'canvas';
  coordinates: CropCoordinates;
  timestamp: number;
}

// 性能监控数据
export interface PerformanceMetrics {
  renderTime: number;
  eventHandlingTime: number;
  memoryUsage: number;
  fps: number;
}

// 用户操作记录
export interface UserAction {
  id: string;
  type: string;
  timestamp: number;
  payload: any;
  undoable: boolean;
}

// 错误信息
export interface CropError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

// 配置选项
export interface CropEditorOptions {
  minCropSize?: { width: number; height: number };
  maxHistorySteps?: number;
  maskOpacity?: number;
  showGrid?: boolean;
  aspectRatio?: number;
  autoCropArea?: number;
  // 新增配置项
  enableKeyboardShortcuts?: boolean;
  enableTouchGestures?: boolean;
  showRulers?: boolean;
  snapToGrid?: boolean;
  gridSpacing?: number;
  animationDuration?: number;
  theme?: 'light' | 'dark' | 'auto';
}
