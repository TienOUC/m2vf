'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/config/api.config';
import {
  useProjectManagementStore
} from '@/lib/stores';
import Paginator from '@/components/ui/Paginator';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import ProjectCard from '@/components/projects/ProjectCard';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Message from '@/components/ui/Message';
import Loading from '@/app/loading';

interface Project {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const {
    projects,
    isLoading: isProjectLoading,
    pagination,
    fetchProjects,
    createProject: createProjectAPI,
    deleteProject: deleteProjectAPI,
    updateProject,
    resetMessages,
    goToPage,
    goToNextPage,
    goToPrevPage,
    setPageSize,
  } = useProjectManagementStore();

  useEffect(() => {
    const loadProjects = async () => {
      await fetchProjects(1, 20);
    };

    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsCreating(true);
    
    try {
      await createProjectAPI({
        name: newProjectName,
        description: newProjectDescription
      });
      
      setNewProjectName('');
      setNewProjectDescription('');
      setShowCreateModal(false);
      
      setToast({
        message: `项目 "${newProjectName}" 创建成功`,
        type: 'success'
      });
    } catch (error) {
      console.error('创建项目错误:', error);
      
      // 显示错误消息
      setToast({
        message: '项目创建失败',
        type: 'error'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectName: string) => {
    setDeleteConfirmProject(projectName);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmProject) {
      setIsDeleting(true);
      
      try {
        await deleteProjectAPI(deleteConfirmProject);
        
        setToast({
          message: `项目 "${deleteConfirmProject}" 删除成功`,
          type: 'success'
        });
      } catch (error) {
        console.error('删除项目错误:', error);
        
        setToast({
          message: '项目删除失败',
          type: 'error'
        });
      } finally {
        setDeleteConfirmProject(null);
        setIsDeleting(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmProject(null);
  };

  const handleEditProject = (projectId: number) => {
    router.push(`${ROUTES.EDIT}?projectId=${projectId}`);
  };

  const handleEditProjectInfo = async (projectId: number, name: string, description: string) => {
    try {
      await updateProject(projectId, { name, description });
      
      setToast({
        message: `项目 "${name}" 更新成功`,
        type: 'success'
      });
    } catch (error) {
      console.error('更新项目信息失败:', error);
      
      setToast({
        message: '更新项目信息失败',
        type: 'error'
      });
    }
  };




  
  return (
    <>
      {/* Loading组件放在根级别，确保全屏居中 */}
      {isProjectLoading && <Loading />}
      
      {/* 主内容区域容器 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 主内容区域 */}
        <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">项目管理</h1>
              <p className="text-neutral-600 mt-2">管理您的所有项目</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建项目
            </button>
          </div>

          {/* 项目列表 */}
          {!isProjectLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          )}

          {projects.length === 0 && !isProjectLoading && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">暂无项目</h3>
              <p className="text-neutral-500 mb-6">您还没有创建任何项目，点击下方按钮创建一个新项目</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                创建第一个项目
              </button>
            </div>
          )}

          {/* 分页器 */}
          <Paginator
            pagination={pagination}
            goToPage={goToPage}
            goToNextPage={goToNextPage}
            goToPrevPage={goToPrevPage}
            setPageSize={setPageSize}
          />
      </div>

      {/* 创建项目模态框 */}
      <CreateProjectModal
        isOpen={showCreateModal}
        projectName={newProjectName}
        projectDescription={newProjectDescription}
        isLoading={isCreating}
        onClose={() => setShowCreateModal(false)}
        onProjectNameChange={setNewProjectName}
        onProjectDescriptionChange={setNewProjectDescription}
        onSubmit={handleCreateProject}
        onResetMessages={resetMessages}
      />
      
      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteConfirmProject !== null}
        title="删除项目"
        message={`确定要删除项目 "${deleteConfirmProject || ''}" 吗？此操作无法撤销。`}
        confirmText="确认删除"
        cancelText="取消"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isConfirming={isDeleting}
      />
      
      
      {/* Message消息提示 */}
      {toast && (
        <Message
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}