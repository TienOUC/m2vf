/**
 * 事件处理相关工具函数
 */

import type { FabricObject } from '@/types/fabric-image-editor';

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * 注册裁剪框事件监听器
 */
export const registerCropBoxEvents = (
  cropBox: FabricObject,
  handlers: {
    onMove?: () => void;
    onScale?: () => void;
    onRotate?: () => void;
  }
) => {
  // 先清理旧的事件监听器
  cropBox.off('moving');
  cropBox.off('scaling');
  cropBox.off('rotating');

  // 注册新的事件监听器
  if (handlers.onMove) {
    cropBox.on('moving', handlers.onMove);
  }

  if (handlers.onScale) {
    cropBox.on('scaling', handlers.onScale);
  }

  if (handlers.onRotate) {
    cropBox.on('rotating', handlers.onRotate);
  }
};

/**
 * 移除裁剪框事件监听器
 */
export const unregisterCropBoxEvents = (cropBox: FabricObject) => {
  cropBox.off('moving');
  cropBox.off('scaling');
  cropBox.off('rotating');
};

/**
 * 键盘事件处理器
 */
export const createKeyboardHandler = (
  handlers: {
    onUndo?: () => void;
    onRedo?: () => void;
    onReset?: () => void;
    onCancel?: () => void;
  }
) => {
  return (e: KeyboardEvent) => {
    // 撤销 Ctrl/Cmd + Z
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handlers.onUndo?.();
    }
    
    // 重做 Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y
    if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
      e.preventDefault();
      handlers.onRedo?.();
    }
    
    // 重置 Esc
    if (e.key === 'Escape') {
      e.preventDefault();
      handlers.onReset?.();
    }
  };
};

/**
 * 鼠标事件处理器
 */
export const createMouseHandler = (
  handlers: {
    onMouseDown?: (e: MouseEvent) => void;
    onMouseMove?: (e: MouseEvent) => void;
    onMouseUp?: (e: MouseEvent) => void;
  }
) => {
  return {
    handleMouseDown: (e: MouseEvent) => handlers.onMouseDown?.(e),
    handleMouseMove: (e: MouseEvent) => handlers.onMouseMove?.(e),
    handleMouseUp: (e: MouseEvent) => handlers.onMouseUp?.(e)
  };
};

/**
 * 触摸事件处理器
 */
export const createTouchHandler = (
  handlers: {
    onTouchStart?: (e: TouchEvent) => void;
    onTouchMove?: (e: TouchEvent) => void;
    onTouchEnd?: (e: TouchEvent) => void;
  }
) => {
  return {
    handleTouchStart: (e: TouchEvent) => handlers.onTouchStart?.(e),
    handleTouchMove: (e: TouchEvent) => handlers.onTouchMove?.(e),
    handleTouchEnd: (e: TouchEvent) => handlers.onTouchEnd?.(e)
  };
};