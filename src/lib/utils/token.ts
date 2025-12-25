// Token 管理工具函数

import type { TokenResponse } from '../types/auth';
import { buildApiUrl, API_ENDPOINTS, DEFAULT_CONFIG } from '../config/api.config';

const { STORAGE_KEYS } = DEFAULT_CONFIG;

// 获取存储的access_token
export const getAccessToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

// 获取存储的refresh_token
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
};

// 保存token到本地存储
export const saveTokens = (tokens: TokenResponse): void => {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(tokens.user));
};

// 清除所有token和用户信息
export const clearTokens = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// 刷新token
export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const refreshUrl = buildApiUrl(API_ENDPOINTS.AUTH.REFRESH_TOKEN);

    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
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
