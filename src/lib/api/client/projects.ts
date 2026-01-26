// 项目管理相关 API

import { api } from './index';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/config/api.config';
import type {
  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectDeleteRequest,
  Project,
  ProjectListResponse
} from '../shared/types';

// 获取项目列表（支持分页）
export const getProjects = async (options?: {
  page?: number;
  pageSize?: number;
}): Promise<ProjectListResponse> => {
  const params = new URLSearchParams();

  if (options?.page) {
    params.append('page', options.page.toString());
  }

  if (options?.pageSize) {
    params.append('pageSize', options.pageSize.toString());
  }

  const queryString = params.toString();
  const projectsUrl = `${buildApiUrl(API_ENDPOINTS.PROJECTS.LIST)}${queryString ? '?' + queryString : ''}`;

  return api.get<ProjectListResponse>(projectsUrl, { 
    cache: 'no-cache'
  });
};

// 获取单个项目详情
export const getProjectDetail = async (
  projectId: string | number
): Promise<Project> => {
  const projectDetailUrl = buildApiUrl(API_ENDPOINTS.PROJECTS.DETAIL(projectId));

  return api.get<Project>(projectDetailUrl);
};

// 创建新项目
export const createProject = async (projectData: ProjectCreateRequest): Promise<Project> => {
  const createUrl = buildApiUrl(API_ENDPOINTS.PROJECTS.CREATE);

  return api.post<Project>(createUrl, projectData);
};

// 更新项目
export const updateProject = async (
  projectId: string | number,
  projectData: ProjectUpdateRequest
): Promise<Project> => {
  const updateUrl = buildApiUrl(API_ENDPOINTS.PROJECTS.DETAIL(projectId));

  return api.put<Project>(updateUrl, projectData);
};

// 删除项目
export const deleteProject = async (projectName: string): Promise<{ success: boolean }> => {
  const deleteUrl = buildApiUrl(API_ENDPOINTS.PROJECTS.DELETE);

  return api.delete<{ success: boolean }>(deleteUrl, {
    body: { name: projectName }
  });
};

// 保存项目（专门用于保存项目的 API 请求）
export const saveProject = async (projectId: string | number, projectData: Record<string, unknown>): Promise<{ success: boolean }> => {
  const saveUrl = buildApiUrl(API_ENDPOINTS.PROJECTS.SAVE(projectId));

  return api.put<{ success: boolean }>(saveUrl, projectData);
};
