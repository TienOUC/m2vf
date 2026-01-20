import { useState, useCallback } from 'react';
import { 
  getProjects as getProjectsAPI, 
  createProject as createProjectAPI, 
  deleteProject as deleteProjectAPI,
  getProjectDetail as getProjectDetailAPI,
  updateProject as updateProjectAPI,
  type Project, 
  type ProjectListResponse
} from '@/lib/api';

interface UseProjectManagementProps {
  initialProjects?: Project[];
}

export const useProjectManagement = ({ initialProjects = [] }: UseProjectManagementProps = {}) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  // 获取项目列表
  const fetchProjects = useCallback(async (page: number = 1, pageSize: number = 20) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getProjectsAPI({ page, pageSize });
      
      if (response.ok) {
        const apiResponse = await response.json();
        
        // 检查是否为标准化的成功响应
        if (apiResponse.success === true && apiResponse.data) {
          const data: ProjectListResponse = apiResponse.data;
          
          // 如果返回的是分页格式
          if (data.hasOwnProperty('projects') && data.hasOwnProperty('pagination')) {
            setProjects(data.projects);
            setPagination({
              page,
              pageSize,
              total: data.pagination.total,
              totalPages: data.pagination.totalPages,
            });
            return data;
          } else {
            // 如果返回的是简单数组格式
            setProjects(Array.isArray(data) ? data : []);
            setPagination(prev => ({
              ...prev,
              total: Array.isArray(data) ? data.length : 0,
              totalPages: 1,
            }));
            return data;
          }
        } else {
          // 如果响应格式不符合预期
          throw new Error(apiResponse.error?.message || '获取项目列表失败：响应格式错误');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `获取项目列表失败: ${response.status}`);
      }
    } catch (err) {
      setError((err as Error).message || '获取项目列表时发生错误');
      console.error('获取项目列表错误:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 创建新项目
  const createProject = useCallback(async (projectData: { name: string; description: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await createProjectAPI(projectData);
      
      if (response.ok) {
        const apiResponse = await response.json();
        
        // 检查是否为标准化的成功响应
        if (apiResponse.success === true) {
          setSuccess('项目创建成功！');
          
          // 重新获取项目列表以包含新创建的项目，使用当前分页设置
          await fetchProjects(pagination.page, pagination.pageSize);
          
          return apiResponse.data;
        } else {
          throw new Error(apiResponse.error?.message || '创建项目失败：响应格式错误');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `创建项目失败: ${response.status}`);
      }
    } catch (err) {
      setError((err as Error).message || '创建项目时发生错误');
      console.error('创建项目错误:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProjects, pagination.page, pagination.pageSize]);

  // 删除项目
  const deleteProject = useCallback(async (projectName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await deleteProjectAPI(projectName);
      
      if (response.ok) {
        const apiResponse = await response.json();
        
        // 检查是否为标准化的成功响应
        if (apiResponse.success === true) {
          setSuccess('项目删除成功！');
          
          // 重新获取项目列表以移除已删除的项目
          await fetchProjects(pagination.page, pagination.pageSize);
          
          return true;
        } else {
          throw new Error(apiResponse.error?.message || '删除项目失败：响应格式错误');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `删除项目失败: ${response.status}`);
      }
    } catch (err) {
      setError((err as Error).message || '删除项目时发生错误');
      console.error('删除项目错误:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProjects, pagination.page, pagination.pageSize]);

  // 获取单个项目详情
  const getProjectDetail = useCallback(async (projectId: string | number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getProjectDetailAPI(projectId);
      
      if (response.ok) {
        const apiResponse = await response.json();
        
        // 检查是否为标准化的成功响应
        if (apiResponse.success === true) {
          return apiResponse.data;
        } else {
          throw new Error(apiResponse.error?.message || '获取项目详情失败：响应格式错误');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `获取项目详情失败: ${response.status}`);
      }
    } catch (err) {
      setError((err as Error).message || '获取项目详情时发生错误');
      console.error('获取项目详情错误:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 更新项目
  const updateProject = useCallback(async (projectId: string | number, projectData: { name: string; description: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await updateProjectAPI(projectId.toString(), projectData);
      
      if (response.ok) {
        const apiResponse = await response.json();
        
        // 检查是否为标准化的成功响应
        if (apiResponse.success === true) {
          setSuccess('项目更新成功！');
          
          // 重新获取项目列表以包含更新的项目，使用当前分页设置
          await fetchProjects(pagination.page, pagination.pageSize);
          
          return apiResponse.data;
        } else {
          throw new Error(apiResponse.error?.message || '更新项目失败：响应格式错误');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `更新项目失败: ${response.status}`);
      }
    } catch (err) {
      setError((err as Error).message || '更新项目时发生错误');
      console.error('更新项目错误:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProjects, pagination.page, pagination.pageSize]);
  
  // 重置错误和成功消息
  const resetMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // 分页控制函数
  const goToPage = useCallback(async (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      await fetchProjects(page, pagination.pageSize);
    }
  }, [fetchProjects, pagination.totalPages, pagination.pageSize]);

  const goToNextPage = useCallback(async () => {
    if (pagination.page < pagination.totalPages) {
      await fetchProjects(pagination.page + 1, pagination.pageSize);
    }
  }, [fetchProjects, pagination]);

  const goToPrevPage = useCallback(async () => {
    if (pagination.page > 1) {
      await fetchProjects(pagination.page - 1, pagination.pageSize);
    }
  }, [fetchProjects, pagination]);

  const setPageSize = useCallback(async (pageSize: number) => {
    await fetchProjects(1, pageSize); // 切换页面大小时回到第一页
  }, [fetchProjects]);

  return {
    projects,
    isLoading,
    error,
    success,
    pagination,
    fetchProjects,
    createProject,
    deleteProject,
    getProjectDetail,
    updateProject,
    resetMessages,
    goToPage,
    goToNextPage,
    goToPrevPage,
    setPageSize,
  };
};