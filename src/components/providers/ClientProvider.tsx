'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores';
import { TooltipProvider } from '@/components/ui/tooltip'
import { MenuProvider } from '@/contexts/MenuContext'
// 客户端Provider组件，用于初始化zustand store
export default function ClientProvider({ children }: { children: React.ReactNode }) {
  const [authInitialized, setAuthInitialized] = useState(false);
  
  // 在组件挂载时检查认证状态
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await useAuthStore.getState().checkAuthStatus();
      } catch (error) {
        console.error('认证状态初始化失败:', error);
      } finally {
        setAuthInitialized(true);
      }
    };
    
    initializeAuth();
  }, []);

  // 认证初始化非常快，不需要显示loading
  // 直接渲染子组件，避免与Next.js内置loading冲突
  return (
    <MenuProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </MenuProvider>
  );
}