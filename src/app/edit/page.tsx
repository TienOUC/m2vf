// app/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile } from '@/lib/api/auth';
import { isUserLoggedIn } from '@/lib/utils/token';
import { ROUTES } from '@/lib/config/api.config';
import Navbar from '@/components/layout/Navbar';

export default function EditPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 组件加载时检查用户是否已认证
    const checkAuth = async () => {
      // 先检查本地是否有 token
      if (!isUserLoggedIn()) {
        console.warn('未找到 token，跳转到登录页');
        router.replace(`${ROUTES.LOGIN}?redirect=${ROUTES.EDIT}`);
        return;
      }

      try {
        const response = await getUserProfile();
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          throw new Error('未认证');
        }
      } catch (error) {
        // 如果后端返回未认证，跳转到登录页
        console.warn('用户未认证，跳转到登录页');
        router.replace(`${ROUTES.LOGIN}?redirect=${ROUTES.EDIT}`);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* 顶部导航栏 */}
      <Navbar user={user} />

      {/* 主编辑器区域 - ReactFlow画布 */}
      <main className="flex-1 bg-gray-50">
        <div className="w-full h-full">
          <div className="w-full h-full border-2 border-dashed border-gray-300 flex items-center justify-center">
            <p className="text-gray-400">ReactFlow画布将加载在这里</p>
          </div>
        </div>
      </main>
    </div>
  );
}
