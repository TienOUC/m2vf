import { useState, useCallback } from 'react';
import { useProjectManagement } from './useProjectManagement';

interface UseProjectEditingProps {
  onProjectUpdate?: (updatedProject: any) => void;
}

export const useProjectEditing = ({ onProjectUpdate }: UseProjectEditingProps = {}) => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { getProjectDetail, updateProject, resetMessages } = useProjectManagement();

  // 获取项目详情
  const fetchProjectDetail = useCallback(async (projectId: string | number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const projectData = await getProjectDetail(projectId);
      setProjectName(projectData.name);
      setProjectDescription(projectData.description);
      return projectData;
    } catch (err: any) {
      setError(err.message || '获取项目详情失败');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getProjectDetail]);

  // 更新项目信息
  const updateProjectInfo = useCallback(async (projectId: string | number) => {
    if (!projectName.trim()) {
      setError('项目名称不能为空');
      throw new Error('项目名称不能为空');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedProject = await updateProject(projectId, {
        name: projectName,
        description: projectDescription
      });
      
      if (onProjectUpdate) {
        onProjectUpdate(updatedProject);
      }
      
      return updatedProject;
    } catch (err: any) {
      setError(err.message || '更新项目信息失败');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectName, projectDescription, updateProject, onProjectUpdate]);

  // 重置表单
  const resetForm = useCallback(() => {
    setProjectName('');
    setProjectDescription('');
    setError(null);
    resetMessages();
  }, [resetMessages]);

  return {
    projectName,
    setProjectName,
    projectDescription,
    setProjectDescription,
    isLoading,
    error,
    fetchProjectDetail,
    updateProjectInfo,
    resetForm,
  };
};