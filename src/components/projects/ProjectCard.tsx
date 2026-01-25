import React, { useState, useRef, useEffect } from 'react';
import ProjectEditModal from '@/components/projects/ProjectEditModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useProjectEditingStore } from '@/lib/stores';
import { useToast } from '@/hooks/use-toast';

const cardGradients = [
  'bg-gradient-to-br from-emerald-400/30 via-teal-300/20 to-cyan-400/25',
  'bg-gradient-to-br from-amber-300/35 via-orange-200/25 to-rose-300/30',
  'bg-gradient-to-br from-stone-300/30 via-amber-200/20 to-yellow-300/25',
  'bg-gradient-to-br from-sky-300/30 via-indigo-200/20 to-violet-300/25',
];

const getRandomGradientIndex = (id: number) => {
  return id % cardGradients.length;
};

interface Project {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface ProjectCardProps {
  project: Project;
  onEdit: (projectId: number) => void;
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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const [showTitleTooltip, setShowTitleTooltip] = useState(false);
  const [showDescTooltip, setShowDescTooltip] = useState(false);
  
  useEffect(() => {
    const titleElement = titleRef.current;
    const descElement = descRef.current;
    
    if (titleElement) {
      setShowTitleTooltip(titleElement.scrollWidth > titleElement.clientWidth);
    }
    
    if (descElement) {
      const tempElement = document.createElement('div');
      tempElement.style.position = 'absolute';
      tempElement.style.visibility = 'hidden';
      tempElement.style.whiteSpace = 'normal';
      tempElement.style.wordWrap = 'break-word';
      tempElement.style.width = `${descElement.clientWidth}px`;
      tempElement.style.fontSize = '14px';
      tempElement.style.lineHeight = '1.4';
      tempElement.style.padding = '0';
      tempElement.style.margin = '0';
      tempElement.innerHTML = descElement.innerHTML;
      
      document.body.appendChild(tempElement);
      const fullHeight = tempElement.offsetHeight;
      document.body.removeChild(tempElement);
      
      const lineHeight = parseFloat(window.getComputedStyle(descElement).lineHeight);
      const approxFourLineHeight = lineHeight * 4;
      
      const isOverflowing = fullHeight > approxFourLineHeight;
      setShowDescTooltip(isOverflowing);
    }
  }, [project.name, project.description]);

  const handleSaveProject = async () => {
    setIsLoading(true);
    try {
      await updateProjectInfo(project.id);
      setShowEditModal(false);
      resetForm();
      
      // 显示成功toast
      toast({
        title: '成功',
        description: `项目 "${projectName}" 更新成功`,
        variant: 'default'
      });
    } catch (error) {
      console.error('更新项目信息失败:', error);
      
      // 显示错误toast
      toast({
        title: '错误',
        description: '更新项目信息失败',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectName(project.name);
    setProjectDescription(project.description);
    setShowEditModal(true);
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project.name);
  };
  
  const gradientIndex = getRandomGradientIndex(project.id);
  const randomGradient = cardGradients[gradientIndex];

  return (
    <>
      <div 
        className={`relative rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 border border-border flex flex-col h-[200px] group cursor-pointer overflow-hidden ${randomGradient}`}
        onClick={() => onEdit(project.id)}
      >
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              {showTitleTooltip ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 ref={titleRef} className="text-xl font-bold text-foreground truncate flex-1 cursor-default">{project.name}</h3>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{project.name}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <h3 ref={titleRef} className="text-xl font-bold text-foreground truncate flex-1 cursor-default">{project.name}</h3>
              )}
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleEditClick}
                  className="text-primary hover:text-primary/80 p-2 rounded-full hover:bg-primary/5 transition-colors"
                  title="编辑项目"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="text-destructive hover:text-destructive/80 p-2 rounded-full hover:bg-destructive/5 transition-colors"
                  title="删除项目"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 mb-4">
              {showDescTooltip ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p ref={descRef} className="text-foreground text-sm line-clamp-4 cursor-default">{project.description}</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{project.description}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <p ref={descRef} className="text-foreground text-sm line-clamp-4 cursor-default">{project.description}</p>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
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
          resetForm();
        }}
        onSave={handleSaveProject}
        onProjectNameChange={setProjectName}
        onProjectDescriptionChange={setProjectDescription}
        isLoading={isLoading}
      />
    </>
  );
};

export default ProjectCard;