import { create } from 'zustand';
import { ProjectEditingState } from '@/lib/types/store';
import { useProjectManagementStore } from './projectManagementStore';

// 项目编辑store
export const useProjectEditingStore = create<ProjectEditingState>((set, get) => ({
  projectName: '',
  projectDescription: '',
  isLoading: false,
  error: null,
  
  setProjectName: (name) => set({ projectName: name }),
  
  setProjectDescription: (description) => set({ projectDescription: description }),
  
  fetchProjectDetail: async (projectId) => {
    set({ isLoading: true, error: null });
    
    try {
      const projectData = await useProjectManagementStore.getState().getProjectDetail(projectId);
      set({
        projectName: projectData.name,
        projectDescription: projectData.description,
      });
    } catch (err: any) {
      const error = err.message || '获取项目详情失败';
      set({ error, isLoading: false });
      throw new Error(error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateProjectInfo: async (projectId) => {
    const { projectName, projectDescription } = get();
    
    if (!projectName.trim()) {
      const error = '项目名称不能为空';
      set({ error });
      throw new Error(error);
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const result = await useProjectManagementStore.getState().updateProject(projectId, {
        name: projectName,
        description: projectDescription
      });
      
      return result;
    } catch (err: any) {
      const error = err.message || '更新项目信息失败';
      set({ error, isLoading: false });
      throw new Error(error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  resetForm: () => {
    set({
      projectName: '',
      projectDescription: '',
      error: null,
    });
    // 同时重置项目管理store的消息
    useProjectManagementStore.getState().resetMessages();
  },
}));