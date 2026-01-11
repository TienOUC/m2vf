'use client';

import { useState, useEffect, useCallback } from 'react';
import { Folder as FolderIcon, Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { getProjectImageTree, createFolder, getFolderImages, getFolderVideos } from '@/lib/api/client/images';
import CreateFolderDialog from '@/components/forms/CreateFolderDialog';

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

interface AssetFile {
  id: number;
  name: string;
  type: string;
  size: number;
  created_at: string;
  url: string;
}

export default function AssetDrawer({ isOpen, onClose, projectId }: AssetDrawerProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<AssetFile[]>([]); // 添加文件列表状态
  const [loading, setLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null); // 当前选中的文件夹ID
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);

  // 获取指定文件夹的子文件夹列表
  const fetchFolders = useCallback(async (folderId: number | null = null) => {
    if (!projectId) return [];
    
    try {
      // 只在加载子文件夹时显示loading状态
      if (folderId !== null) {
        setLoading(true);
      }
      
      const response = await getProjectImageTree(projectId, { 
        folderId: folderId,
        includeResources: false,
        fullTree: false  // 逐层加载
      });
      
      if (!response.ok) {
        throw new Error(`获取文件夹列表失败: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 正确处理API响应格式: { code: 200, message: '...', data: { folder: {...}, folders: [...] } }
      let childFolders: Folder[] = [];
      if (data && typeof data === 'object' && data.data) {
        if (Array.isArray(data.data.folders)) {
          // 将返回的子文件夹转换为组件期望的格式
          childFolders = data.data.folders.map((folder: any) => ({
            id: folder.id,
            name: folder.name,
            parent: folder.parent,
            created_at: folder.created_at,
            children: [],
            image_count: folder.images_count || folder.image_count || 0
          }));
        }
      }
      
      // 如果是获取根目录的文件夹列表，设置到状态
      if (folderId === null) {
        setFolders(childFolders);
      }
      
      return childFolders;
    } catch (error) {
      console.error('获取文件夹列表失败:', error);
      if (folderId === null) {
        setFolders([]); // 确保在错误情况下也设置一个空数组
      }
      return [];
    } finally {
      // 只在加载子文件夹时设置loading状态
      if (folderId !== null) {
        setLoading(false);
      }
    }
  }, [projectId]);

  // 获取指定文件夹下的文件列表
  const fetchFiles = useCallback(async (folderId: number | null) => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      // 使用 getProjectImageTree API 获取文件夹内容，包含资源
      const response = await getProjectImageTree(projectId, { 
        folderId: folderId,
        includeResources: true,
        fullTree: false
      });
      
      if (!response.ok) {
        throw new Error(`获取文件列表失败: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 处理返回的数据，提取文件资源
      let filesList: AssetFile[] = [];
      if (data && typeof data === 'object') {
        // 检查是否是完整的API响应格式 { code: 200, message: '...', data: { images: [...], videos: [...] } }
        if (data.data) {
          // 合并图片和视频文件
          const images = Array.isArray(data.data.images) ? data.data.images : [];
          const videos = Array.isArray(data.data.videos) ? data.data.videos : [];
          
          filesList = [
            ...images.map((img: any) => ({
              id: img.id,
              name: img.name || '未命名图片',
              type: 'image',
              size: img.size || 0,
              created_at: img.created_at || new Date().toISOString(),
              url: img.url || img.image_url || ''
            })),
            ...videos.map((vid: any) => ({
              id: vid.id,
              name: vid.name || '未命名视频',
              type: 'video',
              size: vid.size || 0, // 视频可能没有size字段，需要从其他地方获取
              created_at: vid.created_at || new Date().toISOString(),
              url: vid.url || vid.video_url || ''
            }))
          ];
        } else if (Array.isArray(data.images) || Array.isArray(data.videos)) {
          // 处理 { images: [...], videos: [...] } 格式
          const images = Array.isArray(data.images) ? data.images : [];
          const videos = Array.isArray(data.videos) ? data.videos : [];
          
          filesList = [
            ...images.map((img: any) => ({
              id: img.id,
              name: img.name || '未命名图片',
              type: 'image',
              size: img.size || 0,
              created_at: img.created_at || new Date().toISOString(),
              url: img.url || img.image_url || ''
            })),
            ...videos.map((vid: any) => ({
              id: vid.id,
              name: vid.name || '未命名视频',
              type: 'video',
              size: vid.size || 0,
              created_at: vid.created_at || new Date().toISOString(),
              url: vid.url || vid.video_url || ''
            }))
          ];
        } else if (Array.isArray(data.resources)) {
          // 处理 { resources: [...] } 格式
          filesList = data.resources.map((res: any) => ({
            id: res.id,
            name: res.name || '未命名文件',
            type: res.type || 'file',
            size: res.size || 0,
            created_at: res.created_at || new Date().toISOString(),
            url: res.url || ''
          }));
        } else if (Array.isArray(data)) {
          // 如果直接返回数组
          filesList = data.map((item: any) => ({
            id: item.id,
            name: item.name || '未命名文件',
            type: item.type || 'file',
            size: item.size || 0,
            created_at: item.created_at || new Date().toISOString(),
            url: item.url || ''
          }));
        }
      }
      
      setFiles(filesList);
    } catch (error) {
      console.error('获取文件列表失败:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // 在抽屉打开时获取根目录的文件
  useEffect(() => {
    if (isOpen && projectId) {
      fetchFolders(null); // 获取根目录的文件夹
      fetchFiles(null); // 获取根目录文件
      setCurrentFolderId(null); // 默认选中根目录
    }
  }, [isOpen, projectId, fetchFolders, fetchFiles]);

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

  // 定义 FolderItem 组件
  const FolderItem = ({ folder, projectId, level = 0 }: { folder: Folder, projectId: number, level?: number }) => {
    const [expanded, setExpanded] = useState(false);
    const [children, setChildren] = useState<Folder[]>([]);
    const [loadingChildren, setLoadingChildren] = useState(false);
    const paddingLeft = `${level * 20}px`;
    const isSelected = currentFolderId === folder.id;

    const toggleExpanded = async () => {
      if (!expanded) {
        // 展开时加载子文件夹
        setLoadingChildren(true);
        const childFolders = await fetchFolders(folder.id);
        setChildren(childFolders);
        setLoadingChildren(false);
      }
      setExpanded(!expanded);
    };

    const handleFolderClick = () => {
      setCurrentFolderId(folder.id);
      fetchFiles(folder.id); // 获取该文件夹下的文件
    };

    return (
      <div className="w-full">
        <div 
          className={`flex items-center gap-2 p-2 rounded cursor-pointer ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
          style={{ paddingLeft }}
          onClick={toggleExpanded}
        >
          <FolderIcon 
            className={`w-5 h-5 text-blue-500 transition-transform ${expanded ? 'rotate-90' : ''}`} 
            onClick={(e) => {
              e.stopPropagation();
              handleFolderClick();
            }}
          />
          <div className="flex-1 min-w-0" onClick={handleFolderClick}>
            <h3 className="font-medium truncate">{folder.name}</h3>
            <p className="text-xs text-gray-500">
              {folder.image_count} 个文件
            </p>
          </div>
          <p className="text-xs text-gray-400">
            {new Date(folder.created_at).toLocaleDateString()}
          </p>
        </div>
        
        {/* 加载子文件夹指示器 */}
        {expanded && loadingChildren && (
          <div className="ml-6 pl-2 text-sm text-gray-500">
            加载中...
          </div>
        )}
        
        {/* 子文件夹 */}
        {expanded && children && children.length > 0 && (
          <div className="ml-4 border-l border-gray-200 pl-2">
            {children.map((childFolder) => (
              <FolderItem 
                key={childFolder.id} 
                folder={childFolder} 
                projectId={projectId}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
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
        <div className="flex h-[calc(80vh-60px)]">
          {/* 文件夹列表侧边栏 */}
          <div className="w-1/3 border-r p-4 overflow-y-auto">
            <h3 className="font-semibold mb-2">文件夹</h3>
            {folders.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                暂无文件夹
              </div>
            ) : (
              <div className="space-y-1">
                {/* 根目录 */}
                <div 
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer ${currentFolderId === null ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'}`}
                  onClick={() => {
                    setCurrentFolderId(null);
                    fetchFiles(null);
                  }}
                >
                  <FolderIcon className="w-5 h-5 text-blue-500" />
                  <span>根目录</span>
                </div>
                
                {Array.isArray(folders) ? (
                  folders.map((folder) => (
                    <FolderItem 
                      key={folder.id} 
                      folder={folder}
                      projectId={projectId}
                    />
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    数据格式错误
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* 文件列表区域 */}
          <div className="w-2/3 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-2">
              {currentFolderId === null ? '根目录文件' : 
                folders.find(f => f.id === currentFolderId)?.name + ' 文件'}
            </h3>
            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FolderIcon className="w-16 h-16 mb-4" />
                <p>暂无文件</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {files.map((file) => (
                  <div 
                    key={file.id}
                    className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{file.name}</h4>
                        <p className="text-xs text-gray-500">{file.type} | {(file.size / 1024).toFixed(2)}KB</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
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