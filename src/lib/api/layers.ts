// 图层管理相关 API

import { apiRequest } from './client';

// 创建图层
export const createLayer = async (layerData: any): Promise<Response> => {
  const createUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/layers/`
    : `http://127.0.0.1:8000/api/layers/`;

  console.log('正在创建图层:', createUrl);
  return apiRequest(createUrl, {
    method: 'POST',
    body: JSON.stringify(layerData)
  });
};

// 更新图层临时编辑图片
export const updateLayerTempImage = async (
  layerId: string,
  tempEditedImageUrl: string
): Promise<Response> => {
  const updateUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/layers/${layerId}/update-temp-image/`
    : `http://127.0.0.1:8000/api/layers/${layerId}/update-temp-image/`;

  console.log('正在更新图层临时编辑图片:', updateUrl);
  return apiRequest(updateUrl, {
    method: 'POST',
    body: JSON.stringify({
      tempEditedImageUrl: tempEditedImageUrl
    })
  });
};

// 保存图层处理后图片
export const saveLayerProcessedImage = async (
  layerId: string,
  processedImageUrl: string
): Promise<Response> => {
  const saveUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/layers/${layerId}/save-processed-image/`
    : `http://127.0.0.1:8000/api/layers/${layerId}/save-processed-image/`;

  console.log('正在保存图层处理后图片:', saveUrl);
  return apiRequest(saveUrl, {
    method: 'POST',
    body: JSON.stringify({
      processedImageUrl: processedImageUrl
    })
  });
};
