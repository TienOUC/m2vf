'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { validateLoginCredential, validatePassword } from '@/lib/utils/validation';
import { ROUTES } from '@/lib/config/api.config';
import { useForm } from '@/hooks/utils/useForm';
import { useAuthStore } from '@/lib/stores';
import { SquareUserRound } from 'lucide-react';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { FormErrorMessage } from '@/components/auth/FormErrorMessage';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { SubmitButton } from '@/components/auth/SubmitButton';

interface LoginFormValues {
  credential: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuthStore();
  
  const {
    values,
    errors,
    touched,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm<LoginFormValues>({
    initialValues: {
      credential: '',
      password: ''
    },
    validate: (values) => {
      const formErrors: Partial<LoginFormValues> = {};
      
      formErrors.credential = validateLoginCredential(values.credential);
      formErrors.password = validatePassword(values.password);
      
      return formErrors;
    },
    onSubmit: async (values) => {
      setError('');
      
      const credentials = {
        credential: values.credential,
        password: values.password
      };
      
      try {
        const response = await login(credentials);
        
        if (response.access_token) {
          setError('');
          router.replace(redirectTo);
        } else {
          let errorMessage = response.message || '登录失败，请检查凭证';
          
          if (response.message?.includes('email') || response.message?.includes('Email')) {
            errorMessage = '邮箱或手机号不存在或格式错误';
          } else if (response.message?.includes('password') || response.message?.includes('Password')) {
            errorMessage = '密码错误';
          } else if (response.message?.includes('invalid') || response.message?.includes('Invalid')) {
            errorMessage = '邮箱、手机号或密码错误';
          }
          
          setError(errorMessage);
        }
      } catch (err: unknown) {
        let errorMessage = '网络请求失败，请稍后重试';
        const error = err as { message?: string };
        
        if (error.message?.includes('超时')) {
          errorMessage = '请求超时，请检查网络连接';
        } else if (error.message?.includes('401') || error.message?.includes('未授权')) {
          errorMessage = '邮箱、手机号或密码错误';
        } else if (error.message?.includes('400')) {
          errorMessage = '请求参数错误，请检查输入格式';
        } else if (error.message?.includes('500')) {
          errorMessage = '服务器内部错误，请稍后重试';
        }
        
        setError(errorMessage);
      }
    }
  });

  const redirectTo = searchParams.get('redirect') || ROUTES.PROJECTS;

  useEffect(() => {
    if (isAuthenticated) {
      Promise.resolve().then(() => {
        router.replace(redirectTo);
      });
    }
  }, [router, redirectTo, isAuthenticated]);

  const leftContent = (
    <>
      <div className="mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 flex items-center justify-center shadow-lg">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-600/80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 3v2M12 19v2M5.64 5.64l1.41 1.41M16.95 16.95l1.41 1.41M3 12h2M19 12h2M5.64 18.36l1.41-1.41M16.95 7.05l1.41-1.41" />
          </svg>
        </div>
      </div>
      <h1 className="text-4xl font-light tracking-tight mb-4 text-gray-900">
        欢迎回来
      </h1>
      <p className="text-lg max-w-md text-gray-600">
        登录您的账户，继续探索 AI 创作的无限可能
      </p>
    </>
  );

  return (
    <AuthLayout leftContent={leftContent} gradient="login">
      <AuthHeader />
      
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 flex items-center justify-center shadow-lg mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-600/80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 3v2M12 19v2M5.64 5.64l1.41 1.41M16.95 16.95l1.41 1.41M3 12h2M19 12h2M5.64 18.36l1.41-1.41M16.95 7.05l1.41-1.41" />
              </svg>
            </div>
            <h1 className="text-2xl font-light text-gray-900">
              欢迎回来
            </h1>
          </div>

          <h2 className="text-2xl font-light tracking-tight mb-2 hidden lg:block text-gray-900">
            登录
          </h2>
          <AuthFooter isLogin={true} />

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <FormErrorMessage message={error} />}

            <div>
              <label className="block text-[13px] font-medium mb-2 text-gray-700">
                邮箱或手机号
              </label>
              <div className="relative">
                <SquareUserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  id="credential"
                  name="credential"
                  type="text"
                  autoComplete="username"
                  required
                  className="w-full rounded-xl pl-11 pr-4 py-3.5 text-[14px] bg-white border border-neutral-200 text-gray-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-300 transition-colors"
                  placeholder="请输入邮箱地址或手机号"
                  value={values.credential}
                  onBlur={() => handleBlur('credential')}
                  onChange={(e) => handleChange('credential', e.target.value)}
                />
              </div>
              {touched.credential && errors.credential && (
                <p className="mt-1 text-sm text-destructive">{errors.credential}</p>
              )}
            </div>

            <PasswordInput
              id="password"
              name="password"
              value={values.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              error={errors.password}
              touched={touched.password}
            />

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-[13px] text-gray-500 hover:text-gray-700 transition-colors">
                忘记密码？
              </Link>
            </div>

            <SubmitButton disabled={isLoading} isLoading={isLoading}>
              登录
            </SubmitButton>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}