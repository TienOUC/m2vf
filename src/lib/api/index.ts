// API 统一导出文件

// 核心客户端
export { apiRequest } from './client';

// 认证相关
export { loginUser, registerUser, getUserProfile, logoutUser } from './auth';

// 项目管理
export {
  getProjects,
  getProjectDetail,
  createProject,
  updateProject,
  deleteProject,
  saveProject
} from './projects';

// 图片库管理
export {
  getProjectImageTree,
  createFolder,
  updateFolder,
  deleteFolder,
  uploadProjectImage,
  getFolderImages,
  getProjectImageDetail,
  updateProjectImage,
  deleteProjectImage,
  uploadProjectVideo,
  getFolderVideos,
  updateProjectVideo,
  deleteProjectVideo
} from './images';

// 文档管理
export {
  uploadProjectDocument,
  getProjectDocument,
  updateProjectDocument,
  deleteProjectDocument,
  getDocumentTree,
  createDocument,
  updateDocument,
  deleteDocument,
  getDocumentDetail,
  getAssetFile,
  getAssetsBatch,
  createDocumentFolder,
  updateDocumentFolder,
  deleteDocumentFolder,
  renameDocumentNode,
  moveDocumentNode
} from './documents';

// 图层管理
export {
  createLayer,
  updateLayerTempImage,
  saveLayerProcessedImage
} from './layers';

// Workspace
export {
  getProjectWorkspace,
  saveProjectWorkspace,
  getWorkspaceDocuments
} from './workspace';

// AI 模型
export { getAIModels, getAIModelParams } from './ai';

// Token 工具
export {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
  refreshAccessToken,
  isUserLoggedIn
} from '../utils/token';

// 类型定义
export type {
  TokenResponse,
  LoginCredentials,
  ApiRequestOptions
} from '../types/auth';

export type {
  AIModel,
  AIModelListResponse,
  ParameterSchema,
  AIModelParamsResponse
} from '../types/ai';
