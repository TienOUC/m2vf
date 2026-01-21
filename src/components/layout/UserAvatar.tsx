'use client';

import { useState, useRef, useEffect } from 'react';
import { logoutUser } from '@/lib/api/client/auth';
import { UserRound, LogOut } from 'lucide-react';

interface UserAvatarProps {
  user: {
    name: string;
    email: string;
  };
  menuOffsetY?: number;
}

export default function UserAvatar({ user, menuOffsetY = 0 }: UserAvatarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    horizontal: 'left' | 'right';
    vertical: 'top' | 'bottom';
  }>({ horizontal: 'left', vertical: 'bottom' });
  const avatarRef = useRef<HTMLButtonElement>(null);

  const handleLogout = () => {
    logoutUser();
  };

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

      // 计算菜单在不同位置的显示情况
      const leftPosition = avatarRect.right + 8;
      const rightPosition = avatarRect.left - menuWidth - 8;
      const bottomPosition = avatarRect.bottom + 8;
      const topPosition = avatarRect.top - menuHeight - 8;

      // 确定水平位置
      const horizontal = leftPosition + menuWidth <= viewportWidth ? 'left' : 'right';
      
      // 确定垂直位置
      const vertical = bottomPosition + menuHeight <= viewportHeight ? 'bottom' : 'top';

      setMenuPosition({ horizontal, vertical });
    }
  }, [isMenuOpen]);

  return (
    <div className="relative group" onMouseEnter={() => setIsMenuOpen(true)} onMouseLeave={() => setIsMenuOpen(false)}>
      {/* 圆形头像按钮 */}
      <button
        ref={avatarRef}
        className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full text-white font-medium hover:from-primary-600 hover:to-primary-700 transition"
        title={user.name}
      >
        <UserRound size={16} />
      </button>

      {/* 下拉菜单 */}
      {isMenuOpen && (
        <>
          {/* 菜单内容 */}
          <div
            className={`absolute w-56 bg-background rounded-lg shadow-lg border border-neutral-200 z-50 transition-all duration-200
              ${menuPosition.horizontal === 'left' ? 'left-full ml-2' : 'right-0 mr-2'}
              ${menuPosition.vertical === 'bottom' ? 'top-full' : 'bottom-full'}
            `}
            style={menuPosition.vertical === 'bottom' ? { marginTop: `${-20 + menuOffsetY}px` } : { marginBottom: `${-20 - menuOffsetY}px` }}
          >
            {/* 用户信息 */}
            <div className="px-4 py-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <UserRound size={16} className="text-neutral-600" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {user.name}
                  </span>
                  <span className="text-xs text-foreground">{user.email}</span>
                </div>
              </div>
            </div>

            {/* 菜单项 */}
            <div className="py-1">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-neutral-50 transition flex items-center gap-2"
              >
                <LogOut size={16} />
                退出登录
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
