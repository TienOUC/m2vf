'use client';

import { useAuthStore, useProjectManagementStore, useProjectEditingStore, useUIStore } from '@/lib/stores';

export default function TestStorePage() {
  const { isAuthenticated, user, accessToken, login, logout } = useAuthStore();
  const { projects, fetchProjects, createProject, deleteProject, updateProject } = useProjectManagementStore();
  const { projectName, projectDescription, setProjectName, setProjectDescription, fetchProjectDetail, updateProjectInfo } = useProjectEditingStore();
  const { isSidebarOpen, setIsSidebarOpen, showMessage } = useUIStore();

  const handleTestAuth = async () => {
    // 注意：这里只是为了测试，实际登录需要真实凭据
    console.log('Auth state:', { isAuthenticated, user, accessToken });
  };

  const handleTestProjects = async () => {
    console.log('Projects:', projects);
    try {
      await fetchProjects();
      console.log('Fetched projects:', projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleTestUI = () => {
    console.log('Sidebar open:', isSidebarOpen);
    setIsSidebarOpen(!isSidebarOpen);
    showMessage('Store integration is working!', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Zustand Store 测试页面</h1>
        
        <div className="space-y-6">
          <section className="border p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">认证状态</h2>
            <p>已认证: {isAuthenticated ? '是' : '否'}</p>
            <p>用户: {user ? user.name : '未登录'}</p>
            <p>访问令牌: {accessToken ? '存在' : '不存在'}</p>
            <button 
              onClick={handleTestAuth}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              测试认证状态
            </button>
          </section>

          <section className="border p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">项目管理状态</h2>
            <p>项目数量: {projects.length}</p>
            <button 
              onClick={handleTestProjects}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              测试获取项目
            </button>
          </section>

          <section className="border p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">项目编辑状态</h2>
            <p>项目名称: {projectName}</p>
            <p>项目描述: {projectDescription}</p>
            <div className="mt-2">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="项目名称"
                className="border p-2 mr-2"
              />
              <input
                type="text"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="项目描述"
                className="border p-2"
              />
            </div>
          </section>

          <section className="border p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">UI状态</h2>
            <p>侧边栏打开: {isSidebarOpen ? '是' : '否'}</p>
            <button 
              onClick={handleTestUI}
              className="mt-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              测试UI状态
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}