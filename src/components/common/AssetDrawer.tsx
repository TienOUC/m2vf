'use client';

import { useState, useEffect, useCallback } from 'react';
import { Folder as FolderIcon, Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { getProjectImageTree, createFolder } from '@/lib/api/images';
import CreateFolderDialog from './CreateFolderDialog';

interface AssetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
}

interface Folder {
  id: number;
  name: string;
  parent?: number;
  created_at: string;
  children: Folder[];
  image_count: number;
}

export default function AssetDrawer({ isOpen, onClose, projectId }: AssetDrawerProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);


  // 获取文件夹列表
  const fetchFolders = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const response = await getProjectImageTree(projectId, { 
        includeResources: false,
        fullTree: false 
      });
      
      if (!response.ok) {
        throw new Error(`获取文件夹列表失败: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 处理返回的数据，提取顶层文件夹
      // API响应可能直接是数组或包含folders字段的对象
      let topLevelFolders: Folder[] = [];
      if (Array.isArray(data)) {
        topLevelFolders = data;
      } else if (data && typeof data === 'object' && Array.isArray(data.folders)) {
        topLevelFolders = data.folders;
      } else {
        // 如果响应结构不符合预期，确保返回一个空数组
        console.warn('API响应结构不符合预期:', data);
        topLevelFolders = [];
      }
      
      setFolders(topLevelFolders);
    } catch (error) {
      console.error('获取文件夹列表失败:', error);
      setFolders([]); // 确保在错误情况下也设置一个空数组
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchFolders();
    }
  }, [isOpen, projectId, fetchFolders]);

  // 处理新建文件夹
  const handleCreateFolder = async (name: string, parent: number | null = null) => {
    try {
      const folderData = {
        name,
        parent: parent !== null ? parent : undefined  // API期望parent为number或undefined，而不是null
      };
      const response = await createFolder(projectId, folderData);
      if (response.ok) {
        // 重新获取文件夹列表
        await fetchFolders();
        setShowCreateFolderDialog(false);
      }
    } catch (error) {
      console.error('创建文件夹失败:', error);
    }
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div className={`fixed inset-0 z-50 transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        <div className="absolute bottom-0 left-0 right-0 bg-white h-[80vh] rounded-t-xl shadow-2xl">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">资产库</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                <CloseIcon />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">加载中...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 遮罩层 */}
      {/* 遮罩层 */}
      <div 
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* 抽屉内容 */}
      <div 
        className={`fixed inset-x-0 bottom-0 z-50 h-[80vh] max-h-[80vh] bg-white rounded-t-xl shadow-2xl transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* 标题栏 */}
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">资产库</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateFolderDialog(true)}
                className="flex items-center gap-1 bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <AddIcon fontSize="small" />
                <span>新建文件夹</span>
              </button>
              <button 
                onClick={onClose} 
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        </div>

        {/* 主体内容 */}
        <div className="p-4 overflow-y-auto h-[calc(80vh-60px)]">
          {folders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FolderIcon className="w-16 h-16 mb-4" />
              <p>暂无文件夹</p>
              <button
                onClick={() => setShowCreateFolderDialog(true)}
                className="mt-4 text-primary-600 hover:underline"
              >
                点击创建第一个文件夹
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.isArray(folders) ? (
                folders.map((folder) => (
                  <div 
                    key={folder.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <FolderIcon className="w-8 h-8 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{folder.name}</h3>
                        <p className="text-sm text-gray-500">
                          {folder.image_count} 个文件
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(folder.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  数据格式错误
                </div>
              )}
            </div>
          )}
        </div>

        {/* 新建文件夹对话框 */}
        {showCreateFolderDialog && (
          <CreateFolderDialog
            onClose={() => setShowCreateFolderDialog(false)}
            onConfirm={handleCreateFolder}
            projectId={projectId}
          />
        )}
      </div>
    </>
  );
}