import React from 'react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">编辑项目信息</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <label htmlFor="editProjectName" className="block text-sm font-medium text-gray-700 mb-1">
              项目名称 *
            </label>
            <input
              type="text"
              id="editProjectName"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入项目名称"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="editProjectDescription" className="block text-sm font-medium text-gray-700 mb-1">
              项目描述
            </label>
            <textarea
              id="editProjectDescription"
              value={projectDescription}
              onChange={(e) => onProjectDescriptionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入项目描述"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '保存中...' : '保存更改'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditModal;