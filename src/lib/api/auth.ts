// 类型定义保持不变
interface LoginCredentials {
  identifier: string;
  password: string;
}

interface RegisterData {
  name?: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
}

// 获取 API 基础 URL，方便环境配置
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

/**
 * 通用的 fetch 请求封装
 */
async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  // 设置默认请求头
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // 尝试从 localStorage 获取 token 并添加到请求头
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include' // 如果后端使用 HttpOnly Cookie，请确保包含此项
  };

  try {
    const response = await fetch(url, config);

    // 尝试解析 JSON 响应体
    let data: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // 如果不是 JSON，获取文本（用于错误信息）
      data = { message: await response.text() };
    }

    // 处理 HTTP 状态码
    if (!response.ok) {
      // HTTP 状态码不在 200-299 范围内
      return {
        success: false,
        message: data.message || `请求失败 (${response.status})`,
        ...data
      };
    }

    // 请求成功
    return {
      success: true,
      ...data
    };
  } catch (error) {
    // 网络错误或请求无法发送
    console.error('Fetch API 错误:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '网络请求失败'
    };
  }
}

/**
 * 登录 API
 */
export const login = async (
  credentials: LoginCredentials
): Promise<ApiResponse> => {
  const response = await fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });

  // 如果登录成功且返回了 token，存储到 localStorage
  if (response.success && response.token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.token);
    }
  }

  return response;
};

/**
 * 注册 API
 */
export const register = async (
  userData: RegisterData
): Promise<ApiResponse> => {
  return fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async (): Promise<any> => {
  const response = await fetchApi('/auth/me');

  if (response.success && response.data) {
    return response.data;
  }

  throw new Error(response.message || '获取用户信息失败');
};

/**
 * 退出登录
 */
export const logout = async (): Promise<void> => {
  await fetchApi('/auth/logout', {
    method: 'POST'
  });

  // 清除本地存储的 token
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};
