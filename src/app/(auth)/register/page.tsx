'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api/client/auth';
import { validateEmail, validatePhone, validatePassword, validateConfirmPassword, validateName } from '@/lib/utils/validation';
import { useForm } from '@/hooks/utils/useForm';
import { User, Mail, Phone, Lock } from 'lucide-react';

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
      
      // 验证姓名
      formErrors.name = validateName(values.name);
      
      // 根据注册方式验证邮箱或手机号
      if (values.registerMethod === 'email') {
        formErrors.email = validateEmail(values.email);
      } else {
        formErrors.phoneNumber = validatePhone(values.phoneNumber);
      }
      
      // 验证密码
      formErrors.password = validatePassword(values.password);
      
      // 验证确认密码
      formErrors.confirmPassword = validateConfirmPassword(values.password, values.confirmPassword);
      
      return formErrors;
    },
    onSubmit: async (values) => {
      setError('');
      setSuccess('');
      
      // 准备注册数据
      const userData = {
        email: values.registerMethod === 'email' ? values.email : '',
        phoneNumber: values.registerMethod === 'phone' ? values.phoneNumber : '',
        password: values.password,
        confirmPassword: values.confirmPassword,
        name: values.name
      };
      
      try {
        const response = await registerUser(userData);
        
        if (response.success) {
          setSuccess('账户创建成功！正在跳转到登录页...');
          // 3秒后自动跳转到登录页
          setTimeout(() => {
            router.push('/login');
          }, 1000);
        } else {
          setError(response.message || '注册失败');
        }
      } catch (err) {
        setError('注册请求失败，请检查网络');
        console.error('注册请求错误:', err);
      }
    }
  });
  
  // 创建适配器函数用于处理输入事件
  const handleInputBlur = (fieldName: keyof RegisterFormValues) => {
    return () => {
      handleBlur(fieldName);
    };
  };
  
  const handleInputChange = (fieldName: keyof RegisterFormValues) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(fieldName, e.target.value);
    };
  };
  
  // 切换注册方式
  const handleRegisterMethodChange = (method: 'email' | 'phone') => {
    handleChange('registerMethod', method);
    // 清除另一方式的错误
    if (method === 'email') {
      handleChange('phoneNumber', '');
    } else {
      handleChange('email', '');
    }
  };

  return (
    <>
          {/* 标题部分 */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              创建新账户
            </h2>
          </div>

          <form className="space-y-6" onSubmit={handleFormSubmit}>
            {/* 错误提示 */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-700 text-center">{error}</p>
              </div>
            )}

            {/* 成功提示 */}
            {success && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm text-green-700 text-center">{success}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* 注册方式切换 */}
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${values.registerMethod === 'email' ? 'bg-primary-100 border-primary-500 text-primary-700' : 'bg-white border-neutral-300 text-neutral-700'}`}
                  onClick={() => handleRegisterMethodChange('email')}
                >
                  邮箱注册
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${values.registerMethod === 'phone' ? 'bg-primary-100 border-primary-500 text-primary-700' : 'bg-white border-neutral-300 text-neutral-700'}`}
                  onClick={() => handleRegisterMethodChange('phone')}
                >
                  手机注册
                </button>
              </div>

              {/* 姓名 */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-neutral-700 mb-2"
                >
                  姓名 *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors placeholder-neutral-400"
                    placeholder="请输入您的姓名"
                    value={values.name}
                    onBlur={() => handleInputBlur('name')}
                    onChange={handleInputChange('name')}
                  />
                </div>
                {touched.name && errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* 邮箱地址 - 仅在邮箱注册模式下显示 */}
              {values.registerMethod === 'email' && (
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    邮箱地址 *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors placeholder-neutral-400"
                      placeholder="请输入邮箱地址"
                      value={values.email}
                      onBlur={() => handleInputBlur('email')}
                      onChange={handleInputChange('email')}
                    />
                  </div>
                  {touched.email && errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>
              )}

              {/* 手机号码 - 仅在手机注册模式下显示 */}
              {values.registerMethod === 'phone' && (
                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    手机号码 *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      autoComplete="tel"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors placeholder-neutral-400"
                      placeholder="请输入手机号码"
                      value={values.phoneNumber}
                      onBlur={() => handleInputBlur('phoneNumber')}
                      onChange={handleInputChange('phoneNumber')}
                    />
                  </div>
                  {touched.phoneNumber && errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              )}

              {/* 密码 */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-700 mb-2"
                >
                  密码 *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors placeholder-neutral-400"
                    placeholder="至少6位字符"
                    value={values.password}
                    onBlur={() => handleInputBlur('password')}
                    onChange={handleInputChange('password')}
                  />
                </div>
                {touched.password && errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* 确认密码 */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-neutral-700 mb-2"
                >
                  确认密码 *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors placeholder-neutral-400"
                    placeholder="请再次输入密码"
                    value={values.confirmPassword}
                    onBlur={() => handleInputBlur('confirmPassword')}
                    onChange={handleInputChange('confirmPassword')}
                  />
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* 创建账户按钮 */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
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
            <div className="text-center text-sm ">
              <span className="text-neutral-600">已有账户？</span>
              <Link
                href="/login"
                className="font-medium text-primary-600 hover:text-primary-500 ml-1 transition-colors"
              >
                返回登录
              </Link>
            </div>
          </form>
    </>
  );
}
