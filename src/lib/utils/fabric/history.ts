import type { FabricCropHistoryRecord, FabricObject, FabricCanvas, HistoryManagerConfig, HistoryEvent } from '@/lib/types/editor/fabric';

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

/**
 * 从历史记录恢复状态
 */
export const restoreFromHistory = (
  record: FabricCropHistoryRecord,
  cropBox: FabricObject | null,
  image: FabricObject | null,
  canvas: FabricCanvas | null
): boolean => {
  if (!cropBox || !image || !canvas || !record) return false;

  try {
    // 恢复裁剪框状态
    cropBox.set({
      left: record.cropBox.left,
      top: record.cropBox.top,
      width: record.cropBox.width,
      height: record.cropBox.height
    });

    // 恢复图片状态
    image.set({
      scaleX: record.scaleX,
      scaleY: record.scaleY,
      angle: record.rotation || 0
    });

    // 更新坐标并重新渲染
    cropBox.setCoords();
    image.setCoords();
    canvas.renderAll();

    return true;
  } catch (error) {
    console.error('Error restoring from history:', error);
    return false;
  }
};

/**
 * 序列化历史记录
 */
export const serializeHistory = (records: FabricCropHistoryRecord[]): string => {
  try {
    return JSON.stringify(records);
  } catch (error) {
    console.error('Error serializing history:', error);
    return '[]';
  }
};

/**
 * 反序列化历史记录
 */
export const deserializeHistory = (serialized: string): FabricCropHistoryRecord[] => {
  try {
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Error deserializing history:', error);
    return [];
  }
};

/**
 * 创建历史记录事件
 */
export const createHistoryEvent = (type: HistoryEvent['type'], record?: FabricCropHistoryRecord): HistoryEvent => {
  return {
    type,
    timestamp: Date.now(),
    record
  };
};

/**
 * 清理历史记录
 */
export const cleanupHistory = (records: FabricCropHistoryRecord[], currentIndex: number, maxSteps: number): { cleanedRecords: FabricCropHistoryRecord[], newIndex: number } => {
  if (records.length <= maxSteps) {
    return { cleanedRecords: records, newIndex: currentIndex };
  }

  // 如果当前不是最新状态，移除后面的历史记录
  const trimmedRecords = records.slice(0, currentIndex + 1);
  
  // 如果还是超过最大步数，移除最旧的记录
  if (trimmedRecords.length > maxSteps) {
    const overflow = trimmedRecords.length - maxSteps;
    const cleanedRecords = trimmedRecords.slice(overflow);
    return { cleanedRecords, newIndex: currentIndex - overflow };
  }

  return { cleanedRecords: trimmedRecords, newIndex: currentIndex };
};
