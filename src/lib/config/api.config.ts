// API 配置文件

/**
 * 获取 API 基础 URL
 * 优先使用环境变量，如果没有则使用默认值
 */
export const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
};

/**
 * API 端点配置
 */
export const API_ENDPOINTS = {
  // 用户认证相关
  AUTH: {
    LOGIN: '/api/users/login/',
    REGISTER: '/api/users/register/',
    PROFILE: '/api/users/profile/',
    REFRESH_TOKEN: '/api/users/refresh-token/',
    LOGOUT: '/api/users/logout/',
  },
  
  // 项目管理相关
  PROJECTS: {
    LIST: '/api/projects/list/',
    CREATE: '/api/projects/create/',
    DELETE: '/api/projects/delete/',
    DETAIL: (id: string | number) => `/api/projects/${id}/`,
    SAVE: '/api/save-project/',
  },
  
  // 图片库管理相关
  IMAGES: {
    TREE: (projectId: number) => `/api/images/api/projects/${projectId}/folders/tree/`,
    FOLDERS: (projectId: number) => `/api/images/api/projects/${projectId}/folders/`,
    FOLDER_DETAIL: (projectId: number, folderId: number) => 
      `/api/images/api/projects/${projectId}/folders/${folderId}/`,
    UPLOAD_IMAGE: (projectId: number, folderId: number) => 
      `/api/images/api/projects/${projectId}/folders/${folderId}/images/upload/`,
    FOLDER_IMAGES: (projectId: number, folderId: number) => 
      `/api/images/api/projects/${projectId}/folders/${folderId}/images/`,
    IMAGE_DETAIL: (projectId: number, folderId: number, imageId: number) => 
      `/api/images/api/projects/${projectId}/folders/${folderId}/images/${imageId}/detail/`,
    IMAGE: (projectId: number, folderId: number, imageId: number) => 
      `/api/images/api/projects/${projectId}/folders/${folderId}/images/${imageId}/`,
    UPLOAD_VIDEO: (projectId: number, folderId: number | null) => 
      folderId 
        ? `/api/images/api/projects/${projectId}/folders/${folderId}/videos/upload/`
        : `/api/images/api/projects/${projectId}/videos/upload/`,
    FOLDER_VIDEOS: (projectId: number, folderId: number) => 
      `/api/images/api/projects/${projectId}/folders/${folderId}/videos/`,
    VIDEO: (projectId: number, folderId: number, videoId: number) => 
      `/api/images/api/projects/${projectId}/folders/${folderId}/videos/${videoId}/`,
  },
  
  // 文档管理相关
  DOCUMENTS: {
    TREE: (projectId: number) => `/api/projects/${projectId}/documents/tree`,
    LIST: (projectId: number) => `/api/projects/${projectId}/documents`,
    CREATE: (projectId: number) => `/api/projects/${projectId}/documents`,
    DETAIL: (projectId: number, documentId: number) => 
      `/api/projects/${projectId}/documents/${documentId}`,
    FOLDERS: (projectId: number) => `/api/projects/${projectId}/documents/folders`,
    FOLDER_DETAIL: (projectId: number, folderId: number) => 
      `/api/projects/${projectId}/documents/folders/${folderId}`,
    RENAME_NODE: (projectId: number, nodeId: number) => 
      `/api/projects/${projectId}/documents/nodes/${nodeId}/rename`,
    MOVE_NODE: (projectId: number, nodeId: number) => 
      `/api/projects/${projectId}/documents/nodes/${nodeId}/move`,
    UPLOAD_DOCUMENT: (projectId: number, folderId: number | null) => 
      folderId
        ? `/api/images/api/projects/${projectId}/folders/${folderId}/documents/upload/`
        : `/api/images/api/projects/${projectId}/documents/upload/`,
    PROJECT_DOCUMENT: (projectId: number, folderId: number, documentId: number) => 
      `/api/images/api/projects/${projectId}/folders/${folderId}/documents/${documentId}/`,
    ASSETS: (projectId: number, blobId: string, ext: string) => 
      `/api/projects/${projectId}/assets/${blobId}.${ext}`,
    ASSETS_BATCH: (projectId: number) => `/api/projects/${projectId}/assets/batch`,
  },
  
  // 图层管理相关
  LAYERS: {
    CREATE: '/api/layers/',
    UPDATE_TEMP_IMAGE: (layerId: string) => `/api/layers/${layerId}/update-temp-image/`,
    SAVE_PROCESSED_IMAGE: (layerId: string) => `/api/layers/${layerId}/save-processed-image/`,
  },
  
  // Workspace 相关
  WORKSPACE: {
    GET: (projectId: number) => `/api/projects/${projectId}/workspace`,
    SAVE: (projectId: number) => `/api/projects/${projectId}/workspace`,
    DOCUMENTS: (projectId: number) => `/api/projects/${projectId}/workspace/documents`,
  },
  
  // AI 模型相关
  AI: {
    MODELS: '/api/ai/models/',
    MODEL_PARAMS: (modelId: string) => `/api/ai/models/${modelId}/params/`,
  },
} as const;

/**
 * 路由配置
 */
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
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
    DEFAULT_PAGE_SIZE: 10,
  },
  
  // Token 存储 keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'user',
  },
} as const;
