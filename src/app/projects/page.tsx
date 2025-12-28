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

  if (!authChecked) {
    return null; // 等待认证检查完成
  }

  if (!isUserLoggedIn()) {
    return null; // 已重定向到登录页
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-gray-600 mt-2 text-sm">{project.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditProject(project.id)}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded"
                    title="编辑项目"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.name)}
                    className="text-red-600 hover:text-red-800 p-1 rounded"
                    title="删除项目"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                <p>创建时间: {new Date(project.created_at).toLocaleDateString()}</p>
                <p>更新时间: {new Date(project.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
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
          <div className="mt-8 flex flex-col items-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPrevPage}
                disabled={pagination.page === 1}
                className={`px-3 py-2 rounded-md ${pagination.page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                上一页
              </button>
              
              <span className="text-gray-700">
                第 {pagination.page} 页，共 {pagination.totalPages} 页
              </span>
              
              <button
                onClick={goToNextPage}
                disabled={pagination.page === pagination.totalPages}
                className={`px-3 py-2 rounded-md ${pagination.page === pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                下一页
              </button>
            </div>
            
            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
              <span>每页显示：</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>共 {pagination.total} 个项目</span>
            </div>
            
            <div className="mt-4 flex flex-wrap justify-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-8 h-8 rounded-full ${pagination.page === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 创建项目模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">创建新项目</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetMessages();
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {projectError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {projectError}
                </div>
              )}

              {projectSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                  {projectSuccess}
                </div>
              )}

              <form onSubmit={handleCreateProject}>
                <div className="mb-4">
                  <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                    项目名称 *
                  </label>
                  <input
                    type="text"
                    id="projectName"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="请输入项目名称"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    项目描述
                  </label>
                  <textarea
                    id="projectDescription"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="请输入项目描述"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetMessages();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isProjectLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isProjectLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        创建中...
                      </>
                    ) : (
                      '创建项目'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}