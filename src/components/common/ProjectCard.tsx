import React, { useState } from 'react';
import ProjectEditModal from './ProjectEditModal';
import ConfirmDialog from './ConfirmDialog';

interface Project {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface ProjectCardProps {
  project: Project;
  onEdit: (projectId: number) => void; // 这个现在用于点击卡片时跳转到编辑页面
  onEditProjectInfo: (projectId: number, name: string, description: string) => Promise<void>; // 用于更新项目信息
  onDelete: (projectName: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onEditProjectInfo, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProjectName, setEditProjectName] = useState(project.name);
  const [editProjectDescription, setEditProjectDescription] = useState(project.description);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleSaveProject = async () => {
    try {
      await onEditProjectInfo(project.id, editProjectName, editProjectDescription);
      setShowEditModal(false);
    } catch (error) {
      console.error('更新项目信息失败:', error);
    }
  };
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditProjectName(project.name);
    setEditProjectDescription(project.description);
    setShowEditModal(true);
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };
  
  const handleConfirmDelete = () => {
    onDelete(project.name);
    setShowDeleteConfirm(false);
  };
  
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };
  
  return (
    <>
      <div 
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 flex flex-col aspect-[5/3] group cursor-pointer"
        onClick={() => onEdit(project.id)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
            <p className="text-gray-600 mt-2 text-sm line-clamp-3">{project.description}</p>
          </div>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEditClick}
              className="text-blue-600 hover:text-blue-800 p-1 rounded"
              title="编辑项目"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDeleteClick}
              className="text-red-600 hover:text-red-800 p-1 rounded"
              title="删除项目"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-auto text-xs text-gray-500">
          <p>创建时间: {new Date(project.created_at).toLocaleDateString()}</p>
          <p>更新时间: {new Date(project.updated_at).toLocaleDateString()}</p>
        </div>
      </div>
      
      <ProjectEditModal
        isOpen={showEditModal}
        projectName={editProjectName}
        projectDescription={editProjectDescription}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProject}
        onProjectNameChange={setEditProjectName}
        onProjectDescriptionChange={setEditProjectDescription}
      />
      
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="删除项目"
        message={`确定要删除项目 "${project.name}" 吗？此操作无法撤销。`}
        confirmText="确认删除"
        cancelText="取消"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default ProjectCard;