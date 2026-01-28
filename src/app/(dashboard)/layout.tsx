'use client';

import { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/lib/stores';
import { ROUTES } from '@/lib/config/api.config';
import Loading from '@/app/loading';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // 只有在认证检查完成后，才处理未认证情况
    if (!isLoading && !isAuthenticated || !user) {
      console.warn('用户未认证，跳转到登录页');
      router.replace(`${ROUTES.LOGIN}?redirect=${window.location.pathname}${window.location.search}`);
    }
  }, [router, isAuthenticated, user, isLoading]);

  // 认证检查过程中显示loading，不显示认证失败提示
  if (isLoading) {
    return <Loading />;
  }

  // 认证检查完成且未认证，直接重定向，不显示错误提示
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {(pathname !== '/edit' && pathname !== '/3d') && <Navbar />}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
