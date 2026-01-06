// 图片裁剪编辑器实例类型定义
export interface ImageCropEditorInstance {
  // 执行裁剪操作
  crop: () => Promise<string>;
  // 撤销操作
  undo: () => void;
  // 重做操作
  redo: () => void;
  // 销毁编辑器实例
  destroy: () => void;
  // 重置裁剪框
  resetCropBox: () => void;
}

// 裁剪编辑器选项类型定义
export interface ImageCropEditorOptions {
  // 图片URL
  imageUrl: string;
  // 画布宽度
  canvasWidth: number;
  // 画布高度
  canvasHeight: number;
  // 最小裁剪尺寸
  minCropSize?: { width: number; height: number };
  // 裁剪框样式
  cropBoxStyle?: {
    // 边框宽度
    borderWidth: number;
    // 边框颜色
    borderColor: string;
    // 边框样式
    borderStyle: string;
    // 控制点大小
    cornerSize: number;
    // 控制点颜色
    cornerColor: string;
  };
  // 遮罩层样式
  maskStyle?: {
    // 遮罩颜色
    color: string;
    // 遮罩透明度 (0-1)
    opacity: number;
  };
  // 初始裁剪比例
  initialRatio?: number | null;
  // 历史记录最大步数
  maxHistorySteps?: number;
}

// 裁剪历史记录类型
export interface CropHistoryRecord {
  // 裁剪框位置和大小
  cropBox: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  // 图片缩放比例
  scaleX: number;
  scaleY: number;
}