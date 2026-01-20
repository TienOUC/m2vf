import { useRef } from 'react';

/**
 * 操作历史记录Hook，支持撤销和重做功能
 * @param maxSteps 最大历史记录步数，默认5步
 * @returns 历史记录相关方法和状态
 */
export function useHistory<T>(maxSteps = 5) {
  // 历史记录数组
  const historyRef = useRef<T[]>([]);
  // 当前历史记录索引
  const historyIndexRef = useRef<number>(-1);

  /**
   * 保存当前状态到历史记录
   * @param state 当前状态
   */
  const save = (state: T) => {
    const currentIndex = historyIndexRef.current;
    const history = historyRef.current;

    // 如果当前不是最新状态，移除后面的历史记录
    if (currentIndex < history.length - 1) {
      historyRef.current = history.slice(0, currentIndex + 1);
    }

    // 添加新记录
    historyRef.current.push(state);

    // 限制历史记录数量
    if (historyRef.current.length > maxSteps) {
      historyRef.current.shift();
    } else {
      historyIndexRef.current++;
    }
  };

  /**
   * 撤销操作
   * @returns 撤销后的状态，如果没有可撤销的操作则返回null
   */
  const undo = (): T | null => {
    if (historyIndexRef.current <= 0) {
      return null;
    }

    historyIndexRef.current--;
    return historyRef.current[historyIndexRef.current];
  };

  /**
   * 重做操作
   * @returns 重做后的状态，如果没有可重做的操作则返回null
   */
  const redo = (): T | null => {
    if (historyIndexRef.current >= historyRef.current.length - 1) {
      return null;
    }

    historyIndexRef.current++;
    return historyRef.current[historyIndexRef.current];
  };

  /**
   * 获取当前历史记录状态
   * @returns 当前状态，如果没有历史记录则返回null
   */
  const getCurrentState = (): T | null => {
    const index = historyIndexRef.current;
    if (index < 0 || index >= historyRef.current.length) {
      return null;
    }
    return historyRef.current[index];
  };

  /**
   * 清空历史记录
   */
  const clear = () => {
    historyRef.current = [];
    historyIndexRef.current = -1;
  };

  return {
    save,
    undo,
    redo,
    getCurrentState,
    clear,
    // 只读属性，用于外部判断是否可以撤销或重做
    canUndo: historyIndexRef.current > 0,
    canRedo: historyIndexRef.current < historyRef.current.length - 1,
    // 获取历史记录长度，用于调试或显示
    historyLength: historyRef.current.length,
    // 获取当前索引，用于调试或显示
    currentIndex: historyIndexRef.current
  };
}
