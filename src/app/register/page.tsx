'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api/auth';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const userData = {
      email: formData.get('email') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      name: formData.get('name') as string
    };

    // 前端基础验证
    if (userData.password !== userData.confirmPassword) {
      setError('两次输入的密码不一致');
      setIsLoading(false);
      return;
    }

    try {
      const response = await registerUser(userData);

      if (response.success) {
        setSuccess('账户创建成功！正在跳转到登录页...');
        // 3秒后自动跳转到登录页
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(response.message || '注册失败');
      }
    } catch (err) {
      setError('注册请求失败，请检查网络');
      console.error('注册请求错误:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-background to-primary-50 p-4 relative overflow-hidden">
      {/* 装饰背景元素 */}
      <div className="absolute top-10 left-5 w-64 h-64 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-20 right-5 w-64 h-64 bg-warning-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-10 left-1/2 w-64 h-64 bg-error-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full relative z-10 my-8">
        {/* 玻璃拟态卡片 */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-success-600 via-primary-600 to-secondary-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-background/20 max-h-[90vh] overflow-y-auto">
            {/* 标题部分 */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                创建新账户
              </h2>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* 消息提示 */}
              {error && (
                <div className="p-4 rounded-lg bg-error-50/80 backdrop-blur-sm border border-error-200">
                  <p className="text-sm text-error-700 text-center">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 rounded-lg bg-success-50/80 backdrop-blur-sm border border-success-200">
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircleIcon className="w-5 h-5 text-success-600" />
                    <p className="text-sm text-success-700 text-center">
                      {success}
                    </p>
                  </div>
                </div>
              )}

              {/* 表单输入 */}
              <div className="space-y-4">
                {/* 姓名 */}
                <div className="group">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    姓名（可选）
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-background/50 border border-neutral-200/50 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300 placeholder-foreground"
                      placeholder="您的显示名称"
                    />
                  </div>
                </div>

                {/* 邮箱 */}
                <div className="group">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    邮箱地址 *
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-background/50 border border-neutral-200/50 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300 placeholder-foreground"
                      placeholder="example@domain.com"
                    />
                  </div>
                </div>

                {/* 手机号 */}
                <div className="group">
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    手机号 *
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground" />
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      autoComplete="tel"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-background/50 border border-neutral-200/50 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300 placeholder-foreground"
                      placeholder="13800138000"
                    />
                  </div>
                </div>

                {/* 密码 */}
                <div className="group">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    密码 *
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-3 bg-background/50 border border-neutral-200/50 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300 placeholder-foreground"
                      placeholder="至少6位字符"
                    />
                  </div>
                </div>

                {/* 确认密码 */}
                <div className="group">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    确认密码 *
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-3 bg-background/50 border border-neutral-200/50 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300 placeholder-foreground"
                      placeholder="再次输入密码"
                    />
                  </div>
                </div>
              </div>

              {/* 注册按钮 */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full group relative flex items-center justify-center bg-gradient-to-r from-success-600 to-primary-600 hover:from-success-700 hover:to-primary-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                      创建账户中...
                    </span>
                  ) : (
                    <>
                      <span>创建账户</span>
                    </>
                  )}
                </button>
              </div>

              {/* 登录链接 */}
              <div className="text-center text-sm pt-4 border-t border-neutral-200/50">
                <span className="text-foreground">已有账户？</span>
                <Link
                  href="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 ml-1  transition-colors"
                >
                  返回登录
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* 返回首页链接 */}
        {/* <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-foreground hover:text-foreground transition-colors"
          >
            返回首页
          </Link>
        </div> */}
      </div>
    </div>
  );
}
