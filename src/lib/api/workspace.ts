// Workspace 管理相关 API

import { apiRequest } from './client';

// ==================== Workspace API ====================

// 获取项目的 Workspace（整个 workspace 的 ZIP，base64 编码）
export const getProjectWorkspace = async (
  projectId: number
): Promise<Response> => {
  const workspaceUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/workspace`
    : `http://127.0.0.1:8000/api/projects/${projectId}/workspace`;

  console.log('正在获取项目 Workspace:', workspaceUrl);
  return apiRequest(workspaceUrl, { method: 'GET' });
};

// 保存项目的 Workspace（整个 workspace 的 ZIP，base64 编码）
export const saveProjectWorkspace = async (
  projectId: number,
  workspaceContent: string // base64 编码的 ZIP
): Promise<Response> => {
  const workspaceUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/workspace`
    : `http://127.0.0.1:8000/api/projects/${projectId}/workspace`;

  console.log('正在保存项目 Workspace:', workspaceUrl);
  return apiRequest(workspaceUrl, {
    method: 'PUT',
    body: JSON.stringify({
      workspace_content: workspaceContent
    })
  });
};

// 从 Workspace 获取文档列表（从 workspace ZIP 中提取文档元数据）
export const getWorkspaceDocuments = async (
  projectId: number
): Promise<Response> => {
  const documentsUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/workspace/documents`
    : `http://127.0.0.1:8000/api/projects/${projectId}/workspace/documents`;

  console.log('正在获取 Workspace 文档列表:', documentsUrl);
  return apiRequest(documentsUrl, { method: 'GET' });
};
