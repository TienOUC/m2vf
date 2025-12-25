'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api/auth';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const credentials = {
      identifier: formData.get('identifier') as string,
      password: formData.get('password') as string
    };

    try {
      const response = await login(credentials);

      if (response.success) {
        router.push('/editor');
        router.refresh();
      } else {
        setError(response.message || '登录失败，请检查凭证');
      }
    } catch (err) {
      setError('网络请求失败，请稍后重试');
      console.error('登录请求错误:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 relative overflow-hidden">
      {/* 装饰背景元素 */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full relative z-10">
        {/* 玻璃拟态卡片 */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            {/* 标题部分 */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                欢迎回来
              </h2>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* 错误提示 */}
              {error && (
                <div className="p-4 rounded-lg bg-red-50/80 backdrop-blur-sm border border-red-200">
                  <p className="text-sm text-red-700 text-center">{error}</p>
                </div>
              )}

              {/* 表单输入 */}
              <div className="space-y-4">
                <div className="group">
                  <label
                    htmlFor="identifier"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    邮箱或手机号
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="identifier"
                      name="identifier"
                      type="text"
                      autoComplete="username"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 placeholder-gray-400"
                      placeholder="输入您的邮箱或手机号"
                    />
                  </div>
                </div>

                <div className="group">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    密码
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 placeholder-gray-400"
                      placeholder="输入您的密码"
                    />
                  </div>
                </div>
              </div>

              {/* 登录按钮 */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full group relative flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      登录中...
                    </span>
                  ) : (
                    <>
                      <span>立即登录</span>
                    </>
                  )}
                </button>
              </div>

              {/* 注册链接 */}
              <div className="text-center text-sm">
                <span className="text-gray-600">还没有账户？</span>
                <Link
                  href="/register"
                  className="font-medium text-blue-600 hover:text-blue-500 ml-1 transition-colors"
                >
                  立即注册
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* 返回首页链接 */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
