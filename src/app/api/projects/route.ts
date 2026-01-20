import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/config/api.config';
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectDeleteRequest,
  ProjectListResponse
} from '@/lib/api/shared/types';

// 创建标准化的错误响应
const createErrorResponse = (message: string, status: number, code: string = 'INTERNAL_ERROR', details?: any): NextResponse<ApiErrorResponse> => {
  return NextResponse.json(
    { 
      success: false, 
      error: { code, message, details } 
    },
    { status }
  );
};

// 创建标准化的成功响应
const createSuccessResponse = <T>(data: T, message?: string): NextResponse<ApiSuccessResponse<T>> => {
  return NextResponse.json(
    { success: true, data, message },
    { status: 200 }
  );
};

// 从请求头获取认证信息
const getAuthHeader = (request: NextRequest): string | undefined => {
  return request.headers.get('Authorization') ?? undefined;
};

// 通用API请求处理函数
const fetchApi = async (url: string, options: RequestInit) => {
  const response = await fetch(url, {
    ...options,
    // 设置缓存策略：不缓存POST/PUT/DELETE请求
    cache: options.method === 'GET' ? 'force-cache' : 'no-store',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API请求失败: ${response.status}`, { cause: errorData });
  }

  return response.json();
};

// 获取项目列表（GET请求）
export async function GET(request: NextRequest) {
  try {
    // 从查询参数获取分页信息
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '20';

    // 构建API请求URL
    const apiUrl = `${buildApiUrl(API_ENDPOINTS.PROJECTS.LIST)}?page=${page}&pageSize=${pageSize}`;

    // 获取请求头中的Authorization
    const authHeader = getAuthHeader(request);

    // 发起API请求到后端服务
    const data = await fetchApi(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      // 设置缓存策略：缓存1分钟
      next: {
        revalidate: 60,
      },
    });

    // 返回处理后的数据
    return createSuccessResponse(data, '获取项目列表成功');
  } catch (error: any) {
    console.error('获取项目列表失败:', error);
    return createErrorResponse(
      error.message || '获取项目列表失败',
      500,
      'PROJECT_LIST_ERROR',
      error.cause
    );
  }
}

// 创建新项目（POST请求）
export async function POST(request: NextRequest) {
  try {
    // 获取请求头中的Authorization
    const authHeader = getAuthHeader(request);

    // 获取请求体
    const requestBody = await request.json();

    // 构建API请求URL
    const apiUrl = buildApiUrl(API_ENDPOINTS.PROJECTS.CREATE);

    // 发起API请求到后端服务
    const data = await fetchApi(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify(requestBody),
    });

    // 返回处理后的数据
    return createSuccessResponse(data, '项目创建成功');
  } catch (error: any) {
    console.error('创建项目失败:', error);
    return createErrorResponse(
      error.message || '创建项目失败',
      400,
      'PROJECT_CREATE_ERROR',
      error.cause
    );
  }
}

// 更新项目（PUT请求）
export async function PUT(request: NextRequest) {
  try {
    // 获取请求头中的Authorization
    const authHeader = getAuthHeader(request);

    // 获取请求体
    const requestBody = await request.json();
    const { id, ...updateData } = requestBody;

    // 验证项目ID
    if (!id) {
      return createErrorResponse('项目ID不能为空', 400, 'INVALID_PROJECT_ID');
    }

    // 构建API请求URL
    const apiUrl = buildApiUrl(API_ENDPOINTS.PROJECTS.DETAIL(id));

    // 发起API请求到后端服务
    const data = await fetchApi(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify(updateData),
    });

    // 返回处理后的数据
    return createSuccessResponse(data, '项目更新成功');
  } catch (error: any) {
    console.error('更新项目失败:', error);
    return createErrorResponse(
      error.message || '更新项目失败',
      400,
      'PROJECT_UPDATE_ERROR',
      error.cause
    );
  }
}

// 删除项目（DELETE请求）
export async function DELETE(request: NextRequest) {
  try {
    // 获取请求头中的Authorization
    const authHeader = getAuthHeader(request);

    // 获取请求体
    const requestBody = await request.json();
    const { name } = requestBody;

    // 验证项目名称
    if (!name) {
      return createErrorResponse('项目名称不能为空', 400, 'INVALID_PROJECT_NAME');
    }

    // 构建API请求URL
    const apiUrl = buildApiUrl(API_ENDPOINTS.PROJECTS.DELETE);

    // 发起API请求到后端服务
    const data = await fetchApi(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify({ name }),
    });

    // 返回处理后的数据
    return createSuccessResponse(data, '项目删除成功');
  } catch (error: any) {
    console.error('删除项目失败:', error);
    return createErrorResponse(
      error.message || '删除项目失败',
      400,
      'PROJECT_DELETE_ERROR',
      error.cause
    );
  }
}
