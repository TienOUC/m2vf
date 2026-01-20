'use client';

import { useState, useEffect } from 'react';
import { Folder as FolderIcon, Close as CloseIcon } from '@mui/icons-material';
import { getProjectImageTree } from '@/lib/api/client/images';

interface CreateFolderDialogProps {
  onClose: () => void;
  onConfirm: (name: string, parent: number | null) => void;
  projectId: number;
}

interface Folder {
  id: number;
  name: string;
  parent: number | null;
  children?: Folder[];
}

export default function CreateFolderDialog({ onClose, onConfirm, projectId }: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [pathPreview, setPathPreview] = useState('');

  // 获取所有文件夹用于选择父级路径
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setLoading(true);
        const response = await getProjectImageTree(projectId, { 
          includeResources: false,
          fullTree: true // 获取完整的树形结构
        });
        const data = await response.json();
        
        // 处理返回的数据
        const allFolders = Array.isArray(data) ? data : (data.folders || []);
        setFolders(allFolders);
      } catch (error) {
        console.error('获取文件夹列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchFolders();
    }
  }, [projectId]);

  // 更新路径预览
  useEffect(() => {
    if (parentId !== null) {
      // 找到选中的父文件夹名称
      const findFolderName = (folders: Folder[], id: number): string | null => {
        for (const folder of folders) {
          if (folder.id === id) {
            return folder.name;
          }
          if (folder.children && folder.children.length > 0) {
            const found = findFolderName(folder.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      const parentFolderName = findFolderName(folders, parentId);
      setPathPreview(parentFolderName ? `${parentFolderName}/` : '/');
    } else {
      setPathPreview('/'); // 根目录
    }
  }, [parentId, folders]);

  const handleConfirm = () => {
    if (!folderName.trim()) {
      alert('请输入文件夹名称');
      return;
    }
    onConfirm(folderName.trim(), parentId);
  };

  // 递归渲染文件夹树
  const renderFolderTree = (folders: Folder[], level = 0) => {
    return folders.map((folder) => (
      <div key={folder.id}>
        <div
          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
            parentId === folder.id ? 'bg-blue-100 border border-blue-300' : ''
          }`}
          onClick={() => setParentId(folder.id)}
        >
          <FolderIcon className="w-4 h-4 text-blue-500" />
          <span className="text-sm">{folder.name}</span>
        </div>
        {folder.children && folder.children.length > 0 && (
          <div className="ml-4">
            {renderFolderTree(folder.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      {/* 对话框 */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">新建文件夹</h3>
            <button 
              onClick={onClose} 
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                文件夹名称
              </label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入文件夹名称"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                路径预览
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                {pathPreview}
                <span className="font-medium">{folderName || '<新文件夹>'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                选择父级路径
              </label>
              <div className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">加载中...</div>
                ) : (
                  <>
                    <div
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                        parentId === null ? 'bg-blue-100 border border-blue-300' : ''
                      }`}
                      onClick={() => setParentId(null)}
                    >
                      <FolderIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">根目录</span>
                    </div>
                    {renderFolderTree(folders)}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}