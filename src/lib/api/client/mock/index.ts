// Mock 数据入口文件

import { handleImageUploadMock } from './image';
import { handleVideoUploadMock } from './video';
import { handleProjectsMock } from './projects';
import { handleBackgroundRemovalMock } from './background-removal';

// Mock 处理器类型定义
export type MockHandler = (url: string, options: RequestInit) => Promise<Response> | null;

// Mock 处理器配置
export const mockHandlers: MockHandler[] = [
  handleImageUploadMock,
  handleVideoUploadMock,
  handleProjectsMock,
  handleBackgroundRemovalMock,
];

// 检查是否应该使用 mock 数据
export const shouldUseMock = (url: string, options: RequestInit): boolean => {
  if (process.env.NODE_ENV !== 'development') {
    return false;
  }

  // 检查是否有匹配的 mock 处理器
  for (const handler of mockHandlers) {
    // 检查处理器是否接受这个 URL
    const result = handler(url, options);
    if (result !== null) {
      return true;
    }
  }

  return false;
};

// 执行匹配的 mock 处理
export const executeMock = async (url: string, options: RequestInit): Promise<Response> => {
  for (const handler of mockHandlers) {
    // 尝试获取匹配的处理器
    const result = handler(url, options);
    if (result !== null) {
      return await result;
    }
  }
  
  throw new Error('No matching mock handler found');
};
