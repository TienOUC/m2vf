import { useRef, useCallback } from 'react';
import { useDebounce } from '@/hooks/ui/useDebounce';
import type { FabricObject, HistoryManagerConfig } from '@/lib/types/editor/fabric';
import { createHistoryConfig, createHistoryRecord, areHistoryRecordsEqual } from '@/lib/utils/fabric/history';

interface UseEnhancedCropHistoryProps {
  maxHistorySteps?: number;
  autoSave?: boolean;
  saveDelay?: number;
}

export const useEnhancedCropHistory = ({
  maxHistorySteps = 20,
  autoSave = true,
  saveDelay = 300
}: UseEnhancedCropHistoryProps = {}) => {
  // 历史记录配置
  const configRef = useRef<HistoryManagerConfig>(createHistoryConfig({
    maxSteps: maxHistorySteps,
    autoSave,
    saveDelay
  }));

  // 历史记录数组和索引（内部使用，外部不依赖）
  const historyRef = useRef<Array<ReturnType<typeof createHistoryRecord>>>([]);
  const historyIndexRef = useRef<number>(-1);

  // 创建防抖保存函数
  const { debouncedCallback: debouncedSaveHistory } = useDebounce(
    (cropBox: FabricObject | null, image: FabricObject | null) => {
      if (!cropBox || !image || !configRef.current.autoSave) return;

      // 创建新的历史记录
      const newRecord = createHistoryRecord(cropBox, image);

      // 检查是否与当前状态相同，如果相同则不保存
      const currentIndex = historyIndexRef.current;
      const currentState = currentIndex >= 0 ? historyRef.current[currentIndex] : null;
      if (currentState && areHistoryRecordsEqual(currentState, newRecord)) {
        return;
      }

      const history = historyRef.current;

      // 如果当前不是最新状态，移除后面的历史记录
      if (currentIndex < history.length - 1) {
        historyRef.current = history.slice(0, currentIndex + 1);
      }

      // 添加新记录
      historyRef.current.push(newRecord);

      // 限制历史记录数量
      if (historyRef.current.length > configRef.current.maxSteps) {
        const overflow = historyRef.current.length - configRef.current.maxSteps;
        historyRef.current = historyRef.current.slice(overflow);
        historyIndexRef.current = historyRef.current.length - 1;
      } else {
        historyIndexRef.current++;
      }
    },
    saveDelay
  );

  /**
   * 设置初始状态
   */
  const setInitialState = useCallback((cropBox: FabricObject | null, image: FabricObject | null) => {
    if (!cropBox || !image) return false;

    // 创建初始记录
    const initialRecord = createHistoryRecord(cropBox, image);
    
    // 清空历史记录并添加初始状态
    historyRef.current = [initialRecord];
    historyIndexRef.current = 0;

    return true;
  }, []);

  /**
   * 撤销操作
   */
  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return null;

    historyIndexRef.current--;
    return historyRef.current[historyIndexRef.current];
  }, []);

  /**
   * 重做操作
   */
  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return null;

    historyIndexRef.current++;
    return historyRef.current[historyIndexRef.current];
  }, []);

  /**
   * 检查是否可以撤销
   */
  const canUndo = useCallback(() => {
    return historyIndexRef.current > 0;
  }, []);

  /**
   * 检查是否可以重做
   */
  const canRedo = useCallback(() => {
    return historyIndexRef.current < historyRef.current.length - 1;
  }, []);

  return {
    // 只保留实际使用的功能
    saveHistory: debouncedSaveHistory,
    setInitialState,
    undo,
    redo,
    canUndo,
    canRedo
  };
};
