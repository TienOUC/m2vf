// API 请求客户端 - 核心请求函数

import type { ApiRequestOptions } from '@/lib/types/auth';
import {
  getAccessToken,
  refreshAccessToken,
  clearTokens
} from '@/lib/utils/token';
import { DEFAULT_CONFIG, ROUTES } from '@/lib/config/api.config';

// API 工具函数，用于处理需要认证的请求
export const apiRequest = async (
  url: string,
  options: ApiRequestOptions = {}
): Promise<Response> => {
  // 获取存储的 access_token
  const accessToken = getAccessToken();

  // 设置默认请求头
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {})
  };

  // 只有当没有设置 Content-Type 且不是 FormData 时才设置默认值
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // 如果有 access_token，添加到请求头
  if (accessToken) {
    (headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
  }

  // 开发环境下的 Mock 逻辑
  if (process.env.NODE_ENV === 'development') {
    // 检查是否是图片上传请求
    const imageUploadMatch = url.match(/api\/images\/api\/projects\/(\d+)\/folders\/(\d+)\/images\/upload\//);
    if (imageUploadMatch && options.method === 'POST') {
      // 模拟图片上传响应
      return new Promise((resolve) => {
        setTimeout(() => {
          const projectId = imageUploadMatch[1];
          const folderId = imageUploadMatch[2];
          const formData = options.body as FormData;
          const imageName = formData.get('name') as string || 'test-image.jpg';
          
          // 生成随机ID
          const imageId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          
          // 创建模拟响应数据
          const mockData = {
            status: 200,
            message: '上传成功',
            data: {
              id: imageId,
              name: imageName,
              url: `/test-images/test.jpg`,
              thumbnail_url: `/test-images/test.jpg`,
              width: 1920,
              height: 1080,
              size: Math.floor(Math.random() * (1024000 - 1024 + 1)) + 1024, // 1KB - 1MB
              uploaded_at: new Date().toISOString(),
              folder_id: parseInt(folderId),
              project_id: parseInt(projectId),
              description: formData.get('description') as string || ''
            }
          };
          
          // 创建 Response 对象
          resolve(new Response(JSON.stringify(mockData), {
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          }));
        }, 500);
      });
    }
    
    // 检查是否是视频上传请求
    const videoUploadMatch = url.match(/api\/images\/api\/projects\/(\d+)\/(?:folders\/(\d+)\/)?videos\/upload\//);
    if (videoUploadMatch && options.method === 'POST') {
      // 模拟视频上传响应
      return new Promise((resolve) => {
        setTimeout(() => {
          const projectId = videoUploadMatch[1];
          const folderId = videoUploadMatch[2] ? parseInt(videoUploadMatch[2]) : null;
          const formData = options.body as FormData;
          const videoName = formData.get('name') as string || 'test-video.mp4';
          
          // 生成随机ID
          const videoId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          
          // 创建模拟响应数据
          const mockData = {
            status: 200,
            message: '上传成功',
            data: {
              id: videoId,
              name: videoName,
              url: `/test-images/test.jpg`, // 视频也使用同一测试图片，避免404
              thumbnail_url: `/test-images/test.jpg`,
              duration: Math.floor(Math.random() * (300 - 10 + 1)) + 10, // 10秒 - 5分钟
              width: 1920,
              height: 1080,
              size: Math.floor(Math.random() * (102400000 - 1024000 + 1)) + 1024000, // 1MB - 100MB
              uploaded_at: new Date().toISOString(),
              folder_id: folderId,
              project_id: parseInt(projectId),
              description: formData.get('description') as string || ''
            }
          };
          
          // 创建 Response 对象
          resolve(new Response(JSON.stringify(mockData), {
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          }));
        }, 1000);
      });
    }
  }

  // 设置超时时间（默认使用配置文件中的值）
  const timeout = options.timeout || DEFAULT_CONFIG.REQUEST_TIMEOUT;
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, timeout);

  // 发起请求
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: abortController.signal
    });
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
      const retryAbortController = new AbortController();
      const retryTimeoutId = setTimeout(() => {
        retryAbortController.abort();
      }, timeout);

      try {
        (
          headers as Record<string, string>
        ).Authorization = `Bearer ${newAccessToken}`;
        response = await fetch(url, {
          ...options,
          headers,
          signal: retryAbortController.signal
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
      // 刷新失败，重定向到登录页
      window.location.href = ROUTES.LOGIN;
      return response;
    }
  }

  // 如果仍然是401，清除本地存储并重定向到登录页
  if (response.status === 401) {
    clearTokens();
    window.location.href = ROUTES.LOGIN;
  }

  return response;
};
