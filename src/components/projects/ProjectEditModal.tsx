import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ProjectEditModalProps {
  isOpen: boolean;
  projectName: string;
  projectDescription: string;
  onClose: () => void;
  onSave: () => void;
  onProjectNameChange: (name: string) => void;
  onProjectDescriptionChange: (description: string) => void;
  isLoading?: boolean;
}

const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  isOpen,
  projectName,
  projectDescription,
  onClose,
  onSave,
  onProjectNameChange,
  onProjectDescriptionChange,
  isLoading = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑项目信息</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="edit-project-name" className="text-sm font-medium">
              项目名称 *
            </label>
            <input
              id="edit-project-name"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              placeholder="请输入项目名称"
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="edit-project-description" className="text-sm font-medium">
              项目描述
            </label>
            <textarea
              id="edit-project-description"
              value={projectDescription}
              onChange={(e) => onProjectDescriptionChange(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              placeholder="请输入项目描述"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            取消
          </Button>
          <Button onClick={onSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                保存中...
              </>
            ) : (
              '保存更改'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectEditModal;