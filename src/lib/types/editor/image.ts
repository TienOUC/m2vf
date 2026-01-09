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