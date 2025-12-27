import { useEffect, RefObject } from 'react';

/**
 * 点击外部区域关闭的公共hook
 * @param refs 需要监听的DOM元素引用数组
 * @param callback 点击外部区域时的回调函数
 */
export function useClickOutside(
  refs: RefObject<HTMLElement>[],
  callback: () => void
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutside = refs.every((ref) => {
        return ref.current && !ref.current.contains(event.target as Node);
      });

      if (isOutside) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refs, callback]);
}
