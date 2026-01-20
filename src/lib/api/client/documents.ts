// 文档管理相关 API

import { apiRequest } from './index';
import { getAccessToken } from '@/lib/utils/token';

// ==================== 文档管理API ====================

// 上传文档到文件夹
export const uploadProjectDocument = async (
  projectId: number,
  folderId: number | null, // 允许 null 表示根目录上传
  content: string, // 文档内容（HTML格式）
  name?: string,
  description?: string
): Promise<Response> => {
  // 根据是否有 folderId 决定使用哪个接口
  const uploadUrl = folderId
    ? process.env.NEXT_PUBLIC_API_BASE_URL
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/images/api/projects/${projectId}/folders/${folderId}/documents/upload/`
      : `http://127.0.0.1:8000/api/images/api/projects/${projectId}/folders/${folderId}/documents/upload/`
    : process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/images/api/projects/${projectId}/documents/upload/`
    : `http://127.0.0.1:8000/api/images/api/projects/${projectId}/documents/upload/`;

  console.log(
    '正在上传文档:',
    uploadUrl,
    folderId ? `to folder ${folderId}` : 'to root'
  );

  const formData = new FormData();
  formData.append('content', content);
  if (name) formData.append('name', name);
  if (description) formData.append('description', description);

  return apiRequest(uploadUrl, {
    method: 'POST',
    body: formData
  });
};

// 获取文档内容
export const getProjectDocument = async (
  projectId: number,
  folderId: number,
  documentId: number
): Promise<Response> => {
  const documentUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/images/api/projects/${projectId}/folders/${folderId}/documents/${documentId}/`
    : `http://127.0.0.1:8000/api/images/api/projects/${projectId}/folders/${folderId}/documents/${documentId}/`;

  console.log('正在获取文档内容:', documentUrl);
  return apiRequest(documentUrl, { method: 'GET' });
};

// 更新文档
export const updateProjectDocument = async (
  projectId: number,
  folderId: number,
  documentId: number,
  documentData: {
    content?: string;
    name?: string;
    description?: string;
  }
): Promise<Response> => {
  const updateUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/images/api/projects/${projectId}/folders/${folderId}/documents/${documentId}/`
    : `http://127.0.0.1:8000/api/images/api/projects/${projectId}/folders/${folderId}/documents/${documentId}/`;

  console.log('正在更新文档:', updateUrl);
  return apiRequest(updateUrl, {
    method: 'PUT',
    body: JSON.stringify(documentData)
  });
};

// 删除文档
export const deleteProjectDocument = async (
  projectId: number,
  folderId: number,
  documentId: number
): Promise<Response> => {
  const deleteUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/images/api/projects/${projectId}/folders/${folderId}/documents/${documentId}/`
    : `http://127.0.0.1:8000/api/images/api/projects/${projectId}/folders/${folderId}/documents/${documentId}/`;

  console.log('正在删除文档:', deleteUrl);
  return apiRequest(deleteUrl, { method: 'DELETE' });
};

// 获取文档树
export const getDocumentTree = async (projectId: number): Promise<Response> => {
  const treeUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/documents/tree`
    : `http://127.0.0.1:8000/api/projects/${projectId}/documents/tree`;

  console.log('正在获取文档树:', treeUrl);
  return apiRequest(treeUrl, { method: 'GET' });
};

// 创建文档
export const createDocument = async (
  projectId: number,
  documentData: {
    name: string;
    folder_id?: number | null;
    content?: string;
  }
): Promise<Response> => {
  const createUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/documents`
    : `http://127.0.0.1:8000/api/projects/${projectId}/documents`;

  console.log('正在创建文档:', createUrl);
  return apiRequest(createUrl, {
    method: 'POST',
    body: JSON.stringify(documentData)
  });
};

// 更新文档（新架构：支持 multipart/form-data，包含 snapshot JSON 和资源文件）
export const updateDocument = async (
  projectId: number,
  documentId: number,
  documentData: {
    name?: string;
    snapshot?: string; // snapshot.json 的内容（JSON 字符串）
    assets?: Array<{
      // 资源文件列表
      blobId: string;
      file: Blob | File;
      ext: string;
    }>;
  }
): Promise<Response> => {
  const updateUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/documents/${documentId}`
    : `http://127.0.0.1:8000/api/projects/${projectId}/documents/${documentId}`;

  console.log('正在更新文档:', updateUrl, {
    hasSnapshot: !!documentData.snapshot,
    assetsCount: documentData.assets?.length || 0
  });

  // 如果包含资源文件，使用 multipart/form-data
  if (documentData.assets && documentData.assets.length > 0) {
    const formData = new FormData();

    if (documentData.name) {
      formData.append('name', documentData.name);
    }

    if (documentData.snapshot) {
      formData.append('snapshot', documentData.snapshot);
    }

    // 添加资源文件
    documentData.assets.forEach((asset) => {
      formData.append('assets', asset.file, `${asset.blobId}.${asset.ext}`);
    });

    // 使用 fetch 直接发送 FormData（不通过 apiRequest，因为需要设置正确的 Content-Type）
    const token = getAccessToken();
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(updateUrl, {
      method: 'PUT',
      headers,
      body: formData
    });
  } else {
    // 如果没有资源文件，使用 JSON 格式（向后兼容）
    return apiRequest(updateUrl, {
      method: 'PUT',
      body: JSON.stringify({
        name: documentData.name,
        content: documentData.snapshot // 向后兼容：如果没有 snapshot，使用 content
      })
    });
  }
};

