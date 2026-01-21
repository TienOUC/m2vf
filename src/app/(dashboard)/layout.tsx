'use client';

import { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/lib/stores';
import { ROUTES } from '@/lib/config/api.config';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.warn('用户未认证，跳转到登录页');
      router.replace(`${ROUTES.LOGIN}?redirect=${window.location.pathname}${window.location.search}`);
    }
  }, [router, isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">认证失败，请重新登录</p>
          <button 
            onClick={() => router.replace(`${ROUTES.LOGIN}?redirect=${window.location.pathname}${window.location.search}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            前往登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {(pathname !== '/edit' && pathname !== '/3d') && <Navbar user={user} />}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
