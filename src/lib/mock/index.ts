// 统一的 Mock 数据管理入口

// 导入所有 Mock 数据
import { AI_MODELS, PROJECTS } from '@/lib/studio-data';
import { mockApiService } from '@/lib/api/mockService';
import { mockHandlers, shouldUseMock, executeMock } from '@/lib/api/client/mock';
import { mockConfig } from '@/lib/api/client/mock/config';

// 聊天相关的 Mock 数据
import { ChatMessage } from '@/lib/types/studio';

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  { id: '1', role: 'user', content: '生成一只在樱花树下的可爱小猫', timestamp: new Date('2026-01-19T10:30:00') },
  { 
    id: '2', 
    role: 'assistant', 
    content: '好的，我来为您生成一只在樱花树下的可爱小猫。', 
    timestamp: new Date('2026-01-19T10:30:05'),
    modelUsed: 'Seedream 4.0',
    status: 'complete',
    imageUrl: 'https://picsum.photos/800/600'
  },
  { id: '3', role: 'user', content: '让背景更梦幻一些', timestamp: new Date('2026-01-19T10:32:00') },
  { 
    id: '4', 
    role: 'assistant', 
    content: '我为您调整了背景效果，增加了更多梦幻的光晕和柔和的色调。', 
    timestamp: new Date('2026-01-19T10:32:10'),
    modelUsed: 'Seedream 4.0',
    status: 'complete',
    imageUrl: 'https://picsum.photos/800/600'
  },
  { id: '5', role: 'user', content: '生成一个关于小猫的短视频', timestamp: new Date('2026-01-19T10:35:00') },
  { 
    id: '6', 
    role: 'assistant', 
    content: '好的，我来为您生成一个关于小猫的短视频。', 
    timestamp: new Date('2026-01-19T10:35:05'),
    modelUsed: 'Seedream 4.0',
    status: 'complete',
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4'
  },
];

// 从统一的资产Mock数据管理中导入
import { ASSET_MOCK_DATA } from './assetMockData';

// 资产选择菜单的 Mock 数据
export const MOCK_ASSETS = ASSET_MOCK_DATA.filter(asset => asset.type !== '3d');

// 统一的 Mock 配置接口
export const mock = {
  // 配置开关
  enabled: process.env.NODE_ENV === 'development',
  
  // 数据配置
  config: mockConfig,
  
  // 各种 Mock 数据
  data: {
    chatMessages: MOCK_CHAT_MESSAGES,
    aiModels: AI_MODELS,
    projects: PROJECTS,
    assets: MOCK_ASSETS,
  },
  
  // Mock 服务
  services: {
    api: mockApiService,
  },
  
  // API 客户端 Mock
  client: {
    handlers: mockHandlers,
    shouldUseMock,
    executeMock,
  },
};

// 导出类型
export type { MockHandler } from '@/lib/api/client/mock';

// 导出工具函数
export * from '@/lib/utils/mock/performance';
