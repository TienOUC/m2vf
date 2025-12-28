'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/config/api.config';
import { Navbar } from '@/components/layout';
import { useProjectManagement } from '@/hooks/useProjectManagement';
import { 
  isUserLoggedIn,
  getAccessToken 
} from '@/lib/utils/token';
import Paginator from '@/components/common/Paginator';
import CreateProjectModal from '@/components/common/CreateProjectModal';
import ProjectCard from '@/components/common/ProjectCard';

interface Project {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  
  const {
    projects,
    isLoading: isProjectLoading,
    error: projectError,
    success: projectSuccess,
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
  } = useProjectManagement();

  // 检查用户认证状态
  useEffect(() => {
    const checkAuth = async () => {
      if (!isUserLoggedIn()) {
        router.replace(`${ROUTES.LOGIN}?redirect=${ROUTES.PROJECTS}`);
        setAuthChecked(true);
        return;
      }

      try {
        // 获取用户信息
        const token = getAccessToken();
        if (token) {
          // 这里应该调用获取用户信息的API
          // 暂时使用模拟数据，实际应用中需要调用API
          setUser({ name: '用户', email: 'user@example.com' });
        }

        // 获取项目列表，默认获取第一页，每页10个项目
        await fetchProjects(1, 10);
      } catch (error) {
        console.error('认证检查失败:', error);
        router.replace(`${ROUTES.LOGIN}?redirect=${ROUTES.PROJECTS}`);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [router]); // 移除了 fetchProjects 依赖，因为现在它被正确缓存了

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    try {
      await createProjectAPI({
        name: newProjectName,
        description: newProjectDescription
      });
      
      setNewProjectName('');
      setNewProjectDescription('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('创建项目错误:', error);
    }
  };

  const handleDeleteProject = async (projectName: string) => {
    if (!confirm(`确定要删除项目 "${projectName}" 吗？此操作不可撤销。`)) {
      return;
    }

    try {
      await deleteProjectAPI(projectName);
    } catch (error) {
      console.error('删除项目错误:', error);
    }
  };

  const handleEditProject = (projectId: number) => {
    router.push(`${ROUTES.EDIT}?projectId=${projectId}`);
  };

  const handleEditProjectInfo = async (projectId: number, name: string, description: string) => {
    try {
      await updateProject(projectId, { name, description });
      // 重新获取项目列表以显示更新后的数据
      await fetchProjects(pagination.page, pagination.pageSize);
    } catch (error) {
      console.error('更新项目信息失败:', error);
      alert('更新项目信息失败');
    }
  };

  if (!authChecked) {
    return null; // 等待认证检查完成
  }

  if (!isUserLoggedIn()) {
    return null; // 已重定向到登录页
  }


  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* 顶部导航栏 */}
      <Navbar user={user} />

      {/* 主内容区域 */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">项目管理</h1>
            <p className="text-gray-600 mt-2">管理您的所有项目</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新建项目
          </button>
        </div>

        {/* 项目列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project}
              onEdit={handleEditProject}
              onEditProjectInfo={handleEditProjectInfo}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>

        {projects.length === 0 && !isProjectLoading && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">暂无项目</h3>
            <p className="text-gray-500 mb-6">您还没有创建任何项目，点击下方按钮创建一个新项目</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              创建第一个项目
            </button>
          </div>
        )}

        {/* 分页器 */}
        {pagination.totalPages > 1 && (
          <Paginator
            pagination={pagination}
            goToPage={goToPage}
            goToNextPage={goToNextPage}
            goToPrevPage={goToPrevPage}
            setPageSize={setPageSize}
          />
        )}
      </main>

      {/* 创建项目模态框 */}
      <CreateProjectModal
        isOpen={showCreateModal}
        projectName={newProjectName}
        projectDescription={newProjectDescription}
        isLoading={isProjectLoading}
        error={projectError}
        success={projectSuccess}
        onClose={() => setShowCreateModal(false)}
        onProjectNameChange={setNewProjectName}
        onProjectDescriptionChange={setNewProjectDescription}
        onSubmit={handleCreateProject}
        onResetMessages={resetMessages}
      />
    </div>
  );
}