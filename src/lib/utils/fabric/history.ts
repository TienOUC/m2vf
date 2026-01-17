import type { FabricCropHistoryRecord, FabricObject, HistoryManagerConfig } from '@/lib/types/editor/fabric';

/**
 * 创建历史记录管理器配置
 */
export const createHistoryConfig = (options?: Partial<HistoryManagerConfig>): HistoryManagerConfig => {
  return {
    maxSteps: options?.maxSteps || 20,
    autoSave: options?.autoSave !== undefined ? options.autoSave : true,
    saveDelay: options?.saveDelay || 300
  };
};

/**
 * 从Fabric对象创建历史记录
 */
export const createHistoryRecord = (cropBox: FabricObject, image: FabricObject): FabricCropHistoryRecord => {
  return {
    cropBox: {
      left: cropBox.left || 0,
      top: cropBox.top || 0,
      width: cropBox.width || 0,
      height: cropBox.height || 0
    },
    scaleX: image.scaleX || 1,
    scaleY: image.scaleY || 1,
    rotation: (image as any).angle || 0,
    timestamp: Date.now()
  };
};

/**
 * 检查两个历史记录是否相同
 */
export const areHistoryRecordsEqual = (record1: FabricCropHistoryRecord, record2: FabricCropHistoryRecord): boolean => {
  if (!record1 || !record2) return false;
  
  return (
    record1.cropBox.left === record2.cropBox.left &&
    record1.cropBox.top === record2.cropBox.top &&
    record1.cropBox.width === record2.cropBox.width &&
    record1.cropBox.height === record2.cropBox.height &&
    record1.scaleX === record2.scaleX &&
    record1.scaleY === record2.scaleY &&
    record1.rotation === record2.rotation
  );
};