// 删除文档
export const deleteDocument = async (
  projectId: number,
  documentId: number
): Promise<Response> => {
  const deleteUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/documents/${documentId}`
    : `http://127.0.0.1:8000/api/projects/${projectId}/documents/${documentId}`;

  console.log('正在删除文档:', deleteUrl);
  return apiRequest(deleteUrl, { method: 'DELETE' });
};

// 获取文档详情（新架构：返回 snapshot JSON 和资源列表）
export const getDocumentDetail = async (
  projectId: number,
  documentId: number
): Promise<Response> => {
  const detailUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/documents/${documentId}`
    : `http://127.0.0.1:8000/api/projects/${projectId}/documents/${documentId}`;

  console.log('正在获取文档详情:', detailUrl);
  return apiRequest(detailUrl, { method: 'GET' });
};

// 获取资源文件
export const getAssetFile = async (
  projectId: number,
  blobId: string,
  ext: string
): Promise<Response> => {
  const assetUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/assets/${blobId}.${ext}`
    : `http://127.0.0.1:8000/api/projects/${projectId}/assets/${blobId}.${ext}`;

  console.log('正在获取资源文件:', assetUrl);
  const token = getAccessToken();
  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(assetUrl, {
    method: 'GET',
    headers
  });
};

// 批量获取资源信息（可选）
export const getAssetsBatch = async (
  projectId: number,
  blobIds: string[]
): Promise<Response> => {
  const batchUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/assets/batch`
    : `http://127.0.0.1:8000/api/projects/${projectId}/assets/batch`;

  console.log('正在批量获取资源信息:', batchUrl, { count: blobIds.length });
  return apiRequest(batchUrl, {
    method: 'POST',
    body: JSON.stringify({ blobIds })
  });
};

// 创建文档文件夹
export const createDocumentFolder = async (
  projectId: number,
  folderData: {
    name: string;
    parent?: number | null;
  }
): Promise<Response> => {
  const createUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/documents/folders`
    : `http://127.0.0.1:8000/api/projects/${projectId}/documents/folders`;

  // 构建请求数据
  // 与创建文档的逻辑保持一致：即使 parent 为 null，也明确传递 null
  // 这样后端可以明确知道是要创建在根级别，而不是依赖默认行为
  const requestData: { name: string; parent?: number | null } = {
    name: folderData.name
  };

  // 只有当 parent 不是 undefined 时才添加 parent 字段
  // 如果 parent 是 null，明确传递 null（表示根级别）
  // 如果 parent 是数字，传递数字（表示父文件夹ID）
  if (folderData.parent !== undefined) {
    requestData.parent = folderData.parent;
  }

  console.log('[API] 正在创建文档文件夹:', createUrl);
  console.log('[API] 请求数据:', JSON.stringify(requestData, null, 2));
  console.log(
    '[API] 原始 parent 值:',
    folderData.parent,
    '类型:',
    typeof folderData.parent
  );

  return apiRequest(createUrl, {
    method: 'POST',
    body: JSON.stringify(requestData)
  });
};

// 更新文档文件夹
export const updateDocumentFolder = async (
  projectId: number,
  folderId: number,
  folderData: {
    name?: string;
    parent?: number | null;
  }
): Promise<Response> => {
  const updateUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/documents/folders/${folderId}`
    : `http://127.0.0.1:8000/api/projects/${projectId}/documents/folders/${folderId}`;

  console.log('正在更新文档文件夹:', updateUrl);
  return apiRequest(updateUrl, {
    method: 'PUT',
    body: JSON.stringify(folderData)
  });
};

// 删除文档文件夹
export const deleteDocumentFolder = async (
  projectId: number,
  folderId: number
): Promise<Response> => {
  const deleteUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/documents/folders/${folderId}`
    : `http://127.0.0.1:8000/api/projects/${projectId}/documents/folders/${folderId}`;

  console.log('正在删除文档文件夹:', deleteUrl);
  return apiRequest(deleteUrl, { method: 'DELETE' });
};

// 重命名节点
export const renameDocumentNode = async (
  projectId: number,
  nodeId: number,
  nodeData: {
    name: string;
    type: 'document' | 'folder';
  }
): Promise<Response> => {
  const renameUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/documents/nodes/${nodeId}/rename`
    : `http://127.0.0.1:8000/api/projects/${projectId}/documents/nodes/${nodeId}/rename`;

  console.log('正在重命名节点:', renameUrl);
  return apiRequest(renameUrl, {
    method: 'PATCH',
    body: JSON.stringify(nodeData)
  });
};

// 移动节点
export const moveDocumentNode = async (
  projectId: number,
  nodeId: number,
  nodeData: {
    target_folder_id?: number | null;
    type: 'document' | 'folder';
  }
): Promise<Response> => {
  const moveUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/documents/nodes/${nodeId}/move`
    : `http://127.0.0.1:8000/api/projects/${projectId}/documents/nodes/${nodeId}/move`;

  console.log('正在移动节点:', moveUrl);
  return apiRequest(moveUrl, {
    method: 'PATCH',
    body: JSON.stringify(nodeData)
  });
};
