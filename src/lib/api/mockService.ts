import { buildImageGenerateRequest, buildVideoGenerateRequest } from '@/lib/utils/requestBuilder';

export const mockApiService = {
  // 生成视频
  generateVideo: async (
    content: string, 
    model: string, 
    firstFrameUrl: string, 
    nodeId: string,
    lastFrameUrl?: string, 
    config?: Record<string, any>
  ) => {
    // 构建请求参数
    const requestParams = buildVideoGenerateRequest(
      content, model, firstFrameUrl, lastFrameUrl, config, nodeId
    );
    
    console.log('发送视频生成请求:', requestParams);
    
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 模拟生成的视频URL
    return `https://placehold.co/1280x720/CCCCCC/999999.mp4?text=Generated+Video&timestamp=${Date.now()}`;
  },
  
  // 生成图片
  generateImage: async (
    content: string, 
    model: string, 
    nodeId: string,
    config?: Record<string, any>
  ) => {
    // 构建请求参数
    const requestParams = buildImageGenerateRequest(
      content, model, config, nodeId
    );
    
    console.log('发送图片生成请求:', requestParams);
    
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 模拟生成的图片URL
    return 'https://picsum.photos/800/600?timestamp=' + Date.now();
  }
};