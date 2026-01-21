// Mock 数据入口文件
import { handleBackgroundRemovalMock } from './background-removal';

// Mock 处理器类型定义
export type MockHandler = (url: string, options: RequestInit) => Promise<Response> | null;

// Mock 处理器配置
export const mockHandlers: MockHandler[] = [
  handleBackgroundRemovalMock,
];

export const shouldUseMock = (url: string, options: RequestInit): boolean => {
  if (process.env.NODE_ENV !== 'development') {
    return false;
  }

  for (const handler of mockHandlers) {
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
    const result = handler(url, options);
    if (result !== null) {
      return await result;
    }
  }
  
  throw new Error('No matching mock handler found');
};
