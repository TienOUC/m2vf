import { useRef, useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/ui/useDebounce';
import type { CropHistoryRecord, FabricObject, FabricCanvas, HistoryManagerConfig, HistoryEvent } from '@/lib/types/editor/fabric';
import { createHistoryConfig, createHistoryRecord, areHistoryRecordsEqual, restoreFromHistory, createHistoryEvent } from '@/lib/utils/fabric/history';

interface UseEnhancedCropHistoryProps {
  maxHistorySteps?: number;
  autoSave?: boolean;
  saveDelay?: number;
  onHistoryChange?: (event: HistoryEvent) => void;
}

export const useEnhancedCropHistory = ({
  maxHistorySteps = 20,
  autoSave = true,
  saveDelay = 300,
  onHistoryChange
}: UseEnhancedCropHistoryProps = {}) => {
  // 历史记录配置
  const configRef = useRef<HistoryManagerConfig>(createHistoryConfig({
    maxSteps: maxHistorySteps,
    autoSave,
    saveDelay
  }));

  // 历史记录数组
  const historyRef = useRef<CropHistoryRecord[]>([]);
  // 当前历史记录索引
  const historyIndexRef = useRef<number>(-1);
  // 初始状态引用
  const initialStateRef = useRef<CropHistoryRecord | null>(null);

  // 状态用于触发组件重渲染
  const [, setHistoryUpdate] = useState<number>(0);

  // 创建防抖保存函数
  const { debouncedCallback: debouncedSaveHistory, cancel: cancelSaveHistory } = useDebounce(
    (cropBox: FabricObject | null, image: FabricObject | null) => {
      saveHistory(cropBox, image);
    },
    configRef.current.saveDelay
  );

  /**
   * 获取当前状态
   */
  const getCurrentState = useCallback((): CropHistoryRecord | null => {
    const index = historyIndexRef.current;
    if (index < 0 || index >= historyRef.current.length) {
      return null;
    }
    return historyRef.current[index];
  }, []);

  /**
   * 保存当前状态到历史记录
   */
  const saveHistory = useCallback((cropBox: FabricObject | null, image: FabricObject | null, isManual = false) => {
    if (!cropBox || !image || (!isManual && !configRef.current.autoSave)) return;

    // 创建新的历史记录
    const newRecord = createHistoryRecord(cropBox, image);

    // 检查是否与当前状态相同，如果相同则不保存
    const currentState = getCurrentState();
    if (currentState && areHistoryRecordsEqual(currentState, newRecord)) {
      return;
    }

    const currentIndex = historyIndexRef.current;
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

    // 触发状态更新
    setHistoryUpdate(prev => prev + 1);

    // 触发历史记录变化事件
    if (onHistoryChange) {
      onHistoryChange(createHistoryEvent('save', newRecord));
    }
  }, [onHistoryChange, getCurrentState]);

  /**
   * 撤销操作
   */
  const undo = useCallback(() => {
    cancelSaveHistory();
    
    const currentIndex = historyIndexRef.current;
    if (currentIndex <= 0) {
      return null;
    }

    historyIndexRef.current--;
    const previousState = historyRef.current[historyIndexRef.current];

    // 触发状态更新
    setHistoryUpdate(prev => prev + 1);

    // 触发历史记录变化事件
    if (onHistoryChange) {
      onHistoryChange(createHistoryEvent('undo', previousState));
    }

    return previousState;
  }, [onHistoryChange, cancelSaveHistory]);

  /**
   * 重做操作
   */
  const redo = useCallback(() => {
    cancelSaveHistory();
    
    const currentIndex = historyIndexRef.current;
    const history = historyRef.current;
    if (currentIndex >= history.length - 1) {
      return null;
    }

    historyIndexRef.current++;
    const nextState = historyRef.current[historyIndexRef.current];

    // 触发状态更新
    setHistoryUpdate(prev => prev + 1);

    // 触发历史记录变化事件
    if (onHistoryChange) {
      onHistoryChange(createHistoryEvent('redo', nextState));
    }

    return nextState;
  }, [onHistoryChange, cancelSaveHistory]);

  /**
   * 重置到初始状态
   */
  const reset = useCallback(() => {
    cancelSaveHistory();
    
    if (!initialStateRef.current) {
      return false;
    }

    // 清理历史记录，只保留初始状态
    historyRef.current = [initialStateRef.current];
    historyIndexRef.current = 0;

    // 触发状态更新
    setHistoryUpdate(prev => prev + 1);

    // 触发历史记录变化事件
    if (onHistoryChange) {
      onHistoryChange(createHistoryEvent('reset', initialStateRef.current));
    }

    return true;
  }, [onHistoryChange, cancelSaveHistory]);

  /**
   * 清空历史记录
   */
  const clear = useCallback(() => {
    cancelSaveHistory();
    
    historyRef.current = [];
    historyIndexRef.current = -1;
    initialStateRef.current = null;

    // 触发状态更新
    setHistoryUpdate(prev => prev + 1);

    // 触发历史记录变化事件
    if (onHistoryChange) {
      onHistoryChange(createHistoryEvent('clear'));
    }
  }, [onHistoryChange, cancelSaveHistory]);

  /**
   * 设置初始状态
   */
  const setInitialState = useCallback((cropBox: FabricObject | null, image: FabricObject | null) => {
    if (!cropBox || !image) return false;

    const initialRecord = createHistoryRecord(cropBox, image);
    initialStateRef.current = initialRecord;

    // 清空历史记录并添加初始状态
    historyRef.current = [initialRecord];
    historyIndexRef.current = 0;

    // 触发状态更新
    setHistoryUpdate(prev => prev + 1);

    return true;
  }, []);

  /**
   * 批量保存多个状态
   */
  const batchSave = useCallback((records: Array<{ cropBox: FabricObject; image: FabricObject }>) => {
    if (!records.length) return;

    // 清空现有历史记录
    clear();

    // 保存所有记录
    records.forEach(({ cropBox, image }) => {
      saveHistory(cropBox, image);
    });
  }, [clear, saveHistory]);

  /**
   * 应用历史记录并更新UI
   */
  const applyHistoryRecord = useCallback((record: CropHistoryRecord | null, cropBox: FabricObject | null, image: FabricObject | null, canvas: FabricCanvas | null) => {
    if (!record || !cropBox || !image || !canvas) return false;

    return restoreFromHistory(record, cropBox, image, canvas);
  }, []);

  /**
   * 从历史记录恢复状态
   */
  const restoreHistory = useCallback((index: number, cropBox: FabricObject | null, image: FabricObject | null, canvas: FabricCanvas | null) => {
    if (index < 0 || index >= historyRef.current.length || !cropBox || !image || !canvas) {
      return false;
    }

    const record = historyRef.current[index];
    if (restoreFromHistory(record, cropBox, image, canvas)) {
      historyIndexRef.current = index;
      
      // 触发状态更新
      setHistoryUpdate(prev => prev + 1);
      return true;
    }

    return false;
  }, []);

  /**
   * 自动保存功能
   */
  const autoSaveCurrentState = useCallback((cropBox: FabricObject | null, image: FabricObject | null) => {
    if (!cropBox || !image || !configRef.current.autoSave) return;
    debouncedSaveHistory(cropBox, image);
  }, [debouncedSaveHistory]);

  /**
   * 手动保存当前状态
   */
  const manuallySaveCurrentState = useCallback((cropBox: FabricObject | null, image: FabricObject | null) => {
    if (!cropBox || !image) return;
    saveHistory(cropBox, image, true);
  }, [saveHistory]);

  /**
   * 获取历史记录统计信息
   */
  const getHistoryStats = useCallback(() => {
    return {
      totalSteps: historyRef.current.length,
      currentIndex: historyIndexRef.current,
      canUndo: historyIndexRef.current > 0,
      canRedo: historyIndexRef.current < historyRef.current.length - 1,
      hasHistory: historyRef.current.length > 0
    };
  }, []);

  // 计算是否可以撤销/重做
  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;
  const hasHistory = historyRef.current.length > 0;

  // 清理函数
  useEffect(() => {
    return () => {
      cancelSaveHistory();
    };
  }, [cancelSaveHistory]);

  return {
    // 核心功能
    saveHistory: autoSaveCurrentState,
    saveHistoryManually: manuallySaveCurrentState,
    undo,
    redo,
    reset,
    clear,
    setInitialState,
    
    // 历史记录状态
    canUndo,
    canRedo,
    hasHistory,
    currentIndex: historyIndexRef.current,
    totalSteps: historyRef.current.length,
    getCurrentState,
    getHistoryStats,
    
    // 高级功能
    applyHistoryRecord,
    restoreHistory,
    batchSave,
    
    // 工具函数
    cancelAutoSave: cancelSaveHistory,
    updateConfig: (config: Partial<HistoryManagerConfig>) => {
      configRef.current = createHistoryConfig({ ...configRef.current, ...config });
    }
  };
};
