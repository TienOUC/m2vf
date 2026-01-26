'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api/client/auth';
import { validateEmail, validatePhone, validatePassword, validateConfirmPassword, validateName } from '@/lib/utils/validation';
import { useForm } from '@/hooks/utils/useForm';
import { UserRound } from 'lucide-react';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { FormErrorMessage } from '@/components/auth/FormErrorMessage';
import { FormSuccessMessage } from '@/components/auth/FormSuccessMessage';
import { RegisterMethodToggle } from '@/components/auth/RegisterMethodToggle';
import { EmailRegisterForm } from '@/components/auth/EmailRegisterForm';
import { PhoneRegisterForm } from '@/components/auth/PhoneRegisterForm';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { TermsCheckbox } from '@/components/auth/TermsCheckbox';
import { SubmitButton } from '@/components/auth/SubmitButton';
import { RegisterWelcomeContent } from '@/components/auth/RegisterWelcomeContent';

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
      } catch {
        setError('注册请求失败，请检查网络');
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

  const leftContent = <RegisterWelcomeContent />;

  return (
    <AuthLayout leftContent={leftContent} gradient="register">
      <AuthHeader />
      
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10 text-center">
            <RegisterWelcomeContent />
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

            {/* 姓名输入 */}
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

            {/* 邮箱/手机输入 */}
            {values.registerMethod === 'email' ? (
              <EmailRegisterForm
                email={values.email}
                error={errors.email}
                touched={touched.email}
                onEmailChange={(value) => handleChange('email', value)}
                onEmailBlur={() => handleBlur('email')}
              />
            ) : (
              <PhoneRegisterForm
                phoneNumber={values.phoneNumber}
                error={errors.phoneNumber}
                touched={touched.phoneNumber}
                onPhoneChange={(value) => handleChange('phoneNumber', value)}
                onPhoneBlur={() => handleBlur('phoneNumber')}
              />
            )}

            {/* 密码和确认密码输入 */}
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
