// 用户认证相关 API

import type { TokenResponse, LoginCredentials } from '@/lib/types/auth';
import { saveTokens, clearTokens } from '@/lib/utils/token';
import { api } from './index';
import { buildApiUrl, API_ENDPOINTS, ROUTES } from '@/lib/config/api.config';

// 发送验证码
export const sendVerificationCode = async (target: string, type: 'phone' | 'email'): Promise<{ success: boolean; message: string; expire_in?: number }> => {
  const url = buildApiUrl(API_ENDPOINTS.AUTH.SEND_CODE);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ target, type })
    });
    
    if (response.ok) {
      const data = await response.json();
      return { 
        success: true, 
        message: data.message || '验证码发送成功',
        expire_in: data.expire_in
      };
    } else {
      const data = await response.json().catch(() => ({}));
      return { 
        success: false, 
        message: data.message || '验证码发送失败'
      };
    }
  } catch (error) {
    console.error('发送验证码失败:', error);
    return { 
      success: false, 
      message: '网络请求失败，请稍后重试' 
    };
  }
};

// 密码登录
export const loginUser = async (
  credentials: LoginCredentials
): Promise<TokenResponse> => {
  const loginUrl = buildApiUrl(API_ENDPOINTS.AUTH.LOGIN);

  console.log(
    '[loginUser] 环境变量 NEXT_PUBLIC_API_BASE_URL:',
    process.env.NEXT_PUBLIC_API_BASE_URL
  );
  console.log('[loginUser] 实际请求 URL:', loginUrl);
  
  // 根据用户输入的凭证类型动态确定type字段
  // 检查是否为邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // 检查是否为手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/;
  
  let type: 'email' | 'phone' = 'email';
  if (phoneRegex.test(credentials.credential)) {
    type = 'phone';
  } else if (emailRegex.test(credentials.credential)) {
    type = 'email';
  }
  
  // 构造统一格式的loginData
  const loginData = {
    password: credentials.password,
    target: credentials.credential,
    type: type
  };

  try {
    // 登录请求使用直接fetch，因为不需要token认证
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData),
      redirect: 'manual' // 关键：禁止自动跟随重定向
    });

    if (response.ok) {
      const responseData = await response.json();
      // 处理实际返回的数据结构
      const data: TokenResponse = {
        access_token: responseData.data.token,
        token_type: 'Bearer', // 默认使用Bearer类型
        user: responseData.data.user,
        message: responseData.msg,
        usage: '' // 实际接口未返回usage，使用空字符串
      };
      // 保存token到本地存储
      saveTokens(data);
      return data;
    } else {
      const responseData = await response.json().catch(() => ({}));
      throw new Error(responseData.msg || `登录失败: ${response.status}`);
    }
  } catch (error) {
    console.error('登录请求失败:', error);
    throw error;
  }
};

// 验证码登录
export const loginWithVerificationCode = async (
  target: string, // 邮箱或手机号
  code: string, // 验证码
  type: 'phone' | 'email' // 类型
): Promise<TokenResponse> => {
  const url = buildApiUrl(API_ENDPOINTS.AUTH.LOGIN_WITH_CODE);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ target, code, type })
    });
    
    if (response.ok) {
      const responseData = await response.json();
      // 处理实际返回的数据结构
      const data: TokenResponse = {
        access_token: responseData.data.token,
        token_type: 'Bearer', // 默认使用Bearer类型
        user: responseData.data.user,
        message: responseData.msg,
        usage: '' // 实际接口未返回usage，使用空字符串
      };
      saveTokens(data);
      return data;
    } else {
      const responseData = await response.json().catch(() => ({}));
      throw new Error(responseData.msg || '登录失败');
    }
  } catch (error) {
    console.error('验证码登录失败:', error);
    throw error;
  }
};

// 用户注册
export const registerUser = async (userData: {
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  nickname?: string;
  username?: string;
}): Promise<{ success: boolean; message?: string }> => {
  const registerUrl = buildApiUrl(API_ENDPOINTS.AUTH.REGISTER);

  // 准备发送到服务器的数据，只发送需要的字段
  const requestData = {
    email: userData.email,
    phone: userData.phone,
    password: userData.password,
    nickname: userData.nickname,
    username: userData.username
  };

  try {
    const data = await api.post<{ success: boolean; message?: string }>(registerUrl, requestData);
    return { success: true, message: data.message || '注册成功' };
  } catch (error: unknown) {
    console.error('注册请求失败:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : '网络请求失败，请稍后重试' 
    };
  }
};

// 开发测试用注册（跳过验证码）
export const registerDevUser = async (userData: {
  email: string;
  phone: string;
  password: string;
  nickname?: string;
  username?: string;
}): Promise<{ success: boolean; message?: string }> => {
  const registerUrl = buildApiUrl(API_ENDPOINTS.AUTH.REGISTER_DEV);

  try {
    const data = await api.post<{ success: boolean; message?: string }>(registerUrl, userData);
    return { success: true, message: data.message || '注册成功' };
  } catch (error: unknown) {
    console.error('开发注册请求失败:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : '网络请求失败，请稍后重试' 
    };
  }
};

// 获取用户信息
export const getUserProfile = async <T>(): Promise<T> => {
  const profileUrl = buildApiUrl(API_ENDPOINTS.AUTH.PROFILE);
  return api.get<T>(profileUrl);
};

// 登出用户
export const logoutUser = async (): Promise<void> => {
  // 调用登出API
  try {
    const logoutUrl = buildApiUrl(API_ENDPOINTS.AUTH.LOGOUT);
    await api.post(logoutUrl);
  } catch (error) {
    console.error('登出API调用失败:', error);
  }
  
  // 清除本地存储的token
  clearTokens();
  
  // 重定向到登录页
  if (typeof window !== 'undefined') {
    window.location.href = ROUTES.LOGIN;
  }
};