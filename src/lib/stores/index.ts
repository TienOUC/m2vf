// Zustand store 统一导出文件

export { useProjectManagementStore } from './projectManagementStore';
export { useProjectEditingStore } from './projectEditingStore';
export { useAuthStore } from './authStore';
export { useUIStore } from './uiStore';
export { useTextNodesStore } from './textNodesStore';
export { useImageNodesStore } from './imageNodesStore';

// 组合所有store的类型定义
export type { 
  Project, 
  ProjectManagementState, 
  ProjectEditingState, 
  AuthState, 
  UIState, 
  RootState,
  TextNodeState,
  TextNodesState
} from '@/lib/types/store';

// 直接导出图片节点store的类型，供需要的地方使用
export type { ImageNodeState, ImageNodesState } from './imageNodesStore';