import { create } from 'zustand';
import { ProjectManagementState } from '@/lib/types/store';
import { 
  getProjects as getProjectsAPI, 
  createProject as createProjectAPI, 
  deleteProject as deleteProjectAPI,
  getProjectDetail as getProjectDetailAPI,
  updateProject as updateProjectAPI,
  type Project, 
  type ProjectListResponse
} from '@/lib/api';

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
  
  fetchProjects: async (page = 1, pageSize = 20, setLoading = true) => {
    try {
      const data = await getProjectsAPI({ page, page_size: pageSize });
      
      set({
        projects: data.projects,
        pagination: data.pagination,
        isLoading: setLoading ? false : false
      });
      return data;
    } catch (err: any) {
      const error = err.message || '获取项目列表时发生错误';
      set({ error, isLoading: false });
      throw new Error(error);
    }
  },

  createProject: async (projectData) => {
    try {
      const data: Project = await createProjectAPI(projectData);
      
      // 重新获取项目列表以包含新创建的项目
      const { page, pageSize } = get().pagination;
      await get().fetchProjects(page, pageSize, false);
      set({ success: '项目创建成功！' });
      return data;
    } catch (err: any) {
      const error = err.message || '创建项目时发生错误';
      throw new Error(error);
    }
  },

  deleteProject: async (projectId) => {
    try {
      await deleteProjectAPI(projectId);
      
      // 重新获取项目列表以移除已删除的项目
      const { page, pageSize } = get().pagination;
      await get().fetchProjects(page, pageSize, false);
      set({ success: '项目删除成功！' });
      return true;
    } catch (err: any) {
      const error = err.message || '删除项目时发生错误';
      throw new Error(error);
    }
  },

  getProjectDetail: async (projectId) => {
    try {
      const data: Project = await getProjectDetailAPI(projectId);
      return data;
    } catch (err: any) {
      const error = err.message || '获取项目详情时发生错误';
      throw new Error(error);
    }
  },

  updateProject: async (projectId, projectData) => {
    set({ isLoading: true, error: null });
    
    try {
      const data: Project = await updateProjectAPI(projectId.toString(), projectData);
      
      // 重新获取项目列表以包含更新的项目
      const { page, pageSize } = get().pagination;
      await get().fetchProjects(page, pageSize, false);
      set({ success: '项目更新成功！', isLoading: false });
      return data;
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