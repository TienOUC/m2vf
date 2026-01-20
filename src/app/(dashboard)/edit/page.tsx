'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import FlowCanvas from '@/components/editor/FlowCanvas';
import ProjectEditModal from '@/components/projects/ProjectEditModal';
import { 
  useProjectEditingStore,
  useProjectManagementStore
} from '@/lib/stores';

export default function EditPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  
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
  
  useEffect(() => {
    const fetchProjectData = async () => {
      if (projectId) {
        try {
          const projectData = await fetchProjectDetail(projectId);
          setProjectDetail(projectData);
        } catch (error) {
          console.error('获取项目详情失败:', error);
        }
      }
    };

    fetchProjectData();
  }, [projectId, fetchProjectDetail]);

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