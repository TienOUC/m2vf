import { create } from 'zustand';
import { AuthState } from '@/lib/types/store';
import { loginUser, logoutUser, getUserProfile } from '@/lib/api/client/auth';
import { saveTokens, clearTokens, getAccessToken } from '@/lib/utils/token';

// 用户认证store
export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true, // 添加loading状态，用于处理认证检查过程
  user: null,
  accessToken: null,
  
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  
  setUser: (user) => set({ user }),
  
  setAccessToken: (token) => {
    set({ accessToken: token });
    // 如果token为null，清除本地存储，否则保存到本地存储
    if (token === null) {
      clearTokens();
    } else {
      saveTokens({ access_token: token, token_type: 'Bearer', user: get().user, message: '', usage: '' });
    }
  },
  
  login: async (credentials) => {
    try {
      const response = await loginUser(credentials);
      
      // 先设置认证状态和用户信息，确保登录成功
      set({
        isAuthenticated: true,
        user: response.user,
        accessToken: response.access_token
      });
      
      // 保存token到本地存储
      saveTokens({
        access_token: response.access_token,
        token_type: 'Bearer',
        user: response.user,
        message: '',
        usage: ''
      });
      
      // 异步获取完整用户信息
      setTimeout(async () => {
        try {
          const fullUserProfile = await getUserProfile();
          set({ user: fullUserProfile });
        } catch (profileError) {
          console.error('获取用户信息失败，继续使用登录返回的基本信息:', profileError);
        }
      }, 0);
      
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
      accessToken: null
    });
    clearTokens();
    logoutUser(); // 这会重定向到登录页面
  },
  
  checkAuthStatus: () => {
    set({ isLoading: true }); // 开始认证检查，设置loading状态
    
    const accessToken = getAccessToken();
    const user = localStorage.getItem('user');
    
    if (accessToken) {
      // 验证 token 是否有效（检查格式和基本结构）
      const isValidToken = accessToken.length > 10; // 简单的格式检查
      
      if (isValidToken) {
        set({
          isAuthenticated: true,
          accessToken: accessToken,
          user: user ? JSON.parse(user) : null,
          isLoading: false // 认证检查完成，关闭loading状态
        });
      } else {
        // Token 格式无效，清除认证状态
        set({
          isAuthenticated: false,
          accessToken: null,
          user: null,
          isLoading: false // 认证检查完成，关闭loading状态
        });
        clearTokens();
      }
    } else {
      // 没有 token，确保认证状态为 false
      set({
        isAuthenticated: false,
        accessToken: null,
        user: null,
        isLoading: false // 认证检查完成，关闭loading状态
      });
    }
  }
}));