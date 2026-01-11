// 项目管理相关的 mock 逻辑
import { ProjectListResponse, Project } from '@/lib/api/shared/types';
import { ApiSuccessResponse } from '@/lib/api/shared/types';

// 生成模拟项目数据
const generateMockProjects = (count: number = 10): any[] => {
  const projects: any[] = [];
  
  for (let i = 1; i <= count; i++) {
    projects.push({
      id: i,
      name: i === 1 ? 'new project' : `项目 ${i}`,
      description: i === 1 ? 'description  123' : `这是项目 ${i} 的描述信息`,
      created_by: 'admin',
      created_by_email: '455266883@qq.com',
      created_at: new Date(Date.now() - Math.floor(Math.random() * 31536000000)).toISOString(),
      updated_at: new Date(Date.now() - Math.floor(Math.random() * 604800000)).toISOString(),
      is_public: false,
      settings: {},
      layer_count: Math.floor(Math.random() * 22), // 0-21
      snapshot_count: 0,
      last_snapshot: null
    });
  }
  
  return projects;
};

export const handleProjectsMock = (url: string, options: RequestInit): Promise<Response> | null => {
  // 检查是否匹配项目列表 API
  if (url.includes('/api/projects/list/') && options.method === 'GET') {
    // 解析查询参数
    const urlObj = new URL(url);
    const page = parseInt(urlObj.searchParams.get('page') || '1');
    const pageSize = parseInt(urlObj.searchParams.get('pageSize') || '20');
    
    // 生成模拟数据 - 只生成13个项目以匹配示例
    const mockProjects = generateMockProjects(13);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProjects = mockProjects.slice(startIndex, endIndex);
    
    // 确定 next 和 previous
    const next = page * pageSize < mockProjects.length ? `http://localhost:3000/api2/api/projects/list/?page=${page + 1}&pageSize=${pageSize}` : null;
    const previous = page > 1 ? `http://localhost:3000/api2/api/projects/list/?page=${page - 1}&pageSize=${pageSize}` : null;
    
    // 构造与实际API响应格式相同的模拟数据
    const mockData = {
      count: mockProjects.length,
      next,
      previous,
      results: paginatedProjects
    };
    
    return Promise.resolve(new Response(JSON.stringify(mockData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }));
  }
  
  // 检查是否匹配项目创建 API
  if (url.includes('/api/projects/create/') && options.method === 'POST') {
    const mockData: ApiSuccessResponse<Project> = {
      success: true,
      data: {
        id: 101,
        name: '新创建的项目',
        description: '这是一个新创建的项目',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      message: '项目创建成功'
    };
    
    return Promise.resolve(new Response(JSON.stringify(mockData), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    }));
  }
  
  // 检查是否匹配项目删除 API
  if (url.includes('/api/projects/delete/') && options.method === 'DELETE') {
    const mockData: ApiSuccessResponse<null> = {
      success: true,
      data: null,
      message: '项目删除成功'
    };
    
    return Promise.resolve(new Response(JSON.stringify(mockData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }));
  }
  
  // 检查是否匹配项目详情 API
  const projectDetailMatch = url.match(/\/api\/projects\/(\d+)\/?/);
  if (projectDetailMatch && options.method === 'GET') {
    const projectId = parseInt(projectDetailMatch[1]);
    
    const mockData: ApiSuccessResponse<Project> = {
      success: true,
      data: {
        id: projectId,
        name: `项目 ${projectId}`,
        description: `这是项目 ${projectId} 的详细信息`,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 31536000000)).toISOString(),
        updated_at: new Date(Date.now() - Math.floor(Math.random() * 604800000)).toISOString()
      },
      message: '获取项目详情成功'
    };
    
    return Promise.resolve(new Response(JSON.stringify(mockData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }));
  }
  
  // 检查是否匹配项目更新 API
  if (projectDetailMatch && options.method === 'PUT') {
    const projectId = parseInt(projectDetailMatch[1]);
    
    const mockData: ApiSuccessResponse<Project> = {
      success: true,
      data: {
        id: projectId,
        name: `更新后的项目 ${projectId}`,
        description: `这是更新后的项目 ${projectId} 信息`,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 31536000000)).toISOString(),
        updated_at: new Date().toISOString()
      },
      message: '项目更新成功'
    };
    
    return Promise.resolve(new Response(JSON.stringify(mockData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }));
  }
  
  // 检查是否匹配项目保存 API
  const projectSaveMatch = url.match(/\/api\/projects\/(\d+)\/workspace\/?/);
  if (projectSaveMatch && options.method === 'PUT') {
    const projectId = parseInt(projectSaveMatch[1]);
    
    const mockData: ApiSuccessResponse<Project> = {
      success: true,
      data: {
        id: projectId,
        name: `已保存的项目 ${projectId}`,
        description: `这是已保存的项目 ${projectId} 信息`,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 31536000000)).toISOString(),
        updated_at: new Date().toISOString()
      },
      message: '项目保存成功'
    };
    
    return Promise.resolve(new Response(JSON.stringify(mockData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }));
  }
  
  // 如果不匹配任何项目管理 API，则返回 null
  return null;
};