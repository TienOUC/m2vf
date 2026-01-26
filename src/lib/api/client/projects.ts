// 项目管理相关 API

import { api } from './index';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/config/api.config';
import type {
  ProjectCreateRequest,
  ProjectUpdateRequest,
  Project,
  ProjectListResponse
} from '../shared/types';

// 获取项目列表（支持分页）
export const getProjects = async (options?: {
  page?: number;
  page_size?: number;
}): Promise<{
  projects: Project[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}> => {
  const params = new URLSearchParams();

  if (options?.page) {
    params.append('page', options.page.toString());
  }

  if (options?.page_size) {
    params.append('page_size', options.page_size.toString());
  }

  const queryString = params.toString();
  const projectsUrl = `${buildApiUrl(API_ENDPOINTS.PROJECTS.LIST)}${queryString ? '?' + queryString : ''}`;

  // 调用API并处理响应
  // api.get会自动处理包含code、data、msg字段的响应，返回data字段
  const response = await api.get<ProjectListResponse>(projectsUrl, { 
    cache: 'no-cache'
  });

  // 计算总页数
  const totalPages = Math.ceil(response.total / (response.page_size || 20));

  // 返回转换后的数据格式，适配store层
  return {
    projects: response.list,
    pagination: {
      page: response.page,
      pageSize: response.page_size,
      total: response.total,
      totalPages: totalPages
    }
  };
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
  const updateUrl = buildApiUrl(API_ENDPOINTS.PROJECTS.UPDATE(projectId));
  return api.put<Project>(updateUrl, projectData);
};

// 删除项目
export const deleteProject = async (projectId: string | number): Promise<{ success: boolean }> => {
  const deleteUrl = buildApiUrl(API_ENDPOINTS.PROJECTS.DELETE(projectId));
  return api.delete<{ success: boolean }>(deleteUrl);
};
