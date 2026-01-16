// 图片节点数据类型定义
export interface ImageNodeData {
  label?: string;
  imageUrl?: string;
  onDelete?: (nodeId: string) => void;
  onReplace?: (nodeId: string) => void;
  onEditStart?: (nodeId: string) => void;
  onCropStart?: (nodeId: string, imageUrl: string) => void;
  onImageUpdate?: (nodeId: string, imageUrl: string) => void;
  onDownload?: (nodeId: string) => void;
  onBackgroundRemove?: (nodeId: string) => void;
  isLoading?: boolean;
  isProcessing?: boolean; // 标记为处理中状态
  processingProgress?: number; // 处理进度
  error?: string;
  [key: string]: any; // 索引签名，解决类型约束问题
}

// 图片裁剪编辑器实例类型定义
export interface ImageCropEditorInstance {
  // 执行裁剪操作
  crop: () => Promise<string>;
  // 销毁编辑器实例
  destroy: () => void;
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