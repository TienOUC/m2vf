// API 请求客户端 - 核心请求函数

import type { ApiRequestOptions, ApiSuccessResponse, ApiErrorResponse } from '../shared/types';
import {
  getAccessToken,
  refreshAccessToken,
  clearTokens
} from '@/lib/utils/token';
import { DEFAULT_CONFIG, ROUTES } from '@/lib/config/api.config';

// 增强的API请求选项接口
export interface EnhancedApiRequestOptions extends Omit<ApiRequestOptions, 'body'> {
  /**
   * 请求体，可以是任意类型，会根据需要自动转换为JSON字符串
   */
  body?: any;
  /**
   * 是否直接返回原始Response对象，默认false
   */
  returnRawResponse?: boolean;
  /**
   * AbortController实例，用于取消请求
   */
  abortController?: AbortController;
}

// 类型工具：根据returnRawResponse选项确定返回类型
type ApiRequestReturn<T, O extends EnhancedApiRequestOptions> = O['returnRawResponse'] extends true ? Response : T;

// API 工具函数，用于处理需要认证的请求
export function apiRequest<T = any, O extends EnhancedApiRequestOptions = EnhancedApiRequestOptions>(
  url: string,
  options: O = {} as O
): Promise<ApiRequestReturn<T, O>> {
  return (async () => {
    // 获取存储的 access_token
    const accessToken = getAccessToken();
    const { returnRawResponse = false, abortController, ...restOptions } = options;

    // 设置默认请求头
    const headers: Record<string, string> = {
      ...((restOptions.headers as Record<string, string>) || {})
    };

    // 处理请求体
    let body: BodyInit | null | undefined = restOptions.body;
    
    // 如果body是对象且不是FormData，自动转换为JSON字符串
    if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob) && !(body instanceof URLSearchParams)) {
      body = JSON.stringify(body);
      // 只有当没有设置 Content-Type 时才设置默认值
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    }

    // 如果有 access_token，添加到请求头
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    // 开发环境下的 Mock 逻辑（仅在客户端执行）
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      try {
        // 使用静态导入而不是动态导入，避免路径问题
        const { shouldUseMock, executeMock } = await import('@/lib/api/client/mock');
        if (shouldUseMock(url, restOptions)) {
          const mockResponse = await executeMock(url, restOptions);
          if (returnRawResponse) {
            return mockResponse as ApiRequestReturn<T, O>;
          }
          return (await mockResponse.json()) as ApiRequestReturn<T, O>;
        }
      } catch (error) {
        console.error('Mock handler import error:', error);
        // Mock导入失败时，继续使用真实API，而不是中断整个流程
      }
    }

    // 设置超时时间（默认使用配置文件中的值）
    const timeout = restOptions.timeout || DEFAULT_CONFIG.REQUEST_TIMEOUT;
    const controller = abortController || new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    // 添加缓存策略和重验证机制
    const fetchOptions: RequestInit = {
      ...restOptions,
      headers,
      body,
      signal: controller.signal,
      // 默认使用缓存策略
      cache: restOptions.cache || 'force-cache',
      // 添加Next.js特定的fetch选项
      next: restOptions.next || {
        revalidate: 60, // 默认缓存1分钟
      },
    };

    // 发起请求
    let response: Response;
    try {
      response = await fetch(url, fetchOptions);
    } catch (error: any) {
      clearTimeout(timeoutId);
      // 如果是超时错误
      if (error.name === 'AbortError') {
        throw new Error(`请求超时（${timeout / 1000} 秒）`);
      }
      throw error;
    }

    clearTimeout(timeoutId);

    // 如果返回 401 未授权，尝试刷新token
    if (response.status === 401 && accessToken) {
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        // 使用新token重试请求，也需要应用超时
        const retryController = abortController || new AbortController();
        const retryTimeoutId = setTimeout(() => {
          retryController.abort();
        }, timeout);

        try {
          headers.Authorization = `Bearer ${newAccessToken}`;
          response = await fetch(url, {
            ...restOptions,
            headers,
            body,
            signal: retryController.signal
          });
          clearTimeout(retryTimeoutId);
        } catch (retryError: any) {
          clearTimeout(retryTimeoutId);
          // 如果是超时错误
          if (retryError.name === 'AbortError') {
            throw new Error(`请求超时（${timeout / 1000} 秒）`);
          }
          throw retryError;
        }
      } else {
        // 刷新失败，重定向到登录页（仅客户端执行）
        if (typeof window !== 'undefined') {
          window.location.href = ROUTES.LOGIN;
        }
        if (returnRawResponse) {
          return response as ApiRequestReturn<T, O>;
        }
        return (await response.json()) as ApiRequestReturn<T, O>;
      }
    }

    // 如果仍然是401，清除本地存储并重定向到登录页（仅客户端执行）
    if (response.status === 401) {
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = ROUTES.LOGIN;
      }
    }

    // 如果需要直接返回原始Response对象
    if (returnRawResponse) {
      return response as ApiRequestReturn<T, O>;
    }

    // 处理响应，检查是否是JSON响应
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      const responseData = await response.json();
      
      // 检查是否是标准化的错误响应
      if (!response.ok) {
        if (responseData.success === false && responseData.error) {
          const error = new Error(responseData.error.message);
          // 添加额外的错误信息
          (error as any).code = responseData.error.code;
          (error as any).details = responseData.error.details;
          (error as any).status = response.status;
          (error as any).data = responseData;
          throw error;
        } else {
          // 非标准化错误响应
          const error = new Error(`请求失败: ${response.status} ${response.statusText}`);
          (error as any).status = response.status;
          (error as any).data = responseData;
          throw error;
        }
      }
      
      // 返回数据部分或完整响应
      return ((responseData as ApiSuccessResponse<T>).data || responseData) as ApiRequestReturn<T, O>;
    }
    
    // 非JSON响应，返回原始Response
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }
    
    return response as any;
  })();
}

// 便捷的请求方法，确保返回类型正确
export const api = {
  get: <T = any>(url: string, options?: EnhancedApiRequestOptions) => 
    apiRequest<T>(url, { ...options, method: 'GET' }),
  
  post: <T = any>(url: string, data?: any, options?: EnhancedApiRequestOptions) => 
    apiRequest<T>(url, { ...options, method: 'POST', body: data }),
  
  put: <T = any>(url: string, data?: any, options?: EnhancedApiRequestOptions) => 
    apiRequest<T>(url, { ...options, method: 'PUT', body: data }),
  
  patch: <T = any>(url: string, data?: any, options?: EnhancedApiRequestOptions) => 
    apiRequest<T>(url, { ...options, method: 'PATCH', body: data }),
  
  delete: <T = any>(url: string, options?: EnhancedApiRequestOptions) => 
    apiRequest<T>(url, { ...options, method: 'DELETE' }),
};
