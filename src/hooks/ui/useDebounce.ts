import { useRef, useCallback } from 'react';

/**
 * 防抖Hook，用于延迟执行函数，避免频繁触发
 * @param callback 需要防抖的回调函数
 * @param delay 延迟时间，单位毫秒，默认300ms
 * @returns 防抖处理后的函数
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay = 300
) {
  // 使用ref保存定时器ID，确保定时器在组件重新渲染时不会丢失
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 使用useCallback确保返回的函数引用稳定
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // 清除之前的定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // 创建新的定时器，延迟执行回调
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  /**
   * 立即执行回调并清除定时器
   * @param args 回调函数参数
   */
  const flush = useCallback(
    (...args: Parameters<T>) => {
      // 清除之前的定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // 立即执行回调
      callback(...args);
    },
    [callback]
  );

  /**
   * 清除定时器，取消执行
   */
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    debouncedCallback,
    flush,
    cancel
  };
}
