// Token 管理工具函数

import type { TokenResponse } from '@/lib/types/auth';
import { DEFAULT_CONFIG } from '@/lib/config/api.config';

const { STORAGE_KEYS } = DEFAULT_CONFIG;

// 获取存储的access_token
export const getAccessToken = (): string | null => {
  // 客户端使用localStorage
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }
  return null;
};

// 保存token到本地存储
export const saveTokens = (tokens: TokenResponse): void => {
  // 客户端使用localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(tokens.user));
    
    // 同时设置到cookies，以便服务器端访问
    // 在开发环境中不设置secure标志，因为开发环境使用HTTP
    const isDevelopment = process.env.NODE_ENV === 'development';
    const secureFlag = isDevelopment ? '' : '; secure';
    
    document.cookie = `${STORAGE_KEYS.ACCESS_TOKEN}=${tokens.access_token}; path=/; max-age=3600${secureFlag}; samesite=lax`;
  }
};

// 清除所有token和用户信息
export const clearTokens = (): void => {
  // 客户端使用localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    
    // 同时清除cookies
    document.cookie = `${STORAGE_KEYS.ACCESS_TOKEN}=; path=/; max-age=0`;
  }
};

// 检查用户是否已登录
export const isUserLoggedIn = (): boolean => {
  return getAccessToken() !== null;
};
