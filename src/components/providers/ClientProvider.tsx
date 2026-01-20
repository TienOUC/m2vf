'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores';
import Loading from '@/app/loading'
import { TooltipProvider } from '@/components/ui/tooltip'
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

  // 在认证状态初始化完成前显示加载状态
  if (!authInitialized) {
    return (
      <Loading />
    );
  }

  return <TooltipProvider>{children}</TooltipProvider>;
}