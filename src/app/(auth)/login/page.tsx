'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { validateLoginCredential, validatePassword, validateEmail, validatePhone, validateCode } from '@/lib/utils/validation';
import { ROUTES } from '@/lib/config/api.config';
import { useForm } from '@/hooks/utils/useForm';
import { useAuthStore } from '@/lib/stores';
import { SquareUserRound, Mail, Phone } from 'lucide-react';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { FormErrorMessage } from '@/components/auth/FormErrorMessage';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { SubmitButton } from '@/components/auth/SubmitButton';
import { LoginMethodToggle } from '@/components/auth/LoginMethodToggle';
import { CountDownButton } from '@/components/auth/CountDownButton';
import { sendVerificationCode, loginWithVerificationCode } from '@/lib/api/client/auth';

interface LoginFormValues {
  credential: string;
  password: string;
  email: string;
  phone: string;
  code: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loginMethod, setLoginMethod] = useState<'password' | 'emailCode' | 'phoneCode'>('password');
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
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
      password: '',
      email: '',
      phone: '',
      code: ''
    },
    validate: (values) => {
      const formErrors: Partial<LoginFormValues> = {};
      
      if (loginMethod === 'password') {
        formErrors.credential = validateLoginCredential(values.credential);
        formErrors.password = validatePassword(values.password);
      } else if (loginMethod === 'emailCode') {
        formErrors.email = validateEmail(values.email);
        formErrors.code = validateCode(values.code);
      } else if (loginMethod === 'phoneCode') {
        formErrors.phone = validatePhone(values.phone);
        formErrors.code = validateCode(values.code);
      }
      
      return formErrors;
    },
    onSubmit: async (values) => {
      setError('');
      setSuccess('');
      
      try {
        let response;
        
        if (loginMethod === 'password') {
          const credentials = {
            credential: values.credential,
            password: values.password
          };
          response = await login(credentials);
        } else if (loginMethod === 'emailCode') {
          response = await loginWithVerificationCode(values.email, values.code, 'email');
        } else {
          response = await loginWithVerificationCode(values.phone, values.code, 'phone');
        }
        
        if (response.access_token) {
          setError('');
          router.replace(redirectTo);
        } else {
          let errorMessage = response.message || '登录失败，请检查凭证';
          
          if (response.message?.includes('email') || response.message?.includes('Email')) {
            errorMessage = '邮箱不存在或格式错误';
          } else if (response.message?.includes('phone') || response.message?.includes('Phone')) {
            errorMessage = '手机号不存在或格式错误';
          } else if (response.message?.includes('password') || response.message?.includes('Password')) {
            errorMessage = '密码错误';
          } else if (response.message?.includes('code') || response.message?.includes('Code')) {
            errorMessage = '验证码错误或已过期';
          } else if (response.message?.includes('invalid') || response.message?.includes('Invalid')) {
            errorMessage = '登录信息错误';
          }
          
          setError(errorMessage);
        }
      } catch (err: unknown) {
        let errorMessage = '网络请求失败，请稍后重试';
        const error = err as { message?: string };
        
        if (error.message?.includes('超时')) {
          errorMessage = '请求超时，请检查网络连接';
        } else if (error.message?.includes('401') || error.message?.includes('未授权')) {
          errorMessage = '登录信息错误';
        } else if (error.message?.includes('400')) {
          errorMessage = '请求参数错误，请检查输入格式';
        } else if (error.message?.includes('500')) {
          errorMessage = '服务器内部错误，请稍后重试';
        } else if (error.message?.includes('code') || error.message?.includes('Code')) {
          errorMessage = '验证码错误或已过期';
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

  const handleSendEmailCode = async () => {
    if (!values.email || validateEmail(values.email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    
    setSendCodeLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await sendVerificationCode(values.email, 'email');
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('发送验证码失败，请稍后重试');
    } finally {
      setSendCodeLoading(false);
    }
  };

  const handleSendPhoneCode = async () => {
    if (!values.phone || validatePhone(values.phone)) {
      setError('请输入有效的手机号');
      return;
    }
    
    setSendCodeLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await sendVerificationCode(values.phone, 'phone');
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('发送验证码失败，请稍后重试');
    } finally {
      setSendCodeLoading(false);
    }
  };

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

          <h2 className="text-2xl font-light tracking-tight mb-6 hidden lg:block text-gray-900">
            登录
          </h2>
          <AuthFooter isLogin={true} />

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <FormErrorMessage message={error} />}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                {success}
              </div>
            )}

            <LoginMethodToggle
              value={loginMethod}
              onChange={setLoginMethod}
            />

            {loginMethod === 'password' ? (
              // 密码登录表单
              <>
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
                    <p className="mt-1 text-sm text-error-700">{errors.credential}</p>
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
              </>
            ) : loginMethod === 'emailCode' ? (
              // 邮箱验证码登录表单
              <>
                <div>
                  <label className="block text-[13px] font-medium mb-2 text-gray-700">
                    邮箱
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="w-full rounded-xl pl-11 pr-4 py-3.5 text-[14px] bg-white border border-neutral-200 text-gray-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-300 transition-colors"
                      placeholder="请输入您的邮箱地址"
                      value={values.email}
                      onBlur={() => handleBlur('email')}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </div>
                  {touched.email && errors.email && (
                    <p className="mt-1 text-sm text-error-700">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-medium mb-2 text-gray-700">
                    验证码
                  </label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        id="code"
                        name="code"
                        type="text"
                        inputMode="numeric"
                        pattern="\d{6}"
                        maxLength={6}
                        required
                        className="w-full rounded-xl pl-4 pr-4 py-3.5 text-[14px] bg-white border border-neutral-200 text-gray-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-300 transition-colors"
                        placeholder="请输入6位验证码"
                        value={values.code}
                        onBlur={() => handleBlur('code')}
                        onChange={(e) => handleChange('code', e.target.value)}
                      />
                      {touched.code && errors.code && (
                        <p className="mt-1 text-sm text-error-700">{errors.code}</p>
                      )}
                    </div>
                    
                    <div>
                      <CountDownButton
                        key={`emailCode-${loginMethod}`}
                        isLoading={sendCodeLoading}
                        disabled={!values.email || !!validateEmail(values.email)}
                        onClick={handleSendEmailCode}
                        initialText="获取验证码"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // 手机验证码登录表单
              <>
                <div>
                  <label className="block text-[13px] font-medium mb-2 text-gray-700">
                    手机号
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      pattern="\d{11}"
                      maxLength={11}
                      required
                      className="w-full rounded-xl pl-11 pr-4 py-3.5 text-[14px] bg-white border border-neutral-200 text-gray-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-300 transition-colors"
                      placeholder="请输入您的手机号"
                      value={values.phone}
                      onBlur={() => handleBlur('phone')}
                      onChange={(e) => handleChange('phone', e.target.value)}
                    />
                  </div>
                  {touched.phone && errors.phone && (
                    <p className="mt-1 text-sm text-error-700">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-medium mb-2 text-gray-700">
                    验证码
                  </label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        id="code"
                        name="code"
                        type="text"
                        inputMode="numeric"
                        pattern="\d{6}"
                        maxLength={6}
                        required
                        className="w-full rounded-xl pl-4 pr-4 py-3.5 text-[14px] bg-white border border-neutral-200 text-gray-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-300 transition-colors"
                        placeholder="请输入6位验证码"
                        value={values.code}
                        onBlur={() => handleBlur('code')}
                        onChange={(e) => handleChange('code', e.target.value)}
                      />
                      {touched.code && errors.code && (
                        <p className="mt-1 text-sm text-destructive">{errors.code}</p>
                      )}
                    </div>
                    
                    <div>
                      <CountDownButton
                        key={`phoneCode-${loginMethod}`}
                        isLoading={sendCodeLoading}
                        disabled={!values.phone || !!validatePhone(values.phone)}
                        onClick={handleSendPhoneCode}
                        initialText="获取验证码"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <SubmitButton disabled={isLoading} isLoading={isLoading}>
              登录
            </SubmitButton>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}