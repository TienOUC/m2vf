'use client';

import { useCallback, useRef, useEffect } from 'react';

/**
 * 防抖回调Hook
 * @param callback 需要防抖的回调函数
 * @param delay 防抖延迟时间（毫秒）
 * @returns 防抖后的回调函数和清理函数
 */
export const useDebouncedCallback = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): [T, () => void] => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef<T>(callback);

  // 更新回调引用
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // 防抖函数
  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]) as T;

  // 清理函数
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // 组件卸载时自动清理
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return [debouncedCallback, cleanup];
};

export default useDebouncedCallback;