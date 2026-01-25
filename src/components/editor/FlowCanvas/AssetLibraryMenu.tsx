'use client';

import { useState } from 'react';
import { useAssetFiltering } from '@/hooks/editor/useAssetFiltering';
import { AssetSearch } from './AssetLibraryMenu/AssetSearch';
import { AssetTabs } from './AssetLibraryMenu/AssetTabs';
import { AssetCard } from './AssetLibraryMenu/AssetCard';
import { AssetUpload } from './AssetLibraryMenu/AssetUpload';
import { AssetFooter } from './AssetLibraryMenu/AssetFooter';

// 导入统一的mock数据
import { ASSET_MOCK_DATA, Asset } from '@/lib/mock/assetMockData';

/**
 * 资产库菜单组件
 * 管理资产的展示、搜索、分类和拖拽功能
 */
export function AssetLibraryMenu() {
  // 状态管理：资产列表
  const [assets, setAssets] = useState<Asset[]>(ASSET_MOCK_DATA);

  // 使用自定义hook处理资产过滤和搜索
  const {
    activeTab,
    searchQuery,
    filteredAssets,
    setActiveTab,
    setSearchQuery
  } = useAssetFiltering(assets);

  // 处理文件上传
  const handleUpload = (files: FileList) => {
    // 这里可以添加上传逻辑
    console.log('Uploading files:', files);
  };

  // 处理资产更新
  const handleAssetUpdate = (updatedAsset: Asset) => {
    setAssets((prevAssets) =>
      prevAssets.map((asset) =>
        asset.id === updatedAsset.id ? updatedAsset : asset
      )
    );
  };

  // 处理资产删除
  const handleAssetDelete = (assetId: number) => {
    setAssets((prevAssets) =>
      prevAssets.filter((asset) => asset.id !== assetId)
    );
  };

  return (
    <div 
      className="w-[380px] h-[520px] rounded-lg shadow-lg flex flex-col z-[60] bg-background border border-muted"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {/* 搜索区域 */}
      <AssetSearch 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
      />

      {/* 标签页区域 */}
      <AssetTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* 资产网格区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {/* 上传占位符 */}
          <AssetUpload onUpload={handleUpload} />

          {/* 资产卡片列表 */}
          {filteredAssets.map((asset) => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              onUpdate={handleAssetUpdate} 
              onDelete={handleAssetDelete} 
            />
          ))}
        </div>
      </div>

      {/* 页脚区域 */}
      <AssetFooter assetCount={filteredAssets.length} />
    </div>
  );
}
