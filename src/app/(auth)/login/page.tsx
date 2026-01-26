'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { validateLoginCredential, validatePassword, validateEmail, validatePhone, validateCode } from '@/lib/utils/validation';
import { ROUTES } from '@/lib/config/api.config';
import { useForm } from '@/hooks/utils/useForm';
import { useAuthStore } from '@/lib/stores';
import { Mail, SquareUserRound } from 'lucide-react';
import { getLoginErrorMessage, getRequestErrorMessage } from '@/lib/utils/loginError';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { FormErrorMessage } from '@/components/auth/FormErrorMessage';
import { SubmitButton } from '@/components/auth/SubmitButton';
import { LoginMethodHeader, AccountLoginMethod } from '@/components/auth/LoginMethodHeader';
import { PasswordLoginForm } from '@/components/auth/PasswordLoginForm';
import { PhoneLoginForm } from '@/components/auth/PhoneLoginForm';
import { EmailLoginForm } from '@/components/auth/EmailLoginForm';
import { WelcomeContent } from '@/components/auth/WelcomeContent';
import { sendVerificationCode, loginWithVerificationCode, getUserProfile } from '@/lib/api/client/auth';

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
  const [loginMethod, setLoginMethod] = useState<'password' | 'phoneCode' | 'emailCode'>('password');
  const [lastAccountLoginMethod, setLastAccountLoginMethod] = useState<AccountLoginMethod>('password');
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
          updateAuthState(response);
        } else {
          response = await loginWithVerificationCode(values.phone, values.code, 'phone');
          updateAuthState(response);
        }
        
        if (response.access_token) {
          setError('');
          router.replace(redirectTo);
        } else {
          setError(getLoginErrorMessage(response.message));
        }
      } catch (err) {
        setError(getRequestErrorMessage(err));
      }
    }
  });

  function updateAuthState(response: { access_token: string; user?: unknown }) {
    if (response.access_token) {
      useAuthStore.setState({
        isAuthenticated: true,
        user: response.user,
        accessToken: response.access_token
      });
      
      setTimeout(async () => {
        try {
          const fullUserProfile = await getUserProfile();
          useAuthStore.setState({ user: fullUserProfile });
        } catch {
          console.error('获取用户信息失败，继续使用登录返回的基本信息');
        }
      }, 0);
    }
  }

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
    } catch {
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
    } catch {
      setError('发送验证码失败，请稍后重试');
    } finally {
      setSendCodeLoading(false);
    }
  };

  const leftContent = <WelcomeContent />;

  return (
    <AuthLayout leftContent={leftContent} gradient="login">
      <AuthHeader />
      
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10 text-center">
            <WelcomeContent />
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

            <LoginMethodHeader
              isEmailCode={loginMethod === 'emailCode'}
              accountMethod={loginMethod === 'emailCode' ? lastAccountLoginMethod : loginMethod as AccountLoginMethod}
              onAccountMethodChange={(method) => setLoginMethod(method)}
            />

            {loginMethod === 'password' ? (
              <PasswordLoginForm
                credential={values.credential}
                password={values.password}
                errors={{ credential: errors.credential, password: errors.password }}
                touched={{ credential: touched.credential, password: touched.password }}
                onCredentialChange={(value) => handleChange('credential', value)}
                onPasswordChange={(e) => handleChange('password', e.target.value)}
                onCredentialBlur={() => handleBlur('credential')}
                onPasswordBlur={() => handleBlur('password')}
              />
            ) : loginMethod === 'phoneCode' ? (
              <PhoneLoginForm
                phone={values.phone}
                code={values.code}
                isLoading={sendCodeLoading}
                errors={{ phone: errors.phone, code: errors.code }}
                touched={{ phone: touched.phone, code: touched.code }}
                onPhoneChange={(value) => handleChange('phone', value)}
                onCodeChange={(value) => handleChange('code', value)}
                onPhoneBlur={() => handleBlur('phone')}
                onCodeBlur={() => handleBlur('code')}
                onSendCode={handleSendPhoneCode}
              />
            ) : (
              <EmailLoginForm
                email={values.email}
                code={values.code}
                isLoading={sendCodeLoading}
                errors={{ email: errors.email, code: errors.code }}
                touched={{ email: touched.email, code: touched.code }}
                onEmailChange={(value) => handleChange('email', value)}
                onCodeChange={(value) => handleChange('code', value)}
                onEmailBlur={() => handleBlur('email')}
                onCodeBlur={() => handleBlur('code')}
                onSendCode={handleSendEmailCode}
              />
            )}

            <SubmitButton disabled={isLoading} isLoading={isLoading}>
              {/* {loginMethod === 'emailCode' ? '立即登录' : '登录'} */}
              登录
            </SubmitButton>

            {loginMethod !== 'emailCode' && (
              <>
                <div className="flex items-center justify-center my-8">
                  <div className="flex-grow border-t border-neutral-200"></div>
                  <span className="px-2 text-sm text-neutral-500">其他登录方式</span>
                  <div className="flex-grow border-t border-neutral-200"></div>
                </div>

                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[14px] font-medium transition-colors bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                  onClick={() => {
                    setLastAccountLoginMethod(loginMethod as AccountLoginMethod);
                    setLoginMethod('emailCode');
                  }}
                >
                  <Mail className="w-4 h-4 text-neutral-500" />
                  邮箱登录
                </button>
              </>
            )}

            {loginMethod === 'emailCode' && (
              <>
                <div className="flex items-center justify-center my-8">
                  <div className="flex-grow border-t border-neutral-200"></div>
                  <span className="px-4 text-sm text-neutral-500">其他登录方式</span>
                  <div className="flex-grow border-t border-neutral-200"></div>
                </div>

                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[14px] font-medium transition-colors bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setLoginMethod(lastAccountLoginMethod)}
                >
                  <SquareUserRound className="w-4 h-4 text-neutral-500" />
                  账号/手机号登录
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
