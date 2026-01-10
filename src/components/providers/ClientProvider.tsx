'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores';

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
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-neutral-600 text-sm">初始化中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}