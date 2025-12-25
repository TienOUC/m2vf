// 项目管理相关 API

import { apiRequest } from './client';

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
    params.append('page_size', options.pageSize.toString());
  }

  const queryString = params.toString();
  const projectsUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/list/${
        queryString ? '?' + queryString : ''
      }`
    : `http://127.0.0.1:8000/api/projects/list/${
        queryString ? '?' + queryString : ''
      }`;

  return apiRequest(projectsUrl, { method: 'GET' });
};

// 获取单个项目详情
export const getProjectDetail = async (
  projectId: string | number
): Promise<Response> => {
  const projectDetailUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/`
    : `http://127.0.0.1:8000/api/projects/${projectId}/`;

  return apiRequest(projectDetailUrl, { method: 'GET' });
};

// 创建新项目
export const createProject = async (projectData: {
  name: string;
  description: string;
}): Promise<Response> => {
  const createUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/create/`
    : 'http://127.0.0.1:8000/api/projects/create/';

  console.log('正在创建新项目:', createUrl);

  // 获取存储的 access_token
  const accessToken = localStorage.getItem('access_token');

  if (!accessToken) {
    throw new Error('未找到访问令牌');
  }

  console.log('发送的项目数据:', {
    name: projectData.name,
    description: projectData.description
  });

  const response = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: projectData.name,
      description: projectData.description
    })
  });

  console.log('创建项目响应状态:', response.status);
  console.log(
    '创建项目响应头:',
    Object.fromEntries(response.headers.entries())
  );

  // 如果是成功响应，记录响应内容
  if (response.ok) {
    const responseText = await response.text();
    console.log('创建项目响应内容:', responseText);

    // 尝试解析JSON
    try {
      const jsonData = JSON.parse(responseText);
      console.log('解析后的JSON数据:', jsonData);
    } catch (e) {
      console.error('响应不是有效的JSON:', e);
    }

    // 重新创建响应对象，因为我们已经读取了内容
    return new Response(responseText, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }

  return response;
};

// 更新项目
export const updateProject = async (
  projectId: string,
  projectData: any
): Promise<Response> => {
  const updateUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/`
    : `http://127.0.0.1:8000/api/projects/${projectId}/`;

  console.log('正在更新项目:', updateUrl);
  return apiRequest(updateUrl, {
    method: 'PUT',
    body: JSON.stringify(projectData)
  });
};

// 删除项目
export const deleteProject = async (projectName: string): Promise<Response> => {
  const deleteUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/delete/`
    : 'http://127.0.0.1:8000/api/projects/delete/';

  console.log('正在删除项目:', deleteUrl);

  // 获取存储的 access_token
  const accessToken = localStorage.getItem('access_token');

  if (!accessToken) {
    throw new Error('未找到访问令牌');
  }

  console.log('删除的项目名称:', projectName);

  const response = await fetch(deleteUrl, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: projectName
    })
  });

  console.log('删除项目响应状态:', response.status);

  return response;
};

// 保存项目（专门用于保存项目的 API 请求）
export const saveProject = async (projectData: any): Promise<Response> => {
  const saveUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/save-project/`
    : 'http://127.0.0.1:8000/api/save-project/';

  return apiRequest(saveUrl, {
    method: 'POST',
    body: JSON.stringify(projectData)
  });
};
