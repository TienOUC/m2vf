// Token 管理工具函数

import type { TokenResponse } from '../types/auth';

// 获取存储的access_token
export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// 获取存储的refresh_token
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

// 保存token到本地存储
export const saveTokens = (tokens: TokenResponse): void => {
  localStorage.setItem('access_token', tokens.access_token);
  localStorage.setItem('refresh_token', tokens.refresh_token);
  localStorage.setItem('user', JSON.stringify(tokens.user));
};

// 清除所有token和用户信息
export const clearTokens = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// 刷新token
export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const refreshUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/refresh-token/`
      : 'http://127.0.0.1:8000/api/users/refresh-token/';

    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      return data.access_token;
    } else {
      // 刷新失败，清除所有token
      clearTokens();
      return null;
    }
  } catch (error) {
    console.error('刷新token失败:', error);
    clearTokens();
    return null;
  }
};

// 检查用户是否已登录
export const isUserLoggedIn = (): boolean => {
  return getAccessToken() !== null;
};
