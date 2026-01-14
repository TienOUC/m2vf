// Zustand store 统一导出文件

export { useProjectManagementStore } from './projectManagementStore';
export { useProjectEditingStore } from './projectEditingStore';
export { useAuthStore } from './authStore';
export { useUIStore } from './uiStore';
export { useCropStore } from './cropStore';
export { useTextNodesStore } from './textNodesStore';

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