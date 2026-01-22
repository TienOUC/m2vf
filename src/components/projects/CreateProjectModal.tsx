import React from 'react';

interface CreateProjectModalProps {
  isOpen: boolean;
  projectName: string;
  projectDescription: string;
  isLoading: boolean;
  onClose: () => void;
  onProjectNameChange: (name: string) => void;
  onProjectDescriptionChange: (description: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onResetMessages: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  projectName,
  projectDescription,
  isLoading,
  onClose,
  onProjectNameChange,
  onProjectDescriptionChange,
  onSubmit,
  onResetMessages,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-lg border border-border w-full max-w-md transition-all duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-foreground">创建新项目</h3>
            <button
              onClick={() => {
                onClose();
                onResetMessages();
              }}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-foreground mb-1.5">
                  项目名称 *
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => onProjectNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                  placeholder="请输入项目名称"
                  required
                />
              </div>

              <div>
                <label htmlFor="projectDescription" className="block text-sm font-medium text-foreground mb-1.5">
                  项目描述
                </label>
                <textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => onProjectDescriptionChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                  placeholder="请输入项目描述"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onResetMessages();
                }}
                className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground hover:bg-muted transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
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
  );
};

export default CreateProjectModal;