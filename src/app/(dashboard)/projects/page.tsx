'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-10">
        {/* 页面头部 */}
        <header className="mb-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">项目管理</h1>
              <p className="text-muted-foreground mt-2">管理您的所有项目</p>
            </div>
            <div className="w-full sm:w-64">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索项目名称"
                  className="w-full px-4 py-2.5 pl-10 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <Search className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 主内容区域 */}
        <main>
          {/* 项目列表 */}
          {!isProjectLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-300">
              {/* 新建项目空白卡片 */}
              <div 
                onClick={() => setShowCreateModal(true)}
                className="bg-card rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border  flex flex-col items-center justify-center h-[200px] cursor-pointer  group"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-foreground font-medium">新建项目</p>
                </div>
              </div>
              
              {/* 项目卡片列表 */}
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

          {/* 分页器 */}
          <div className="mt-12">
            <Paginator
              pagination={pagination}
              goToPage={goToPage}
              goToNextPage={goToNextPage}
              goToPrevPage={goToPrevPage}
              setPageSize={setPageSize}
            />
          </div>
        </main>
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
        message={`确定要删除项目 "${deleteConfirmProject || ''}" 吗？删除后无法恢复。`}
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