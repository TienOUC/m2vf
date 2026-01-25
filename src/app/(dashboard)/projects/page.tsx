'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus } from 'lucide-react';
import { ROUTES } from '@/lib/config/api.config';
import {
  useProjectManagementStore
} from '@/lib/stores';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationEllipsis } from '@/components/ui/pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import ProjectCard from '@/components/projects/ProjectCard';
import Loading from '@/app/loading';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 使用toast hook
  const { toast } = useToast();
  
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
    
    const projectName = newProjectName;
    const projectDescription = newProjectDescription;
    
    try {
      await createProjectAPI({
        name: projectName,
        description: projectDescription
      });
      
      setNewProjectName('');
      setNewProjectDescription('');
      setShowCreateModal(false);
      
      toast({ title: '成功', description: `项目 "${projectName}" 创建成功`, variant: 'default' });
    } catch (error) {
      console.error('创建项目错误:', error);
      
      // 显示错误消息
      toast({ title: '错误', description: '项目创建失败', variant: 'destructive' });
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
        
        toast({ title: '成功', description: `项目 "${deleteConfirmProject}" 删除成功`, variant: 'default' });
      } catch (error) {
        console.error('删除项目错误:', error);
        
        toast({ title: '错误', description: '项目删除失败', variant: 'destructive' });
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
    const projectName = name;
    try {
      await updateProject(projectId, { name: projectName, description });
      
      toast({ title: '成功', description: `项目 "${projectName}" 更新成功`, variant: 'default' });
    } catch (error) {
      console.error('更新项目信息失败:', error);
      
      toast({ title: '错误', description: '更新项目信息失败', variant: 'destructive' });
    }
  };




  
  return (
    <>
      {/* Loading组件只在初始加载项目列表时显示 */}
      {isProjectLoading && projects.length === 0 && <Loading />}
      
      {/* 主内容区域容器 */}
      <div className="max-w-[1440px] mx-auto py-10 box-border">
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
          <div className="fixed bottom-0 left-0 right-0 bg-background border-input py-3 z-[10] px-20 box-border">
            <div className="max-w-[1440px] mx-auto w-full flex justify-between items-center">
              <span className="text-sm text-foreground">
                共 {pagination.total} 条
              </span>
              <div className="flex items-center space-x-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationPrevious onClick={goToPrevPage} disabled={pagination.page === 1} />
                    
                    {/* 页码按钮 */}
                    {pagination.totalPages <= 1 ? (
                      <PaginationItem data-active={pagination.page === 1} onClick={() => goToPage(1)}>
                        1
                      </PaginationItem>
                    ) : pagination.totalPages <= 5 ? (
                      Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page} data-active={pagination.page === page} onClick={() => goToPage(page)}>
                          {page}
                        </PaginationItem>
                      ))
                    ) : (
                      <>
                        <PaginationItem data-active={pagination.page === 1} onClick={() => goToPage(1)}>
                          1
                        </PaginationItem>
                        
                        {pagination.page > 3 && <PaginationEllipsis />}
                        
                        {/* 显示当前页及其前后各一页 */}
                        {Array.from({ length: Math.min(3, pagination.totalPages - 2) }, (_, i) => {
                          const startPage = Math.max(2, pagination.page - 1);
                          return startPage + i;
                        }).map((page) => (
                          <PaginationItem key={page} data-active={pagination.page === page} onClick={() => goToPage(page)}>
                            {page}
                          </PaginationItem>
                        ))}
                        
                        {pagination.page < pagination.totalPages - 2 && <PaginationEllipsis />}
                        
                        <PaginationItem data-active={pagination.page === pagination.totalPages} onClick={() => goToPage(pagination.totalPages)}>
                          {pagination.totalPages}
                        </PaginationItem>
                      </>
                    )}
                    
                    <PaginationNext onClick={goToNextPage} disabled={pagination.page === pagination.totalPages} />
                  </PaginationContent>
                </Pagination>
                
                {/* 每页显示条数选择 */}
                <div className="flex items-center">
                  <span className="text-sm text-foreground mr-2">每页</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-3 py-1 w-20">
                      {pagination.pageSize}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuRadioGroup value={String(pagination.pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                        <DropdownMenuRadioItem value="20">
                          20
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="40">
                          40
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="60">
                          60
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <span className="text-sm text-foreground ml-2">条</span>
                </div>
              </div>
            </div>
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
      <Dialog open={deleteConfirmProject !== null} onOpenChange={(open) => !open && handleCancelDelete()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除项目</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              确定要删除项目 "{deleteConfirmProject || ''}" 吗？删除后无法恢复。
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="inline-flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>删除中...</span>
                </div>
              ) : (
                '确认删除'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      

    </>
  );
}