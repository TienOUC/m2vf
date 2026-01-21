'use client';

import { useState, useRef, useEffect } from 'react';
import { logoutUser } from '@/lib/api/client/auth';
import { UserRound, LogOut } from 'lucide-react';
import { useMenuContext } from '@/contexts/MenuContext';
import { useClickOutside } from '@/hooks/ui/useClickOutside';

interface User {
  name: string;
  email: string;
}

interface UserAvatarProps {
  user: User;
  menuOffsetY?: number;
  menuPosition?: 'right' | 'bottom';
}

const USER_MENU_ID = 'user-menu';

export default function UserAvatar({ user, menuOffsetY = 0, menuPosition = 'right' }: UserAvatarProps) {
  const { activeMenuId, setActiveMenuId } = useMenuContext();
  const isMenuOpen = activeMenuId === USER_MENU_ID;
  const [computedPosition, setComputedPosition] = useState<{
    horizontal: 'left' | 'right';
    vertical: 'top' | 'bottom';
    placement: 'side' | 'bottom';
  }>({ horizontal: 'left', vertical: 'bottom', placement: menuPosition === 'bottom' ? 'bottom' : 'side' });
  const avatarRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logoutUser();
    setActiveMenuId(null);
  };

  useEffect(() => {
    setComputedPosition(prev => ({
      ...prev,
      placement: menuPosition === 'bottom' ? 'bottom' : 'side'
    }));
  }, [menuPosition]);

  useEffect(() => {
    if (isMenuOpen && avatarRef.current) {
      // 获取头像按钮的位置和尺寸
      const avatarRect = avatarRef.current.getBoundingClientRect();
      
      // 假设菜单的宽度和高度（实际使用时可以根据需要调整）
      const menuWidth = 224; // 56 * 4
      const menuHeight = 112;
      
      // 获取视窗尺寸
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (computedPosition.placement === 'side') {
        // 计算侧边菜单在不同位置的显示情况
        const leftPosition = avatarRect.right + 8;
        const rightPosition = avatarRect.left - menuWidth - 8;
        
        // 确定水平位置
        const horizontal = leftPosition + menuWidth <= viewportWidth ? 'left' : 'right';
        
        setComputedPosition(prev => ({
          ...prev,
          horizontal
        }));
      } else {
        // 底部菜单需要确定垂直位置和水平对齐方式
        const bottomPosition = avatarRect.bottom + 8;
        const topPosition = avatarRect.top - menuHeight - 8;
        
        // 确定垂直位置
        const vertical = bottomPosition + menuHeight <= viewportHeight ? 'bottom' : 'top';
        
        setComputedPosition(prev => ({
          ...prev,
          vertical
        }));
      }
    }
  }, [isMenuOpen, computedPosition.placement]);

  // 点击外部区域关闭菜单
  useClickOutside([menuRef, avatarRef], () => setActiveMenuId(null), isMenuOpen);

  return (
    <div className="relative group">
      {/* 圆形头像按钮 */}
      <button
        ref={avatarRef}
        className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full text-white font-medium hover:from-primary-600 hover:to-primary-700 transition"
        title={user.name}
        onClick={(e) => {
          // 阻止事件传播，避免useClickOutside钩子在捕获阶段误判为外部点击
          e.stopPropagation();
          setActiveMenuId(activeMenuId === USER_MENU_ID ? null : USER_MENU_ID);
        }}
      >
        <UserRound size={16} />
      </button>

      {/* 下拉菜单 */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className={`absolute w-56 bg-background rounded-lg shadow-lg border border-muted z-50 transition-all duration-200
            ${computedPosition.placement === 'side' ? 
              `${computedPosition.horizontal === 'left' ? 'left-full ml-3' : 'right-0 mr-3'} top-1/2 transform -translate-y-1/2` : 
              `${computedPosition.vertical === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'} right-0 transform -translate-x-0`
            }
            [&_div.px-4]:py-3 [&_div.py-1]:py-1
          `}
        >
          {/* 用户信息 */}
          <div className="px-4 py-3 border-b border-muted">
            <div className="flex items-center gap-2">
              <UserRound size={16} className="text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {user.name}
                </span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
          </div>

          {/* 菜单项 */}
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition flex items-center gap-2"
            >
              <LogOut size={16} />
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
