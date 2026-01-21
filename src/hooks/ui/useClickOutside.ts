import { useEffect, RefObject } from 'react';

/**
 * 点击外部区域关闭的公共hook
 * @param refs 需要监听的DOM元素引用数组
 * @param callback 点击外部区域时的回调函数
 * @param isActive 是否激活监听，通常为菜单是否打开的状态
 */
export function useClickOutside(
  refs: RefObject<HTMLElement>[],
  callback: (event: MouseEvent) => void,
  isActive: boolean = true
) {
  useEffect(() => {
    // 只有在isActive为true时才添加事件监听器
    if (!isActive) return;

    const handleClickOutside = (event: MouseEvent) => {
      const isOutside = refs.every((ref) => {
        return ref.current === null || !ref.current.contains(event.target as Node);
      });

      if (isOutside) {
        callback(event);
      }
    };

    // 使用捕获阶段，确保能捕获到所有点击事件
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [refs, callback, isActive]);
}
