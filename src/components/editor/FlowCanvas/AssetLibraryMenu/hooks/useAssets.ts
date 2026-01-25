'use client';

import { useState } from 'react';
import { Asset, ASSET_MOCK_DATA } from '@/lib/mock/assetMockData';
import { useAssetFiltering } from '@/hooks/editor/useAssetFiltering';
import { useToast } from '@/hooks/use-toast';

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>(ASSET_MOCK_DATA);
  const { toast } = useToast();

  const {
    activeTab,
    searchQuery,
    filteredAssets,
    setActiveTab,
    setSearchQuery
  } = useAssetFiltering(assets);

  const updateAsset = async (updatedAsset: Asset) => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setAssets((prevAssets) =>
      prevAssets.map((asset) =>
        asset.id === updatedAsset.id ? updatedAsset : asset
      )
    );
    
    toast({ title: '成功', description: '资产名称编辑成功', variant: 'default' });
  };

  const deleteAsset = async (assetId: number) => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    setAssets((prevAssets) =>
      prevAssets.filter((asset) => asset.id !== assetId)
    );

    toast({ title: '成功', description: '资产删除成功', variant: 'default' });
  };

  const uploadFiles = async (files: FileList) => {
    // 这里可以添加上传逻辑
    console.log('Uploading files:', files);
    // 模拟上传
    await new Promise(resolve => setTimeout(resolve, 500));
    toast({ title: '提示', description: '文件上传功能开发中', variant: 'default' });
  };

  return {
    assets: filteredAssets,
    totalCount: filteredAssets.length,
    activeTab,
    searchQuery,
    setActiveTab,
    setSearchQuery,
    updateAsset,
    deleteAsset,
    uploadFiles
  };
}
