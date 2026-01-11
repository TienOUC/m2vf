import React, { useState, useRef, useEffect } from 'react';
import ProjectEditModal from '@/components/projects/ProjectEditModal';
import { Tooltip } from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';
import { useProjectEditingStore } from '@/lib/stores';

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
  onDelete: (projectName: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  const {
    projectName, 
    projectDescription, 
    setProjectName, 
    setProjectDescription, 
    updateProjectInfo,
    resetForm
  } = useProjectEditingStore();
  
  const [showEditModal, setShowEditModal] = useState(false);
  
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const [showTitleTooltip, setShowTitleTooltip] = useState(false);
  const [showDescTooltip, setShowDescTooltip] = useState(false);
  
  useEffect(() => {
    const titleElement = titleRef.current;
    const descElement = descRef.current;
    
    if (titleElement) {
      // 检查标题是否溢出
      setShowTitleTooltip(titleElement.scrollWidth > titleElement.clientWidth);
    }
    
    if (descElement) {
      // 检查描述是否溢出，对于line-clamp-4，我们需要特殊处理
      // 创建一个临时元素来获取完整文本的高度
      const tempElement = document.createElement('div');
      tempElement.style.position = 'absolute';
      tempElement.style.visibility = 'hidden';
      tempElement.style.whiteSpace = 'normal';
      tempElement.style.wordWrap = 'break-word';
      tempElement.style.width = `${descElement.clientWidth}px`;
      tempElement.style.fontSize = '14px'; // text-sm
      tempElement.style.lineHeight = '1.4'; // typical line height for text-sm
      tempElement.style.padding = '0';
      tempElement.style.margin = '0';
      tempElement.innerHTML = descElement.innerHTML;
      
      document.body.appendChild(tempElement);
      const fullHeight = tempElement.offsetHeight;
      document.body.removeChild(tempElement);
      
      // 计算4行文本的高度（近似）
      const lineHeight = parseFloat(window.getComputedStyle(descElement).lineHeight);
      const approxFourLineHeight = lineHeight * 4;
      
      // 检查实际显示高度与4行文本高度的比较
      const isOverflowing = fullHeight > approxFourLineHeight;
      setShowDescTooltip(isOverflowing);
    }
  }, [project.name, project.description]);

  const handleSaveProject = async () => {
    try {
      await updateProjectInfo(project.id);
      setShowEditModal(false);
      resetForm(); // 重置表单状态
    } catch (error) {
      console.error('更新项目信息失败:', error);
    }
  };
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 设置当前项目信息到store
    setProjectName(project.name);
    setProjectDescription(project.description);
    setShowEditModal(true);
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project.name);
  };
  
  return (
    <>
      <div 
        className="relative bg-background rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 border border-neutral-200 flex flex-col aspect-[5/3] group cursor-pointer overflow-hidden"
        onClick={() => onEdit(project.id)}
      >
        {/* 图标背景层 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <AutoAwesome className="text-neutral-100" style={{ fontSize: 140 }} />
        </div>
        
        {/* 内容层 */}
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex-1 flex flex-col">
            {/* 项目标题和操作按钮区域 */}
            <div className="flex justify-between items-start mb-4">
              {showTitleTooltip ? (
                <Tooltip title={project.name} placement="top" arrow>
                  <h3 ref={titleRef} className="text-xl font-bold text-foreground truncate flex-1 cursor-default">{project.name}</h3>
                </Tooltip>
              ) : (
                <h3 ref={titleRef} className="text-xl font-bold text-foreground truncate flex-1 cursor-default">{project.name}</h3>
              )}
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleEditClick}
                  className="text-primary-600 hover:text-primary-800 p-2 rounded-full hover:bg-primary-50 transition-colors"
                  title="编辑项目"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="text-error-600 hover:text-error-800 p-2 rounded-full hover:bg-error-50 transition-colors"
                  title="删除项目"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* 项目描述区域 */}
            <div className="flex-1 mb-4">
              {showDescTooltip ? (
                <Tooltip title={project.description} placement="top" arrow>
                  <p ref={descRef} className="text-foreground text-sm line-clamp-4 cursor-default">{project.description}</p>
                </Tooltip>
              ) : (
                <p ref={descRef} className="text-foreground text-sm line-clamp-4 cursor-default">{project.description}</p>
              )}
            </div>
          </div>
          
          {/* 底部信息区域 */}
          <div className="pt-4 border-t border-neutral-100">
            <div className="text-xs text-foreground space-y-1">
              <p className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                创建: {new Date(project.created_at).toLocaleDateString()}
              </p>
              <p className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                更新: {new Date(project.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <ProjectEditModal
        isOpen={showEditModal}
        projectName={projectName}
        projectDescription={projectDescription}
        onClose={() => {
          setShowEditModal(false);
          resetForm(); // 关闭模态框时重置表单
        }}
        onSave={handleSaveProject}
        onProjectNameChange={setProjectName}
        onProjectDescriptionChange={setProjectDescription}
      />
    </>
  );
};

export default ProjectCard;