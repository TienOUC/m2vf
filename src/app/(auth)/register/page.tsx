'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api/client/auth';
import { validateEmail, validatePhone, validatePassword, validateConfirmPassword, validateName } from '@/lib/utils/validation';
import { useForm } from '@/hooks/utils/useForm';
import { UserRound, Mail, Phone } from 'lucide-react';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { FormErrorMessage } from '@/components/auth/FormErrorMessage';
import { FormSuccessMessage } from '@/components/auth/FormSuccessMessage';
import { RegisterMethodToggle } from '@/components/auth/RegisterMethodToggle';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { TermsCheckbox } from '@/components/auth/TermsCheckbox';
import { SubmitButton } from '@/components/auth/SubmitButton';

interface RegisterFormValues {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  registerMethod: 'email' | 'phone';
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const {
    values,
    errors,
    touched,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit: handleFormSubmit
  } = useForm<RegisterFormValues>({
    initialValues: {
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      registerMethod: 'email'
    },
    validate: (values) => {
      const formErrors: Partial<RegisterFormValues> = {};
      
      formErrors.name = validateName(values.name);
      
      if (values.registerMethod === 'email') {
        formErrors.email = validateEmail(values.email);
      } else {
        formErrors.phoneNumber = validatePhone(values.phoneNumber);
      }
      
      formErrors.password = validatePassword(values.password);
      formErrors.confirmPassword = validateConfirmPassword(values.password, values.confirmPassword);
      
      return formErrors;
    },
    onSubmit: async (values) => {
      if (!agreedToTerms) {
        setError('请阅读并同意服务条款和隐私政策');
        return;
      }
      
      setError('');
      setSuccess('');
      
      const userData = {
        email: values.registerMethod === 'email' ? values.email : '',
        phone: values.registerMethod === 'phone' ? values.phoneNumber : '',
        password: values.password,
        confirmPassword: values.confirmPassword,
        nickname: values.name
      };
      
      try {
        const response = await registerUser(userData);
        
        if (response.success) {
          setSuccess('账户创建成功！正在跳转到登录页...');
          setTimeout(() => {
            router.push('/login');
          }, 1000);
        } else {
          setError(response.message || '注册失败');
        }
      } catch (err: unknown) {
        setError('注册请求失败，请检查网络');
        console.error('注册请求错误:', err);
      }
    }
  });
  
  const handleRegisterMethodChange = (method: 'email' | 'phone') => {
    handleChange('registerMethod', method);
    if (method === 'email') {
      handleChange('phoneNumber', '');
    } else {
      handleChange('email', '');
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
        加入 Reelay
      </h1>
      <p className="text-lg max-w-md text-gray-600">
        创建您的账户，开始使用 AI 工具创作精彩内容
      </p>
    </>
  );

  return (
    <AuthLayout leftContent={leftContent} gradient="register">
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
              加入 Reelay
            </h1>
          </div>

          <h2 className="text-2xl font-light tracking-tight mb-2 hidden lg:block text-gray-900">
            创建账户
          </h2>
          <AuthFooter isLogin={false} />

          <form onSubmit={handleFormSubmit} className="space-y-5">
            {error && <FormErrorMessage message={error} />}
            {success && <FormSuccessMessage message={success} />}

            <RegisterMethodToggle
              value={values.registerMethod}
              onChange={handleRegisterMethodChange}
            />

            <div>
              <label className="block text-[13px] font-medium mb-2 text-gray-700">
                姓名 *
              </label>
              <div className="relative">
                <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="w-full rounded-xl pl-11 pr-4 py-3.5 text-[14px] bg-white border border-neutral-200 text-gray-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-300 transition-colors"
                  placeholder="请输入您的姓名"
                  value={values.name}
                  onBlur={() => handleBlur('name')}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              {touched.name && errors.name && (
                <p className="mt-1 text-sm text-error-700">{errors.name}</p>
              )}
            </div>

            {values.registerMethod === 'email' && (
              <div>
                <label className="block text-[13px] font-medium mb-2 text-gray-700">
                  邮箱地址 *
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
            )}

            {values.registerMethod === 'phone' && (
              <div>
                <label className="block text-[13px] font-medium mb-2 text-gray-700">
                  手机号码 *
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    required
                    className="w-full rounded-xl pl-11 pr-4 py-3.5 text-[14px] bg-white border border-neutral-200 text-gray-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-300 transition-colors"
                    placeholder="请输入您的手机号码"
                    value={values.phoneNumber}
                    onBlur={() => handleBlur('phoneNumber')}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  />
                </div>
                {touched.phoneNumber && errors.phoneNumber && (
                  <p className="mt-1 text-sm text-error-700">{errors.phoneNumber}</p>
                )}
              </div>
            )}

            <PasswordInput
              id="password"
              name="password"
              value={values.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              error={errors.password}
              touched={touched.password}
            />

            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="请再次输入密码"
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
            />

            <TermsCheckbox
              checked={agreedToTerms}
              onChange={setAgreedToTerms}
            />

            <SubmitButton 
              disabled={isLoading || !agreedToTerms} 
              isLoading={isLoading}
            >
              创建账户
            </SubmitButton>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
