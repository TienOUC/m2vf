// 图片库管理相关 API

import { apiRequest } from './index';

// ==================== 图片库管理API ====================

// 获取项目文件夹树状结构（支持懒加载）
export const getProjectImageTree = async (
  projectId: number,
  options?: {
    folderId?: number | null;
    includeResources?: boolean;
    page?: number;
    pageSize?: number;
    fullTree?: boolean; // 是否返回完整的嵌套文件夹树结构（包含所有层级的children），用于媒体收藏等场景
  }
): Promise<Response> => {
  const params = new URLSearchParams();

  if (options?.folderId !== undefined && options.folderId !== null) {
    params.append('folder_id', options.folderId.toString());
  }

  if (options?.includeResources !== undefined) {
    params.append('include_resources', options.includeResources.toString());
  }

  if (options?.page) {
    params.append('page', options.page.toString());
  }

  if (options?.pageSize) {
    params.append('page_size', options.pageSize.toString());
  }

  // 新增参数：是否返回完整的嵌套文件夹树结构
  if (options?.fullTree !== undefined) {
    params.append('full_tree', options.fullTree.toString());
  }

  const queryString = params.toString();
  const treeUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${
        process.env.NEXT_PUBLIC_API_BASE_URL
      }/api/images/api/projects/${projectId}/folders/tree/${
        queryString ? '?' + queryString : ''
      }`
    : `http://127.0.0.1:8000/api/images/api/projects/${projectId}/folders/tree/${
        queryString ? '?' + queryString : ''
      }`;

  console.log('正在获取项目图片树:', treeUrl, '选项:', options);
  return apiRequest(treeUrl, { method: 'GET' });
};

// 创建文件夹
export const createFolder = async (
  projectId: number,
  folderData: {
    name: string;
    parent?: number;
    sort_order?: number;
  }
): Promise<Response> => {
  const createUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/images/api/projects/${projectId}/folders/`
    : `http://127.0.0.1:8000/api/images/api/projects/${projectId}/folders/`;

  console.log('正在创建文件夹:', createUrl);
  return apiRequest(createUrl, {
    method: 'POST',
    body: JSON.stringify(folderData)
  });
};

// 更新文件夹
export const updateFolder = async (
  projectId: number,
  folderId: number,
  folderData: {
    name?: string;
    parent?: number;
    sort_order?: number;
  }
): Promise<Response> => {
  const updateUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/images/api/projects/${projectId}/folders/${folderId}/`
    : `http://127.0.0.1:8000/api/images/api/projects/${projectId}/folders/${folderId}/`;

  console.log('正在更新文件夹:', updateUrl);
  return apiRequest(updateUrl, {
    method: 'PUT',
    body: JSON.stringify(folderData)
  });
};

// 删除文件夹
export const deleteFolder = async (
  projectId: number,
  folderId: number
): Promise<Response> => {
  const deleteUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/images/api/projects/${projectId}/folders/${folderId}/`
    : `http://127.0.0.1:8000/api/images/api/projects/${projectId}/folders/${folderId}/`;

  console.log('正在删除文件夹:', deleteUrl);
  return apiRequest(deleteUrl, { method: 'DELETE' });
};

// 上传图片到文件夹
export const uploadProjectImage = async (
  projectId: number,
  folderId: number,
  imageFile: File,
  name?: string,
  description?: string
): Promise<Response> => {
  const uploadUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/images/api/projects/${projectId}/folders/${folderId}/images/upload/`
    : `http://127.0.0.1:8000/api/images/api/projects/${projectId}/folders/${folderId}/images/upload/`;


  const formData = new FormData();
  formData.append('image', imageFile);
  if (name) formData.append('name', name);
  if (description) formData.append('description', description);

  return apiRequest(uploadUrl, {
    method: 'POST',
    body: formData
  });
};

// 获取文件夹下的图片列表
export const getFolderImages = async (
  projectId: number,
  folderId: number
): Promise<Response> => {
  const imagesUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/images/api/projects/${projectId}/folders/${folderId}/images/`
    : `http://127.0.0.1:8000/api/images/api/projects/${projectId}/folders/${folderId}/images/`;

  console.log('正在获取文件夹图片列表:', imagesUrl);
  return apiRequest(imagesUrl, { method: 'GET' });
};

