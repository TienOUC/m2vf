// API 通用类型定义

// API 请求选项（扩展 RequestInit 以支持超时和缓存）
export interface ApiRequestOptions extends RequestInit {
  timeout?: number; // 超时时间（毫秒），默认 15 分钟
  cache?: RequestCache;
  next?: {
    revalidate?: number;
    tags?: string[];
  };
}

// 分页信息接口
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// 标准化的成功响应接口
export interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 标准化的错误响应接口
export interface ApiErrorResponse {
  success: boolean;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// 项目相关类型
export interface Project {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectListResponse {
  projects: Project[];
  pagination: Pagination;
}

export interface ProjectCreateRequest {
  name: string;
  description: string;
}

export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
}

export interface ProjectDeleteRequest {
  name: string;
}

// 认证相关类型
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

// 图片相关类型
export interface Image {
  id: number;
  name: string;
  url: string;
  thumbnail_url: string;
  width: number;
  height: number;
  size: number;
  uploaded_at: string;
  folder_id: number;
  project_id: number;
  description?: string;
}

export interface ImageUploadRequest {
  name: string;
  file: File;
  description?: string;
  folder_id: number;
}

// 文档相关类型
export interface Document {
  id: number;
  name: string;
  type: string;
  url: string;
  size: number;
  uploaded_at: string;
  project_id: number;
  description?: string;
}

// AI 相关类型
export interface AIGenerateRequest {
  prompt: string;
  model: string;
  parameters?: Record<string, any>;
}

export interface AIGenerateResponse {
  id: string;
  result: any;
  model: string;
  created_at: string;
}
