import { create } from 'zustand';
import { AuthState } from '@/lib/types/store';
import { loginUser, registerUser, getUserProfile, logoutUser } from '@/lib/api/auth';
import { saveTokens, clearTokens, getAccessToken, getRefreshToken } from '@/lib/utils/token';

// 用户认证store
export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  
  setUser: (user) => set({ user }),
  
  setAccessToken: (token) => {
    set({ accessToken: token });
    // 如果token为null，清除本地存储，否则保存到本地存储
    if (token === null) {
      const { refreshToken } = get();
      clearTokens();
      set({ refreshToken: null });
    } else {
      const { refreshToken } = get();
      saveTokens({ access_token: token, refresh_token: refreshToken || '', token_type: 'Bearer', user: get().user, message: '', usage: '' });
    }
  },
  
  setRefreshToken: (token) => {
    set({ refreshToken: token });
    const { accessToken } = get();
    if (accessToken && token) {
      saveTokens({ access_token: accessToken, refresh_token: token, token_type: 'Bearer', user: get().user, message: '', usage: '' });
    }
  },
  
  login: async (credentials) => {
    try {
      const response = await loginUser(credentials);
      set({
        isAuthenticated: true,
        user: response.user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token
      });
      return response;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },
  
  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null
    });
    clearTokens();
    logoutUser(); // 这会重定向到登录页面
  },
  
  checkAuthStatus: () => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    const user = localStorage.getItem('user');
    
    if (accessToken) {
      // 验证 token 是否有效（检查格式和基本结构）
      const isValidToken = accessToken.length > 10; // 简单的格式检查
      
      if (isValidToken) {
        set({
          isAuthenticated: true,
          accessToken: accessToken,
          refreshToken: refreshToken || null,
          user: user ? JSON.parse(user) : null
        });
      } else {
        // Token 格式无效，清除认证状态
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          user: null
        });
        clearTokens();
      }
    } else {
      // 没有 token，确保认证状态为 false
      set({
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        user: null
      });
    }
  }
}));