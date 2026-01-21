'use client';

import { ReactNode, useRef } from 'react';
import { useClickOutside } from '@/hooks/ui/useClickOutside';
import { useMenuContext } from '@/contexts/MenuContext';

interface ClickMenuProps {
  children: ReactNode;
  menuContent: ReactNode;
  position?: 'left' | 'right' | 'top' | 'bottom';
  width?: string;
  useDefaultStyles?: boolean;
  menuId: string;
}

export default function ClickMenu({
  children,
  menuContent,
  position = 'right',
  width = 'w-48',
  useDefaultStyles = true,
  menuId
}: HoverMenuProps) {
  const { activeMenuId, setActiveMenuId } = useMenuContext();
  const isOpen = activeMenuId === menuId;
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // 点击外部区域关闭所有菜单
  useClickOutside([menuRef, buttonRef], () => setActiveMenuId(null), isOpen);

  const positionClasses = {
    left: 'right-full mr-3 top-1/2 -translate-y-1/2',
    right: 'left-full ml-3 top-1/2 -translate-y-1/2',
    top: 'bottom-full mb-3 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-3 left-1/2 -translate-x-1/2'
  };

  // 处理按钮点击，切换菜单显示状态
  const handleButtonClick = () => {
    setActiveMenuId(activeMenuId === menuId ? null : menuId);
  };

  return (
    <div className="relative group">
      {/* 按钮触发器 - 直接处理点击事件，不再依赖children的onClick */}
      <div ref={buttonRef} onClick={handleButtonClick}>
        {children}
      </div>

      {/* 菜单内容 */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute ${positionClasses[position]} ${width} z-20 transition-all duration-200 transform origin-left `}
          // 阻止菜单内部的点击事件冒泡，避免误关闭
          onClick={(e) => e.stopPropagation()}
        >
          {useDefaultStyles ? (
            <div className="bg-background rounded-lg shadow-lg border border-muted py-1">
              {menuContent}
            </div>
          ) : (
            menuContent
          )}
        </div>
      )}
    </div>
  );
}
