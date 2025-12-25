// 用户认证相关 API

import type { TokenResponse, LoginCredentials } from '../types/auth';
import { saveTokens, clearTokens } from '../utils/token';
import { apiRequest } from './client';
import { buildApiUrl, API_ENDPOINTS, ROUTES } from '../config/api.config';

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

  try {
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials),
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

// 用户注册
export const registerUser = async (userData: {
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  name?: string;
}): Promise<{ success: boolean; message?: string }> => {
  const registerUrl = buildApiUrl(API_ENDPOINTS.AUTH.REGISTER);

  try {
    const response = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
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
};
