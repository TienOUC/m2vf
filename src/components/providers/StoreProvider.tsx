'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores';

// Zustand状态初始化Provider
export default function StoreProvider({ children }: { children: React.ReactNode }) {
  // 在组件挂载时检查认证状态
  useEffect(() => {
    useAuthStore.getState().checkAuthStatus();
  }, []);

  return <>{children}</>;
}