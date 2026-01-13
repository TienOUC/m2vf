// 集中式 Mock 配置管理

import { backgroundRemovalMockConfig } from './background-removal';

// 所有 Mock 配置的集合
export const mockConfig = {
  backgroundRemoval: backgroundRemovalMockConfig
};

// 获取指定测试用例的输入输出图片URL
export const getBackgroundRemovalMockData = (inputImageUrl: string): {
  input: string;
  output: string;
} | null => {
  const testCase = backgroundRemovalMockConfig.testCases.find(
    caseItem => caseItem.inputImageUrl === inputImageUrl
  );
  
  if (!testCase) {
    return null;
  }
  
  return {
    input: testCase.inputImageUrl,
    output: testCase.outputImageUrl
  };
};

// 获取所有背景去除测试用例
export const getAllBackgroundRemovalTestCases = () => {
  return [...backgroundRemovalMockConfig.testCases];
};