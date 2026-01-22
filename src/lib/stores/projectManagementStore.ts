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
    if (setLoading) {
      set({ isLoading: true, error: null });
    }
    
    try {
      const response = await getProjectsAPI({ page, pageSize });
      
      if (response.ok) {
        const data = await response.json();
        
        // 检查是否为 API 返回的格式（count、next、previous、results）
        if (data.hasOwnProperty('count') && data.hasOwnProperty('results')) {
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
        } 
        // 检查是否为标准化的成功响应
        else if (data.success === true && data.data) {
          const apiData: any = data.data;
          
          // 如果返回的是分页格式
          if (apiData.hasOwnProperty('projects') && apiData.hasOwnProperty('pagination')) {
            set({
              projects: apiData.projects,
              pagination: {
                page,
                pageSize,
                total: apiData.pagination.total,
                totalPages: apiData.pagination.totalPages,
              },
              isLoading: false
            });
            return apiData;
          } else {
            // 如果返回的是简单数组格式
            set(state => ({
              projects: Array.isArray(apiData) ? apiData : [],
              pagination: {
                ...state.pagination,
                total: Array.isArray(apiData) ? apiData.length : 0,
                totalPages: 1,
              },
              isLoading: false
            }));
            return apiData;
          }
        } else {
          throw new Error(data.error?.message || '获取项目列表失败：响应格式错误');
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
        const apiResponse = await response.json();
        
        // 检查是否为标准化的成功响应
        if (apiResponse.success === true) {
          // 重新获取项目列表以包含新创建的项目
          const { page, pageSize } = get().pagination;
          await get().fetchProjects(page, pageSize, false);
          set({ success: '项目创建成功！' });
          return apiResponse.data;
        } else {
          throw new Error(apiResponse.error?.message || '创建项目失败：响应格式错误');
        }
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
        const apiResponse = await response.json();
        
        // 检查是否为标准化的成功响应
        if (apiResponse.success === true) {
          // 重新获取项目列表以移除已删除的项目
          const { page, pageSize } = get().pagination;
          await get().fetchProjects(page, pageSize, false);
          set({ success: '项目删除成功！' });
          return true;
        } else {
          throw new Error(apiResponse.error?.message || '删除项目失败：响应格式错误');
        }
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
        const apiResponse = await response.json();
        
        // 检查是否为标准化的成功响应
        if (apiResponse.success === true) {
          set({ isLoading: false });
          return apiResponse.data;
        } else {
          throw new Error(apiResponse.error?.message || '获取项目详情失败：响应格式错误');
        }
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
        const apiResponse = await response.json();
        
        // 检查是否为标准化的成功响应
        if (apiResponse.success === true) {
          // 重新获取项目列表以包含更新的项目
          const { page, pageSize } = get().pagination;
          await get().fetchProjects(page, pageSize, false);
          set({ success: '项目更新成功！' });
          return apiResponse.data;
        } else {
          throw new Error(apiResponse.error?.message || '更新项目失败：响应格式错误');
        }
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