// 用户认证相关 API

import type { TokenResponse, LoginCredentials } from '@/lib/types/auth';
import { saveTokens, clearTokens } from '@/lib/utils/token';
import { apiRequest } from './client';
import { buildApiUrl, API_ENDPOINTS, ROUTES } from '@/lib/config/api.config';

// 专门用于登录的 API 请求（不需要 token）
export const loginUser = async (
  credentials: LoginCredentials
): Promise<TokenResponse> => {
  const loginUrl = buildApiUrl(API_ENDPOINTS.AUTH.LOGIN);

  console.log(
    '[loginUser] 环境变量 NEXT_PUBLIC_API_BASE_URL:',
    process.env.NEXT_PUBLIC_API_BASE_URL
  );
  console.log('[loginUser] 实际请求 URL:', loginUrl);
  
  // 根据用户输入的凭证类型动态确定参数名
  // 检查是否为邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // 检查是否为手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/;
  
  let loginData: any;
  if (emailRegex.test(credentials.credential)) {
    // 如果是邮箱格式，使用email参数名
    loginData = {
      email: credentials.credential,
      password: credentials.password
    };
  } else if (phoneRegex.test(credentials.credential)) {
    // 如果是手机号格式，使用phone参数名
    loginData = {
      phone: credentials.credential,
      password: credentials.password
    };
  } else {
    // 如果都不是有效格式，仍然尝试发送（后端可能需要验证）
    loginData = {
      email: credentials.credential, // 默认使用email参数
      password: credentials.password
    };
  }

  try {
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData),
      redirect: 'manual' // 关键：禁止自动跟随重定向
    });

    if (response.ok) {
      const data: TokenResponse = await response.json();
      // 保存token到本地存储
      saveTokens(data);
      return data;
    } else {
      throw new Error(`登录失败: ${response.status}`);
    }
  } catch (error) {
    console.error('登录请求失败:', error);
    throw error;
  }
};

// 用户注册
export const registerUser = async (userData: {
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  name?: string;
}): Promise<{ success: boolean; message?: string }> => {
  const registerUrl = buildApiUrl(API_ENDPOINTS.AUTH.REGISTER);

  // 准备发送到服务器的数据，只发送需要的字段
  const requestData = {
    email: userData.email,
    phoneNumber: userData.phoneNumber,
    password: userData.password,
    name: userData.name
  };

  try {
    const response = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: data.message || '注册成功' };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || '注册失败，请重试'
      };
    }
  } catch (error) {
    console.error('注册请求失败:', error);
    return { success: false, message: '网络请求失败，请稍后重试' };
  }
}

// 获取用户信息
export const getUserProfile = async (): Promise<Response> => {
  const profileUrl = buildApiUrl(API_ENDPOINTS.AUTH.PROFILE);
  return apiRequest(profileUrl, { method: 'GET' });
};

// 登出用户
export const logoutUser = (): void => {
  clearTokens();
  window.location.href = ROUTES.LOGIN;
};