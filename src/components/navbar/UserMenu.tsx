'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogOut, User, Mail } from 'lucide-react';
import { useUIStore } from '@/lib/stores/uiStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  isLoggedIn: boolean;
  username?: string;
}

export const UserMenu = ({ isLoggedIn = false, username = '' }: UserMenuProps) => {
  const { isDarkMode } = useUIStore((state) => ({ isDarkMode: state.isDarkMode }));
  const [isOpen, setIsOpen] = useState(false);
  
  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className={cn(
            "px-4 py-2 text-[13px] font-medium rounded-xl transition-all",
            isDarkMode
              ? "text-neutral-300 hover:text-white hover:bg-neutral-800"
              : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
          )}
        >
          登录
        </Link>
        <Link
          href="/register"
          className={cn(
            "px-4 py-2 text-[13px] font-medium rounded-xl transition-all",
            isDarkMode
              ? "bg-white text-black hover:bg-neutral-200"
              : "bg-neutral-900 text-white hover:bg-neutral-800"
          )}
        >
          注册
        </Link>
      </div>
    );
  }
  
  const { user } = useAuthStore();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all",
          isDarkMode
            ? "hover:bg-neutral-800"
            : "hover:bg-neutral-100"
        )}
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className={cn(
            "absolute right-0 top-full mt-2 min-w-[150px] max-w-[300px] rounded-xl p-1.5 z-50 shadow-xl whitespace-nowrap",
            isDarkMode
              ? "bg-neutral-800 border border-neutral-700"
              : "bg-white border border-neutral-200"
          )}>
            <div className="space-y-2">
              <div className="px-3 py-1 flex items-center gap-2">
                <User className={cn(
                  "w-4 h-4",
                  isDarkMode ? "text-neutral-800" : "text-neutral-900"
                )} />
                <span className={cn(
                  "text-[13px] flex-1",
                  isDarkMode ? "text-neutral-800" : "text-neutral-900"
                )}>
                {user?.username || username || '用户'}
                </span>
              </div>
              <div className="px-3 py-1 flex items-center gap-2">
                <Mail className={cn(
                  "w-4 h-4",
                  isDarkMode ? "text-neutral-800" : "text-neutral-900"
                )} />
                <span className={cn(
                  "text-[13px] flex-1",
                  isDarkMode ? "text-neutral-800" : "text-neutral-900"
                )}>
                {user?.email || '未设置'}
                </span>
              </div>
              <button
                className={cn(
                  "flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all w-full",
                  isDarkMode
                    ? "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    : "text-red-500 hover:text-red-600 hover:bg-red-50"
                )}
                onClick={() => setIsOpen(false)}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[13px]">退出登录</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
