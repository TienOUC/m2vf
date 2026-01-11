// 项目管理相关 API

import { apiRequest } from './index';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/config/api.config';
import type {
  Project,
  ProjectListResponse,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectDeleteRequest
} from '../shared/types';

// 获取项目列表（支持分页）
export const getProjects = async (options?: {
  page?: number;
  pageSize?: number;
}): Promise<Response> => {
  const params = new URLSearchParams();

  if (options?.page) {
    params.append('page', options.page.toString());
  }

  if (options?.pageSize) {
    params.append('pageSize', options.pageSize.toString());
  }

  const queryString = params.toString();
  const projectsUrl = `${buildApiUrl(API_ENDPOINTS.PROJECTS.LIST)}${queryString ? '?' + queryString : ''}`;

  return apiRequest(projectsUrl, { method: 'GET' });
};

// 获取单个项目详情
export const getProjectDetail = async (
  projectId: string | number
): Promise<Response> => {
  const projectDetailUrl = buildApiUrl(API_ENDPOINTS.PROJECTS.DETAIL(projectId));

  return apiRequest(projectDetailUrl, { method: 'GET' });
};

// 创建新项目
export const createProject = async (projectData: ProjectCreateRequest): Promise<Response> => {
  const createUrl = buildApiUrl(API_ENDPOINTS.PROJECTS.CREATE);

  return apiRequest(createUrl, {
    method: 'POST',
    body: JSON.stringify(projectData)
  });
};

// 更新项目
export const updateProject = async (
  projectId: string | number,
  projectData: ProjectUpdateRequest
): Promise<Response> => {
  const updateUrl = buildApiUrl(API_ENDPOINTS.PROJECTS.DETAIL(projectId));

  return apiRequest(updateUrl, {
    method: 'PUT',
    body: JSON.stringify(projectData)
  });
};

// 删除项目
export const deleteProject = async (projectName: string): Promise<Response> => {
  const deleteUrl = buildApiUrl(API_ENDPOINTS.PROJECTS.DELETE);

  return apiRequest(deleteUrl, {
    method: 'DELETE',
    body: JSON.stringify({ name: projectName } as ProjectDeleteRequest)
  });
};

// 保存项目（专门用于保存项目的 API 请求）
export const saveProject = async (projectId: string | number, projectData: Record<string, unknown>): Promise<Response> => {
  const saveUrl = buildApiUrl(API_ENDPOINTS.PROJECTS.SAVE(projectId));

  return apiRequest(saveUrl, {
    method: 'PUT', // 使用与 WORKSPACE.SAVE 一致的方法
    body: JSON.stringify(projectData)
  });
};
