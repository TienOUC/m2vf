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
    details?: unknown;
  };
}

// 项目相关类型
export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: number;
  updated_at: number;
  cover_url: string;
  max_sessions: number;
  session_count: number;
  status: number;
}

export interface ProjectListResponse {
  list: Project[];
  page: number;
  page_size: number;
  total: number;
}

export interface ProjectDetailResponse {
  id: string;
  name: string;
  description: string;
  created_at: number;
  updated_at: number;
  cover_url: string;
  max_sessions: number;
  session_count: number;
  status: number;
  recent_artifacts?: any[];
}

// API 响应包装类型
export interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}
export interface ProjectCreateRequest {
  name: string;
  description: string;
}

export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
  cover_url?: string;
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

// 文档节点类型
export interface DocumentNode {
  id: number;
  name: string;
  type: 'document' | 'folder';
  children?: DocumentNode[];
  parent_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

// 文档详情类型
export interface DocumentDetail {
  id: number;
  name: string;
  type: 'document';
  content?: string;
  snapshot?: string;
  assets?: Array<{
    blobId: string;
    ext: string;
    url: string;
  }>;
  folder_id?: number | null;
  created_at: string;
  updated_at: string;
}

// 资源信息类型
export interface AssetInfo {
  blobId: string;
  ext: string;
  url: string;
  size: number;
  uploaded_at: string;
}

// Workspace 相关类型
export interface WorkspaceData {
  workspace_content: string; // base64 编码的 ZIP
  project_id: number;
  created_at: string;
  updated_at: string;
}

// Workspace 文档元数据类型
export interface WorkspaceDocument {
  id: number;
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  modified_at: string;
  children?: WorkspaceDocument[];
}

// 图层相关类型
export interface Layer {
  id: string;
  name: string;
  type: string;
  project_id: number;
  created_at: string;
  updated_at: string;
}

export interface LayerCreateRequest {
  name: string;
  type: string;
  project_id: number;
  data?: unknown;
}

export interface LayerUpdateRequest {
  name?: string;
  data?: unknown;
}

// AI 相关类型
export interface AIGenerateRequest {
  prompt: string;
  model: string;
  parameters?: Record<string, unknown>;
}

export interface AIGenerateResponse {
  id: string;
  result: unknown;
  model: string;
  created_at: string;
}