// 获取图片详情
export const getProjectImageDetail = async (
  projectId: number,
  folderId: number,
  imageId: number
): Promise<Response> => {
  const detailUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/images/api/projects/${projectId}/folders/${folderId}/images/${imageId}/detail/`
    : `http://127.0.0.1:8000/api/images/api/projects/${projectId}/folders/${folderId}/images/${imageId}/detail/`;

  console.log('正在获取图片详情:', detailUrl);
  return apiRequest(detailUrl, { method: 'GET' });
};

// 更新项目图片信息
export const updateProjectImage = async (
  projectId: number,
  folderId: number,
  imageId: number,
  imageData: {
    name?: string;
    description?: string;
    sort_order?: number;
  }
): Promise<Response> => {
  const updateUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/images/api/projects/${projectId}/folders/${folderId}/images/${imageId}/`
    : `http://127.0.0.1:8000/api/images/api/projects/${projectId}/folders/${folderId}/images/${imageId}/`;

  console.log('正在更新图片信息:', updateUrl);
  return apiRequest(updateUrl, {
    method: 'PUT',
    body: JSON.stringify(imageData)
  });
};

// 删除项目图片
export const deleteProjectImage = async (
  projectId: number,
  folderId: number,
  imageId: number
): Promise<Response> => {
  const deleteUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/images/api/projects/${projectId}/folders/${folderId}/images/${imageId}/`
    : `http://127.0.0.1:8000/api/images/api/projects/${projectId}/folders/${folderId}/images/${imageId}/`;

  console.log('正在删除图片:', deleteUrl);
  return apiRequest(deleteUrl, { method: 'DELETE' });
};

// 上传视频到文件夹
export const uploadProjectVideo = async (
  projectId: number,
  folderId: number | null, // 允许 null 表示根目录上传
  videoFile: File,
  name?: string,
  description?: string
): Promise<Response> => {
  // 根据是否有 folderId 决定使用哪个接口
  const uploadUrl = folderId
    ? process.env.NEXT_PUBLIC_API_BASE_URL
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/images/api/projects/${projectId}/folders/${folderId}/videos/upload/`
      : `http://127.0.0.1:8000/api/images/api/projects/${projectId}/folders/${folderId}/videos/upload/`
    : process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/images/api/projects/${projectId}/videos/upload/`
    : `http://127.0.0.1:8000/api/images/api/projects/${projectId}/videos/upload/`;

  console.log(
    '正在上传视频:',
    uploadUrl,
    folderId ? `to folder ${folderId}` : 'to root'
  );

  const formData = new FormData();
  formData.append('video', videoFile);
  if (name) formData.append('name', name);
  if (description) formData.append('description', description);

  return apiRequest(uploadUrl, {
    method: 'POST',
    body: formData
  });
};

// 获取文件夹下的视频列表
export const getFolderVideos = async (
  projectId: number,
  folderId: number
): Promise<Response> => {
  const videosUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/images/api/projects/${projectId}/folders/${folderId}/videos/`
    : `http://127.0.0.1:8000/api/images/api/projects/${projectId}/folders/${folderId}/videos/`;

  console.log('正在获取文件夹视频列表:', videosUrl);
  return apiRequest(videosUrl, { method: 'GET' });
};

// 更新项目视频信息
export const updateProjectVideo = async (
  projectId: number,
  folderId: number,
  videoId: number,
  videoData: {
    name?: string;
    description?: string;
    sort_order?: number;
  }
): Promise<Response> => {
  const updateUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/images/api/projects/${projectId}/folders/${folderId}/videos/${videoId}/`
    : `http://127.0.0.1:8000/api/images/api/projects/${projectId}/folders/${folderId}/videos/${videoId}/`;

  console.log('正在更新视频信息:', updateUrl);
  return apiRequest(updateUrl, {
    method: 'PUT',
    body: JSON.stringify(videoData)
  });
};

// 删除视频
export const deleteProjectVideo = async (
  projectId: number,
  folderId: number,
  videoId: number
): Promise<Response> => {
  const deleteUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/images/api/projects/${projectId}/folders/${folderId}/videos/${videoId}/`
    : `http://127.0.0.1:8000/api/images/api/projects/${projectId}/folders/${folderId}/videos/${videoId}/`;

  console.log('正在删除视频:', deleteUrl);
  return apiRequest(deleteUrl, { method: 'DELETE' });
};
