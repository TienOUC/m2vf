// 性能模拟工具函数 - 精简版本

// 性能模拟配置
interface PerformanceConfig {
  minDelay: number; // 最小延迟（毫秒）
  maxDelay: number; // 最大延迟（毫秒）
  errorRate: number; // 错误率（0-1）
  networkErrorRate: number; // 网络错误率
  serverErrorRate: number; // 服务器错误率
}

// 默认性能配置
const defaultPerformanceConfig: PerformanceConfig = {
  minDelay: 500,
  maxDelay: 3000,
  errorRate: 0.1, // 10%总错误率
  networkErrorRate: 0.05, // 5%网络错误
  serverErrorRate: 0.03 // 3%服务器错误
};

// 当前性能配置
const currentPerformanceConfig = { ...defaultPerformanceConfig };

// 获取随机延迟时间
export const getRandomDelay = (config?: Partial<PerformanceConfig>): number => {
  const effectiveConfig = config ? { ...currentPerformanceConfig, ...config } : currentPerformanceConfig;
  return Math.floor(Math.random() * (effectiveConfig.maxDelay - effectiveConfig.minDelay)) + effectiveConfig.minDelay;
};

// 检查是否应该模拟错误
export const shouldSimulateError = (
  errorType: 'network' | 'server' | 'validation'
): boolean => {
  const random = Math.random();
  
  switch (errorType) {
    case 'network':
      return random < currentPerformanceConfig.networkErrorRate;
    case 'server':
      return random < currentPerformanceConfig.serverErrorRate;
    case 'validation':
      return random < (currentPerformanceConfig.errorRate - currentPerformanceConfig.networkErrorRate - currentPerformanceConfig.serverErrorRate);
    default:
      return random < currentPerformanceConfig.errorRate;
  }
};

// 环境切换支持
export const isDevelopment = process.env.NODE_ENV === 'development';

export const shouldUseMock = (): boolean => {
  if (typeof window === 'undefined') {
    return isDevelopment;
  }
  
  const stored = localStorage.getItem('mock-enabled');
  if (stored === 'true') {
    return true;
  } else if (stored === 'false') {
    return false;
  }
  
  return isDevelopment;
};