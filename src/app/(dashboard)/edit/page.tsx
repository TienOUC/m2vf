'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { ROUTES } from '@/lib/config/api.config';
import Navbar from '@/components/layout/Navbar';
import FlowCanvas from '@/components/editor/FlowCanvas';
import ProjectEditModal from '@/components/projects/ProjectEditModal';
import { 
  useProjectEditingStore,
  useProjectManagementStore,
  useAuthStore
} from '@/lib/stores';

export default function EditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [projectDetail, setProjectDetail] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const { 
    projectName: editProjectName, 
    setProjectName,
    projectDescription: editProjectDescription, 
    setProjectDescription,
    fetchProjectDetail,
    updateProjectInfo,
    resetForm,
  } = useProjectEditingStore();
  
  const { updateProject } = useProjectManagementStore();
  
  useEffect(() => {
    if (authChecked) return;
    
    if (!isAuthenticated || !user) {
      if (!authChecked) {
        console.warn('用户未认证，跳转到登录页');
      }
      router.replace(`${ROUTES.LOGIN}?redirect=${window.location.pathname}${window.location.search}`);
      setAuthChecked(true);
      return;
    }

    const fetchProjectData = async () => {
      if (projectId) {
        try {
          const projectData = await fetchProjectDetail(projectId);
          setProjectDetail(projectData);
        } catch (error) {
          console.error('获取项目详情失败:', error);
        }
      }
      setIsLoading(false);
      setAuthChecked(true);
    };

    fetchProjectData();
  }, [router, projectId, fetchProjectDetail, isAuthenticated, user, authChecked]);

  const handleEditProject = async () => {
    if (!projectId) return;
    
    try {
      await updateProjectInfo(projectId);
      
      alert('项目信息更新成功！');
      setShowEditModal(false);
    } catch (error: any) {
      console.error('更新项目信息错误:', error);
      alert(`更新项目信息失败: ${error.message}`);
    }
  };
  
  const openEditModal = () => {
    if (projectDetail) {
      setProjectName(projectDetail.name);
      setProjectDescription(projectDetail.description);
      setShowEditModal(true);
    }
  };

  if (!authChecked) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">检查用户认证状态...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">认证失败，请重新登录</p>
          <button 
            onClick={() => router.replace(`${ROUTES.LOGIN}?redirect=${window.location.pathname}${window.location.search}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            前往登录
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {/* 确保FlowCanvas有明确的高度设置 */}
      <div className="w-full h-full flex-1" style={{ height: '100%', width: '100%', minHeight: '0' }}>
        <FlowCanvas projectId={projectId} />
      </div>
      
      <ProjectEditModal
        isOpen={showEditModal}
        projectName={editProjectName}
        projectDescription={editProjectDescription}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        onSave={handleEditProject}
        onProjectNameChange={setProjectName}
        onProjectDescriptionChange={setProjectDescription}
      />
    </>
  );
}