'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUser } from '@/lib/api/auth';
import { getAccessToken, clearTokens } from '@/lib/utils/token';
import { ROUTES } from '@/lib/config/api.config';
import {
  EnvelopeIcon,
  LockClosedIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface FormErrors {
  email?: string;
  password?: string;
}

interface FormTouched {
  email: boolean;
  password: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({
    email: false,
    password: false
  });

  // 获取跳转目标，默认为项目管理页面
  const redirectTo = searchParams.get('redirect') || ROUTES.PROJECTS;

  // 组件加载时检查是否已登录
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = getAccessToken();
      if (token) {
        // 如果有token，跳转到目标页面
        router.replace(redirectTo);
      }
    };

    checkLoginStatus();
  }, [router, redirectTo]);

  // 验证邮箱格式
  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) {
      return '请输入邮箱地址';
    }

    // 邮箱验证正则
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      return '请输入有效的邮箱地址';
    }

    return undefined;
  };

  // 验证密码格式
  const validatePassword = (value: string): string | undefined => {
    if (!value.trim()) {
      return '请输入密码';
    }

    if (value.length < 6) {
      return '密码长度不能少于6位';
    }

    if (value.length > 20) {
      return '密码长度不能超过20位';
    }

    return undefined;
  };

  // 实时验证单个字段
  const validateField = (name: keyof FormTouched, value: string) => {
    let error: string | undefined;

    switch (name) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: error
    }));
  };

  // 验证整个表单
  const validateForm = (formData: FormData): boolean => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    const errors: FormErrors = {};
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;

    setFormErrors(errors);
    setTouched({
      email: true,
      password: true
    });

    return Object.keys(errors).length === 0;
  };

  // 处理输入框失焦事件
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));
    validateField(name as keyof FormTouched, value);
  };

  // 处理输入框变化事件
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // 如果字段已经被触摸过，实时验证
    if (touched[name as keyof FormTouched]) {
      validateField(name as keyof FormTouched, value);
    }

    // 清除通用错误信息
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    // 先进行客户端验证
    if (!validateForm(formData)) {
      setIsLoading(false);
      return;
    }

    const credentials = {
      email: formData.get('email') as string,
      password: formData.get('password') as string
    };

    try {
      console.log('正在发送登录请求...', credentials);
      const response = await loginUser(credentials);

      console.log('登录响应:', response);

      if (response.access_token) {
        // 登录成功，跳转到目标页面
        setError('');

        // 使用 replace 而不是 push，避免用户点击后退时回到登录页
        router.replace(redirectTo);
      } else {
        // 根据后端返回的错误信息提供更具体的错误提示
        let errorMessage = response.message || '登录失败，请检查凭证';

        if (
          response.message?.includes('email') ||
          response.message?.includes('Email')
        ) {
          errorMessage = '邮箱地址不存在或格式错误';
        } else if (
          response.message?.includes('password') ||
          response.message?.includes('Password')
        ) {
          errorMessage = '密码错误';
        } else if (
          response.message?.includes('invalid') ||
          response.message?.includes('Invalid')
        ) {
          errorMessage = '邮箱或密码错误';
        }

        setError(errorMessage);

        // 登录失败时清除本地存储
        clearTokens();
      }
    } catch (err: any) {
      console.error('登录请求错误:', err);

      let errorMessage = '网络请求失败，请稍后重试';

      if (err.message?.includes('超时')) {
        errorMessage = '请求超时，请检查网络连接';
      } else if (
        err.message?.includes('401') ||
        err.message?.includes('未授权')
      ) {
        errorMessage = '邮箱或密码错误';
      } else if (err.message?.includes('400')) {
        errorMessage = '请求参数错误，请检查输入格式';
      } else if (err.message?.includes('500')) {
        errorMessage = '服务器内部错误，请稍后重试';
      }

      setError(errorMessage);

      // 登录失败时清除本地存储
      clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  // 检查表单是否有效
  const isFormValid = () => {
    return Object.values(formErrors).every((error) => !error);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* 卡片 */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-neutral-200">
          {/* 标题部分 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              欢迎回来
            </h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 错误提示 */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-700 text-center">
                  {error.includes('网络') ||
                  error.includes('超时') ||
                  error.includes('服务器') ? (
                    <>
                      <span className="font-medium">系统提示：</span>
                      {error}
                      <br />
                      <span className="text-xs text-red-600 mt-1 block">
                        请检查网络连接或联系管理员
                      </span>
                    </>
                  ) : (
                    error
                  )}
                </p>
              </div>
            )}

            {/* 表单输入 */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-700 mb-2"
                >
                  邮箱地址
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors placeholder-neutral-400"
                    placeholder="请输入邮箱地址"
                    onBlur={handleBlur}
                    onChange={handleInputChange}
                  />
                </div>
                {touched.email && formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-700 mb-2"
                >
                  密码
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors placeholder-neutral-400"
                    placeholder="请输入密码"
                    onBlur={handleBlur}
                    onChange={handleInputChange}
                  />
                </div>
                {touched.password && formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.password}
                  </p>
                )}
              </div>
            </div>

            {/* 登录按钮 */}
            <div>
              <button
                type="submit"
                disabled={isLoading || !isFormValid()}
                className="w-full flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              <span className="text-neutral-600">还没有账户？</span>
              <Link
                href="/register"
                className="font-medium text-primary-600 hover:text-primary-500 ml-1 transition-colors"
              >
                立即注册
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
