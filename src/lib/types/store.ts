// Zustand store 相关类型定义

// 项目类型定义
export interface Project {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// 项目分页信息
export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// 项目管理状态
export interface ProjectManagementState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  success: string | null;
  pagination: PaginationInfo;
  fetchProjects: (page?: number, pageSize?: number) => Promise<any>;
  createProject: (projectData: { name: string; description: string }) => Promise<any>;
  deleteProject: (projectName: string) => Promise<any>;
  getProjectDetail: (projectId: string | number) => Promise<any>;
  updateProject: (projectId: string | number, projectData: { name: string; description: string }) => Promise<any>;
  resetMessages: () => void;
  goToPage: (page: number) => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPrevPage: () => Promise<void>;
  setPageSize: (pageSize: number) => Promise<void>;
}

// 项目编辑状态
export interface ProjectEditingState {
  projectName: string;
  setProjectName: (name: string) => void;
  projectDescription: string;
  setProjectDescription: (description: string) => void;
  isLoading: boolean;
  error: string | null;
  fetchProjectDetail: (projectId: string | number) => Promise<void>;
  updateProjectInfo: (projectId: string | number) => Promise<void>;
  resetForm: () => void;
}

// 用户认证状态
export interface AuthState {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  user: any | null;
  setUser: (user: any) => void;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  refreshToken: string | null;
  setRefreshToken: (token: string | null) => void;
  login: (credentials: { credential: string; password: string }) => Promise<any>;
  logout: () => void;
  checkAuthStatus: () => void;
}

// 通用UI状态
export interface UIState {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (darkMode: boolean) => void;
  loadingMessage: string | null;
  setLoadingMessage: (message: string | null) => void;
  showMessage: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  hideMessage: () => void;
  message: {
    text: string;
    type: 'success' | 'error' | 'info' | 'warning';
    visible: boolean;
  };
}

// 文本节点状态
export interface TextNodeState {
  id: string;
  content?: string;
  editorStateJson?: string;
  backgroundColor?: string;
  fontType?: 'h1' | 'h2' | 'h3' | 'p';
  isEditing?: boolean;
}

// 文本节点管理状态
export interface TextNodesState {
  textNodes: Record<string, TextNodeState>;
  getTextNode: (id: string) => TextNodeState | undefined;
  setTextNode: (id: string, data: Partial<TextNodeState>) => void;
  batchUpdateTextNodes: (updates: Record<string, Partial<TextNodeState>>) => void;
  deleteTextNode: (id: string) => void;
  clearAllTextNodes: () => void;
  updateTextNodeContent: (id: string, content: string, editorStateJson?: string) => void;
  updateTextNodeBackgroundColor: (id: string, color: string) => void;
  updateTextNodeFontType: (id: string, fontType: 'h1' | 'h2' | 'h3' | 'p') => void;
  updateTextNodeEditingState: (id: string, isEditing: boolean) => void;
}

// 图片节点状态
export interface ImageNodeState {
  id: string;
  imageUrl?: string;
  isLoading?: boolean;
  isProcessing?: boolean;
  processingProgress?: number;
  error?: string;
  position?: { x: number; y: number };
  width?: number;
  height?: number;
}

// 图片节点管理状态
export interface ImageNodesState {
  imageNodes: Record<string, ImageNodeState>;
  getImageNode: (id: string) => ImageNodeState | undefined;
  setImageNode: (id: string, data: Partial<ImageNodeState>) => void;
  batchUpdateImageNodes: (updates: Record<string, Partial<ImageNodeState>>) => void;
  deleteImageNode: (id: string) => void;
  clearAllImageNodes: () => void;
  updateImageNodeUrl: (id: string, imageUrl: string) => void;
  updateImageNodeLoadingState: (id: string, isLoading: boolean) => void;
  updateImageNodeProcessingState: (id: string, isProcessing: boolean, progress?: number) => void;
  updateImageNodeError: (id: string, error?: string) => void;
}

// 组合所有状态类型
export interface RootState {
  projectManagement: ProjectManagementState;
  projectEditing: ProjectEditingState;
  auth: AuthState;
  ui: UIState;
  textNodes: TextNodesState;
  imageNodes: ImageNodesState;
}