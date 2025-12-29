import { create } from 'zustand';
import { Project, ProjectManagementState } from '../types/store';
import { 
  getProjects as getProjectsAPI, 
  createProject as createProjectAPI, 
  deleteProject as deleteProjectAPI,
  getProjectDetail as getProjectDetailAPI,
  updateProject as updateProjectAPI
} from '../api/projects';

// 项目管理store
export const useProjectManagementStore = create<ProjectManagementState>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,
  success: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
  
  fetchProjects: async (page = 1, pageSize = 20) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await getProjectsAPI({ page, pageSize });
      
      if (response.ok) {
        const data: any = await response.json();
        
        // 如果返回的是分页格式
        if (data.hasOwnProperty('results')) {
          set({
            projects: data.results,
            pagination: {
              page,
              pageSize,
              total: data.count,
              totalPages: Math.ceil(data.count / pageSize),
            },
            isLoading: false
          });
          return data;
        } else {
          // 如果返回的是简单数组格式
          set({
            projects: Array.isArray(data) ? data : [],
            pagination: prev => ({
              ...prev,
              total: Array.isArray(data) ? data.length : 0,
              totalPages: 1,
            }),
            isLoading: false
          });
          return data;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `获取项目列表失败: ${response.status}`);
        set({ error: error.message, isLoading: false });
        throw error;
      }
    } catch (err: any) {
      const error = err.message || '获取项目列表时发生错误';
      set({ error, isLoading: false });
      throw new Error(error);
    }
  },

  createProject: async (projectData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await createProjectAPI(projectData);
      
      if (response.ok) {
        const result = await response.json().catch(() => ({}));
        // 重新获取项目列表以包含新创建的项目
        const { page, pageSize } = get().pagination;
        await get().fetchProjects(page, pageSize);
        set({ success: '项目创建成功！' });
        return result;
      } else {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `创建项目失败: ${response.status}`);
        set({ error: error.message, isLoading: false });
        throw error;
      }
    } catch (err: any) {
      const error = err.message || '创建项目时发生错误';
      set({ error, isLoading: false });
      throw new Error(error);
    }
  },

  deleteProject: async (projectName) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await deleteProjectAPI(projectName);
      
      if (response.ok) {
        // 重新获取项目列表以移除已删除的项目
        const { page, pageSize } = get().pagination;
        await get().fetchProjects(page, pageSize);
        set({ success: '项目删除成功！' });
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `删除项目失败: ${response.status}`);
        set({ error: error.message, isLoading: false });
        throw error;
      }
    } catch (err: any) {
      const error = err.message || '删除项目时发生错误';
      set({ error, isLoading: false });
      throw new Error(error);
    }
  },

  getProjectDetail: async (projectId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await getProjectDetailAPI(projectId);
      
      if (response.ok) {
        const projectDetail = await response.json();
        set({ isLoading: false });
        return projectDetail;
      } else {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `获取项目详情失败: ${response.status}`);
        set({ error: error.message, isLoading: false });
        throw error;
      }
    } catch (err: any) {
      const error = err.message || '获取项目详情时发生错误';
      set({ error, isLoading: false });
      throw new Error(error);
    }
  },

  updateProject: async (projectId, projectData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await updateProjectAPI(projectId.toString(), projectData);
      
      if (response.ok) {
        const result = await response.json().catch(() => ({}));
        // 重新获取项目列表以包含更新的项目
        const { page, pageSize } = get().pagination;
        await get().fetchProjects(page, pageSize);
        set({ success: '项目更新成功！' });
        return result;
      } else {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `更新项目失败: ${response.status}`);
        set({ error: error.message, isLoading: false });
        throw error;
      }
    } catch (err: any) {
      const error = err.message || '更新项目时发生错误';
      set({ error, isLoading: false });
      throw new Error(error);
    }
  },

  resetMessages: () => {
    set({ error: null, success: null });
  },

  goToPage: async (page) => {
    const { pagination } = get();
    if (page >= 1 && page <= pagination.totalPages) {
      await get().fetchProjects(page, pagination.pageSize);
    }
  },

  goToNextPage: async () => {
    const { pagination } = get();
    if (pagination.page < pagination.totalPages) {
      await get().fetchProjects(pagination.page + 1, pagination.pageSize);
    }
  },

  goToPrevPage: async () => {
    const { pagination } = get();
    if (pagination.page > 1) {
      await get().fetchProjects(pagination.page - 1, pagination.pageSize);
    }
  },

  setPageSize: async (pageSize) => {
    await get().fetchProjects(1, pageSize); // 切换页面大小时回到第一页
  },
}));