// app/editor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile } from '@/lib/api/auth'; // 获取用户信息的API

export default function EditorPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 组件加载时检查用户是否已认证
    const checkAuth = async () => {
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
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    // 调用后端退出API
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

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
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg"></div>
          <h1 className="text-xl font-bold text-gray-900">AI工作流编辑器</h1>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.name || '用户'}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            退出登录
          </button>
        </div>
      </header>

      {/* 主编辑器区域 - 后续将放置ReactFlow画布 */}
      <main className="flex-1 bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              欢迎使用编辑器
            </h2>
            <p className="text-gray-600 mb-6">
              这里是AI视频生成工作流的主编辑区。后续将在这里集成ReactFlow画布。
            </p>
            <div className="h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">ReactFlow画布将加载在这里</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
