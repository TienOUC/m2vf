'use client';

import { useState } from 'react';
import { logoutUser } from '@/lib/api/client/auth';
import { Person, Logout } from '@mui/icons-material';

interface UserAvatarProps {
  user: {
    name: string;
    email: string;
  };
}

export default function UserAvatar({ user }: UserAvatarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <div className="relative">
      {/* 圆形头像按钮 */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full text-white font-medium hover:from-primary-600 hover:to-primary-700 transition"
      >
        <Person fontSize="small" />
      </button>

      {/* 下拉菜单 */}
      {isMenuOpen && (
        <>
          {/* 点击外部关闭菜单 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsMenuOpen(false)}
          ></div>

          {/* 菜单内容 */}
          <div className="absolute right-0 mt-2 w-56 bg-background rounded-lg shadow-lg border border-neutral-200 z-20">
            {/* 用户信息 */}
            <div className="px-4 py-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Person fontSize="small" className="text-neutral-600" />
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
                <Logout fontSize="small" />
                退出登录
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
