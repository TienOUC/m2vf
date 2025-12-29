// 认证相关类型定义

// Token管理接口
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: any;
  message: string;
  usage: string;
}

// 登录凭据
export interface LoginCredentials {
  credential: string; // 邮箱或手机号
  password: string;
}

// API 请求选项（扩展 RequestInit 以支持超时）
export interface ApiRequestOptions extends RequestInit {
  timeout?: number; // 超时时间（毫秒），默认 15 分钟
}
