// 认证相关类型定义

// Token管理接口
export interface TokenResponse {
  access_token: string;
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

// 邮箱验证码登录凭据
export interface EmailCodeLoginCredentials {
  email: string;
  code: string;
}

// 手机验证码登录凭据
export interface PhoneCodeLoginCredentials {
  phone: string;
  code: string;
}

// 验证码发送请求
export interface SendCodeRequest {
  email?: string;
  phone?: string;
}

// 验证码发送响应
export interface SendCodeResponse {
  success: boolean;
  message: string;
}


