// 文档管理相关 API

import { api, apiRequest } from './index';
import { getAccessToken } from '@/lib/utils/token';
import { buildApiUrl } from '@/lib/config/api.config';

// 文档节点类型
export interface DocumentNode {
  id: number;
  name: string;
  type: 'document' | 'folder';
  children?: DocumentNode[];
  parent_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

// 文档详情类型
export interface DocumentDetail {
  id: number;
  name: string;
  type: 'document';
  content?: string;
  snapshot?: string;
  assets?: Array<{
    blobId: string;
    ext: string;
    url: string;
  }>;
  folder_id?: number | null;
  created_at: string;
  updated_at: string;
}

// 资源信息类型
export interface AssetInfo {
  blobId: string;
  ext: string;
  url: string;
  size: number;
  uploaded_at: string;
}

// ==================== 文档管理API ====================

// 获取文档树
export const getDocumentTree = async (projectId: number): Promise<DocumentNode[]> => {
  const treeUrl = buildApiUrl(`/api/projects/${projectId}/documents/tree`);
  console.log('正在获取文档树:', treeUrl);
  return api.get<DocumentNode[]>(treeUrl);
};

// 创建文档
export const createDocument = async (
  projectId: number,
  documentData: {
    name: string;
    folder_id?: number | null;
    content?: string;
  }
): Promise<DocumentDetail> => {
  const createUrl = buildApiUrl(`/api/projects/${projectId}/documents`);
  console.log('正在创建文档:', createUrl);
  return api.post<DocumentDetail>(createUrl, documentData);
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
): Promise<DocumentDetail> => {
  const updateUrl = buildApiUrl(`/api/projects/${projectId}/documents/${documentId}`);

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

    // 使用 apiRequest 发送 FormData，返回原始Response
    return apiRequest(updateUrl, {
      method: 'PUT',
      body: formData,
      returnRawResponse: true
    }).then(response => {
      if (!response.ok) {
        throw new Error(`更新文档失败: ${response.status} ${response.statusText}`);
      }
      return response.json() as Promise<DocumentDetail>;
    });
  } else {
    // 如果没有资源文件，使用 JSON 格式（向后兼容）
    return api.put<DocumentDetail>(updateUrl, {
      name: documentData.name,
      content: documentData.snapshot // 向后兼容：如果没有 snapshot，使用 content
    });
  }
};

// 删除文档
export const deleteDocument = async (
  projectId: number,
  documentId: number
): Promise<{ success: boolean; message?: string }> => {
  const deleteUrl = buildApiUrl(`/api/projects/${projectId}/documents/${documentId}`);
  console.log('正在删除文档:', deleteUrl);
  return api.delete<{ success: boolean; message?: string }>(deleteUrl);
};

// 获取文档详情（新架构：返回 snapshot JSON 和资源列表）
export const getDocumentDetail = async (
  projectId: number,
  documentId: number
): Promise<DocumentDetail> => {
  const detailUrl = buildApiUrl(`/api/projects/${projectId}/documents/${documentId}`);
  console.log('正在获取文档详情:', detailUrl);
  return api.get<DocumentDetail>(detailUrl);
};

// 获取资源文件
export const getAssetFile = async (
  projectId: number,
  blobId: string,
  ext: string
): Promise<Response> => {
  const assetUrl = buildApiUrl(`/api/projects/${projectId}/assets/${blobId}.${ext}`);
  console.log('正在获取资源文件:', assetUrl);
  // 使用 apiRequest 获取原始Response，用于文件下载
  return apiRequest(assetUrl, {
    method: 'GET',
    returnRawResponse: true
  });
};

// 批量获取资源信息（可选）
export const getAssetsBatch = async (
  projectId: number,
  blobIds: string[]
): Promise<AssetInfo[]> => {
  const batchUrl = buildApiUrl(`/api/projects/${projectId}/assets/batch`);
  console.log('正在批量获取资源信息:', batchUrl, { count: blobIds.length });
  return api.post<AssetInfo[]>(batchUrl, { blobIds });
};

// 创建文档文件夹
export const createDocumentFolder = async (
  projectId: number,
  folderData: {
    name: string;
    parent?: number | null;
  }
): Promise<DocumentNode> => {
  const createUrl = buildApiUrl(`/api/projects/${projectId}/documents/folders`);

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

  return api.post<DocumentNode>(createUrl, requestData);
};

// 更新文档文件夹
export const updateDocumentFolder = async (
  projectId: number,
  folderId: number,
  folderData: {
    name?: string;
    parent?: number | null;
  }
): Promise<DocumentNode> => {
  const updateUrl = buildApiUrl(`/api/projects/${projectId}/documents/folders/${folderId}`);
  console.log('正在更新文档文件夹:', updateUrl);
  return api.put<DocumentNode>(updateUrl, folderData);
};

// 删除文档文件夹
export const deleteDocumentFolder = async (
  projectId: number,
  folderId: number
): Promise<{ success: boolean; message?: string }> => {
  const deleteUrl = buildApiUrl(`/api/projects/${projectId}/documents/folders/${folderId}`);
  console.log('正在删除文档文件夹:', deleteUrl);
  return api.delete<{ success: boolean; message?: string }>(deleteUrl);
};

// 重命名节点
export const renameDocumentNode = async (
  projectId: number,
  nodeId: number,
  nodeData: {
    name: string;
    type: 'document' | 'folder';
  }
): Promise<DocumentNode> => {
  const renameUrl = buildApiUrl(`/api/projects/${projectId}/documents/nodes/${nodeId}/rename`);
  console.log('正在重命名节点:', renameUrl);
  return api.patch<DocumentNode>(renameUrl, nodeData);
};

// 移动节点
export const moveDocumentNode = async (
  projectId: number,
  nodeId: number,
  nodeData: {
    target_folder_id?: number | null;
    type: 'document' | 'folder';
  }
): Promise<DocumentNode> => {
  const moveUrl = buildApiUrl(`/api/projects/${projectId}/documents/nodes/${nodeId}/move`);
  console.log('正在移动节点:', moveUrl);
  return api.patch<DocumentNode>(moveUrl, nodeData);
};
