// API 入口文件，统一导出客户端 API 方法和共享类型

// 客户端 API 请求工具
export { apiRequest } from './client';

// 客户端 API 方法
export * from './client/projects';
export * from './client/ai';
export * from './client/auth';
export * from './client/artifacts';
export * from './client/assets';
export * from './client/edges';
export * from './client/sessions';
export * from './client/shares';

// 共享类型定义
export * from './shared/types';

// 注意：服务器端 API 工具不在这里导出，需要单独导入
// import { fetchServerApi } from '@/lib/api/server';
