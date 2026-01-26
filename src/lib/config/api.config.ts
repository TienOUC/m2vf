// API 配置文件

/**
 * 获取 API 基础 URL
 * 优先使用环境变量，如果没有则使用默认值
 */
export const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://47.92.68.167:59911';
};

/**
 * API 端点配置
 */
export const API_ENDPOINTS = {
  // 用户认证相关
  AUTH: {
    LOGIN: '/v1/auth/login',
    LOGIN_WITH_CODE: '/v1/auth/login-code',
    PROFILE: '/v1/auth/profile',
    REGISTER: '/v1/auth/register',
    REGISTER_DEV: '/v1/auth/register-dev',
    SEND_CODE: '/v1/auth/send-code',
    LOGOUT: '/v1/auth/logout',
  },
  
  // 项目管理相关
  PROJECTS: {
    LIST: '/v1/projects',
    CREATE: '/v1/projects',
    DETAIL: (id: string | number) => `/v1/projects/${id}`,
    UPDATE: (id: string | number) => `/v1/projects/${id}`,
    DELETE: (id: string | number) => `/v1/projects/${id}`,
  },
  
  // 制品管理相关
  ARTIFACTS: {
    LIST: '/v1/artifacts',
    CREATE: '/v1/artifacts',
    BATCH_UPDATE: '/v1/artifacts/batch',
    BATCH_DELETE: '/v1/artifacts/batch',
    GENERATE_VIDEO_FROM_FRAMES: '/v1/artifacts/generate-video-from-frames',
    GENERATE_VIDEO_GENERAL: '/v1/artifacts/generate-video-general',
    DETAIL: (id: string | number) => `/v1/artifacts/${id}`,
    UPDATE: (id: string | number) => `/v1/artifacts/${id}`,
  },
  
  // 资产管理相关
  ASSETS: {
    LIST: '/v1/assets',
    UPLOAD: '/v1/assets/upload',
    BATCH_STATUS: '/v1/assets/status/batch',
    DETAIL: (id: string | number) => `/v1/assets/${id}`,
    STATUS: (id: string | number) => `/v1/assets/${id}/status`,
  },
  
  // 连线管理相关
  EDGES: {
    LIST: '/v1/edges',
    BATCH_CREATE: '/v1/edges/batch',
    SYNC: '/v1/edges/sync',
    DETAIL: (id: string | number) => `/v1/edges/${id}`,
  },
  
  // 会话管理相关
  SESSIONS: {
    LIST: '/v1/sessions',
    DETAIL: (id: string | number) => `/v1/sessions/${id}`,
    MESSAGES: (id: string | number) => `/v1/sessions/${id}/messages`,
  },
  
  // 分享管理相关
  SHARES: {
    LIST: '/v1/shares',
    DETAIL: (id: string | number) => `/v1/shares/${id}`,
  },
  
  // AI 模型相关
  AI: {
    MODELS: '/v1/ai/models',
    MODEL_PARAMS: (modelId: string) => `/v1/ai/models/${modelId}/params`,
  },
} as const;

/**
 * 路由配置
 */
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  PROJECTS: '/projects',
  EDIT: '/edit',
  EDITOR: '/editor',
  HOME: '/',
} as const;

/**
 * 构建完整的 API URL
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
};

/**
 * 默认配置
 */
export const DEFAULT_CONFIG = {
  // 请求超时时间（毫秒）
  REQUEST_TIMEOUT: 900000, // 15 分钟
  
  // 分页配置
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 20,
  },
  
  // Token 存储 keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    USER: 'user',
  },
} as const;
