'use client';

import { AssetSearch } from './AssetLibraryMenu/AssetSearch';
import { AssetTabs } from './AssetLibraryMenu/AssetTabs';
import { AssetCard } from './AssetLibraryMenu/AssetCard';
import { AssetUpload } from './AssetLibraryMenu/AssetUpload';
import { AssetFooter } from './AssetLibraryMenu/AssetFooter';
import { useAssets } from './AssetLibraryMenu/hooks/useAssets';

/**
 * 资产库菜单组件
 * 管理资产的展示、搜索、分类和拖拽功能
 */
export function AssetLibraryMenu() {
  const {
    assets,
    totalCount,
    activeTab,
    searchQuery,
    setActiveTab,
    setSearchQuery,
    updateAsset,
    deleteAsset,
    uploadFiles
  } = useAssets();

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
          <AssetUpload onUpload={uploadFiles} />

          {/* 资产卡片列表 */}
          {assets.map((asset) => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              onUpdate={updateAsset} 
              onDelete={deleteAsset} 
            />
          ))}
        </div>
      </div>

      {/* 页脚区域 */}
      <AssetFooter assetCount={totalCount} />
    </div>
  );
}
