// 背景去除功能的 Mock 工具函数 - 精简版本

import { mockConfig, getBackgroundRemovalMockData } from '@/lib/api/client/mock/config';
import {
  getRandomDelay,
  shouldUseMock
} from './performance';

// 检查当前环境是否为开发环境
export const isDevelopment = process.env.NODE_ENV === 'development';

// 获取背景去除的 Mock 输入输出图片URL
export const getBackgroundRemovalTestImages = (inputImageUrl?: string) => {
  if (!shouldUseMock()) {
    return null;
  }
  
  // 如果提供了输入URL，查找匹配的测试用例
  if (inputImageUrl) {
    return getBackgroundRemovalMockData(inputImageUrl);
  }
  
  // 否则返回默认测试用例
  return {
    input: mockConfig.backgroundRemoval.testCases[0].inputImageUrl,
    output: mockConfig.backgroundRemoval.testCases[0].outputImageUrl
  };
};

// 检查图片是否可以使用 Mock 处理
export const canUseMockForImage = (imageUrl: string) => {
  if (!shouldUseMock()) {
    return false;
  }
  
  return mockConfig.backgroundRemoval.testCases.some(
    testCase => testCase.inputImageUrl === imageUrl
  );
};

// 获取所有可用的测试用例
export const getAllTestCases = () => {
  if (!shouldUseMock()) {
    return [];
  }
  
  return [...mockConfig.backgroundRemoval.testCases];
};

// 验证图片URL格式
export const validateImageUrl = (imageUrl: string): { isValid: boolean; error?: string } => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return { isValid: false, error: '图片URL不能为空' };
  }
  
  // 检查URL格式
  try {
    new URL(imageUrl);
  } catch {
    return { isValid: false, error: '无效的图片URL格式' };
  }
  
  // 检查图片格式支持
  if (!imageUrl.match(/\.(jpe?g|png|webp|gif|bmp)$/i)) {
    return { isValid: false, error: '不支持的图片格式' };
  }
  
  return { isValid: true };
};