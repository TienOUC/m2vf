'use client';

import { ReactNode, useRef } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';

interface FloatingMenuProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  position?: 'left' | 'right' | 'top' | 'bottom';
  width?: string;
}

export default function FloatingMenu({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  width = 'w-48'
}: FloatingMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside([menuRef], onClose);

  if (!isOpen) return null;

  const positionClasses = {
    left: 'right-full mr-3 top-0',
    right: 'left-full ml-3 top-0',
    top: 'bottom-full mb-3 left-0',
    bottom: 'top-full mt-3 left-0'
  };

  return (
    <div
      ref={menuRef}
      className={`absolute ${positionClasses[position]} bg-white rounded-lg shadow-xl border border-gray-200 ${width} z-20`}
      // 阻止菜单内部的点击事件冒泡，避免误关闭
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-2 bg-gray-100 rounded-t-lg">
        <span className="text-xs font-medium text-gray-600">{title}</span>
      </div>
      <div className="py-1">{children}</div>
    </div>
  );
}
