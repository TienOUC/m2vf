'use client';

/**
 * 资产类型定义
 */
export interface Asset {
  id: number;
  type: 'image' | 'video' | '3d';
  name: string;
  url: string;
}

/**
 * 图片mock数据源配置
 */
export const IMAGE_MOCK_CONFIG = {
  baseUrl: 'https://picsum.photos',
  sizes: {
    thumbnail: '200/200',
    medium: '400/400',
    large: '800/800'
  }
};

/**
 * 视频mock数据源配置
 */
export const VIDEO_MOCK_CONFIG = {
  baseUrl: 'https://test-videos.co.uk',
  availableVideos: [
    { id: '1', name: 'Big Buck Bunny', path: 'vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4' },
    { id: '2', name: 'Elephant Dream', path: 'vids/elephantsdream/mp4/h264/360/Elephants_Dream_360_10s_1MB.mp4' },
    { id: '3', name: 'For Bigger Blazes', path: 'vids/forBiggerBlazes/mp4/h264/360/ForBiggerBlazes_360_10s_1MB.mp4' }
  ]
};

/**
 * 生成图片mock数据
 * @param count 生成图片的数量
 * @returns 图片资产数组
 */
export const generateImageMockData = (count: number = 5): Asset[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    type: 'image' as const,
    name: `Image_${index.toString().padStart(2, '0')}.png`,
    url: `${IMAGE_MOCK_CONFIG.baseUrl}/seed/${index}/${IMAGE_MOCK_CONFIG.sizes.thumbnail}`
  }));
};

/**
 * 生成视频mock数据
 * @returns 视频资产数组
 */
export const generateVideoMockData = (): Asset[] => {
  return VIDEO_MOCK_CONFIG.availableVideos.map((video, index) => ({
    id: index + 100,
    type: 'video' as const,
    name: `${video.name.replace(/\s+/g, '_')}.mp4`,
    url: `${VIDEO_MOCK_CONFIG.baseUrl}/${video.path}`
  }));
};

/**
 * 生成3D模型mock数据
 * @param count 生成3D模型的数量
 * @returns 3D资产数组
 */
export const generate3DMockData = (count: number = 2): Asset[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 200,
    type: '3d' as const,
    name: `Model_${index.toString().padStart(2, '0')}.glb`,
    url: '' // 3D模型暂不提供mock URL
  }));
};

/**
 * 生成所有资产mock数据
 * @returns 所有资产数组
 */
export const generateAllAssetMockData = (): Asset[] => {
  return [
    ...generateImageMockData(),
    ...generateVideoMockData(),
    ...generate3DMockData()
  ];
};

/**
 * 预生成的资产mock数据
 */
export const ASSET_MOCK_DATA = generateAllAssetMockData();
