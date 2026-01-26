// Workspace 管理相关 API

import { api } from './index';
import { buildApiUrl } from '@/lib/config/api.config';

// Workspace 数据类型
export interface WorkspaceData {
  workspace_content: string; // base64 编码的 ZIP
  project_id: number;
  created_at: string;
  updated_at: string;
}

// Workspace 文档元数据类型
export interface WorkspaceDocument {
  id: number;
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  modified_at: string;
  children?: WorkspaceDocument[];
}

// ==================== Workspace API ====================

// 获取项目的 Workspace（整个 workspace 的 ZIP，base64 编码）
export const getProjectWorkspace = async (
  projectId: number
): Promise<WorkspaceData> => {
  const workspaceUrl = buildApiUrl(`/api/projects/${projectId}/workspace`);
  console.log('正在获取项目 Workspace:', workspaceUrl);
  return api.get<WorkspaceData>(workspaceUrl);
};

// 保存项目的 Workspace（整个 workspace 的 ZIP，base64 编码）
export const saveProjectWorkspace = async (
  projectId: number,
  workspaceContent: string // base64 编码的 ZIP
): Promise<{ success: boolean; message?: string }> => {
  const workspaceUrl = buildApiUrl(`/api/projects/${projectId}/workspace`);
  console.log('正在保存项目 Workspace:', workspaceUrl);
  return api.put<{ success: boolean; message?: string }>(workspaceUrl, {
    workspace_content: workspaceContent
  });
};

// 从 Workspace 获取文档列表（从 workspace ZIP 中提取文档元数据）
export const getWorkspaceDocuments = async (
  projectId: number
): Promise<WorkspaceDocument[]> => {
  const documentsUrl = buildApiUrl(`/api/projects/${projectId}/workspace/documents`);
  console.log('正在获取 Workspace 文档列表:', documentsUrl);
  return api.get<WorkspaceDocument[]>(documentsUrl);
};
