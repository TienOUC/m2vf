'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores';

// 客户端Provider组件，用于初始化zustand store
export default function ClientProvider({ children }: { children: React.ReactNode }) {
  // 在组件挂载时检查认证状态
  useEffect(() => {
    useAuthStore.getState().checkAuthStatus();
  }, []);

  return <>{children}</>;
}