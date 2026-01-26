// 背景去除功能的 Mock 数据配置

import { 
  getRandomDelay, 
  shouldSimulateError
} from '@/lib/utils/mock/performance';

export interface BackgroundRemovalMockConfig {
  testCases: {
    inputImageUrl: string;
    outputImageUrl: string;
  }[];
}

// 背景去除模拟数据配置
export const backgroundRemovalMockConfig: BackgroundRemovalMockConfig = {
  testCases: [
    {
      inputImageUrl: 'https://picsum.photos/800/600?cat1',
      outputImageUrl: 'https://picsum.photos/800/600?cat1-no-bg'
    },
    {
      inputImageUrl: 'https://picsum.photos/800/600?cat2',
      outputImageUrl: 'https://picsum.photos/800/600?cat2-no-bg'
    },
    {
      inputImageUrl: 'https://picsum.photos/800/600?cat3',
      outputImageUrl: 'https://picsum.photos/800/600?cat3-no-bg'
    }
  ]
};

// 背景去除 Mock 处理器
export const handleBackgroundRemovalMock = (url: string, options: RequestInit): Promise<Response> | null => {
  // 检查是否匹配背景去除 API
  if (url.includes('/v1/ai/remove-background') && options.method === 'POST') {
    return new Promise((resolve) => {
      // 使用性能模拟工具获取随机延迟
      const delay = getRandomDelay();
      
      setTimeout(() => {
        // 使用性能模拟工具检查错误
        if (shouldSimulateError('network')) {
          // 模拟网络错误
          resolve(new Response(JSON.stringify({
            success: false,
            message: '网络连接错误，请检查网络连接后重试'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json'
            }
          }));
          return;
        }
        
        if (shouldSimulateError('server')) {
          // 模拟服务器内部错误
          resolve(new Response(JSON.stringify({
            success: false,
            message: '服务器内部错误，请稍后重试'
          }), {
            status: 503,
            headers: {
              'Content-Type': 'application/json'
            }
          }));
          return;
        }
        
        try {
          const body = JSON.parse(options.body as string);
          const inputImageUrl = body.image_url;
          
          // 验证图片URL
          if (!inputImageUrl || typeof inputImageUrl !== 'string') {
            resolve(new Response(JSON.stringify({
              success: false,
              message: '图片URL不能为空'
            }), {
              status: 400,
              headers: {
                'Content-Type': 'application/json'
              }
            }));
            return;
          }
          
          // 检查URL格式
          try {
            new URL(inputImageUrl);
          } catch {
            resolve(new Response(JSON.stringify({
              success: false,
              message: '无效的图片URL格式'
            }), {
              status: 400,
              headers: {
                'Content-Type': 'application/json'
              }
            }));
            return;
          }
          
          // 检查图片格式支持
          if (!inputImageUrl.match(/\.(jpe?g|png|webp|gif|bmp)$/i)) {
            resolve(new Response(JSON.stringify({
              success: false,
              message: '不支持的图片格式'
            }), {
              status: 400,
              headers: {
                'Content-Type': 'application/json'
              }
            }));
            return;
          }
          
          // 模拟验证错误
          if (shouldSimulateError('validation')) {
            resolve(new Response(JSON.stringify({
              success: false,
              message: '图片处理失败，请尝试其他图片'
            }), {
              status: 422,
              headers: {
                'Content-Type': 'application/json'
              }
            }));
            return;
          }
          
          // 查找匹配的测试用例
          const testCase = backgroundRemovalMockConfig.testCases.find(
            caseItem => caseItem.inputImageUrl === inputImageUrl
          );
          
          // 使用匹配的测试用例或生成模拟的透明背景图片
          let processedImageUrl: string;
          if (testCase) {
            processedImageUrl = testCase.outputImageUrl;
          } else {
            // 对于非测试图片，生成模拟的透明背景图片URL
            // 在实际应用中，这里应该调用真实的AI服务
            // 添加时间戳确保每次调用返回不同的URL，避免缓存问题
            const timestamp = Date.now();
            processedImageUrl = inputImageUrl.replace(/\.(jpe?g|png|webp|gif|bmp)$/i, `_no-bg_${timestamp}.png`);
          }
          
          // 创建模拟响应数据
          const mockData = {
            processed_image_url: processedImageUrl,
            success: true,
            message: '背景去除成功',
            processing_time: delay,
            model_version: 'mock-v1.0'
          };
          
          resolve(new Response(JSON.stringify(mockData), {
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          }));
        } catch (error) {
          // 处理解析错误
          resolve(new Response(JSON.stringify({
            success: false,
            message: '请求参数解析错误',
            error_details: 'JSON解析失败，请检查请求格式'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            }
          }));
        }
      }, delay);
    });
  }
  
  return null;
};
