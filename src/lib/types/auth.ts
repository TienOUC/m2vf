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


