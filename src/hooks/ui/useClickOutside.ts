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
      // 检查点击事件是否来自DropdownMenu相关元素或对话框元素
      const target = event.target as HTMLElement;
      const isDropdownMenu = target.closest('[data-radix-dropdown-menu-content], [data-radix-dropdown-menu-trigger]');
      const isDialog = target.closest('.fixed.inset-0');
      
      // 如果是DropdownMenu相关元素或对话框元素，不关闭菜单
      if (isDropdownMenu || isDialog) {
        return;
      }
      
      const isOutside = refs.every((ref) => {
        return ref.current === null || !ref.current.contains(target);
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
