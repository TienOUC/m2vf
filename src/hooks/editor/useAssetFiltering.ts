'use client';

import { useMemo, useState } from 'react';
import { Asset } from '@/lib/mock/assetMockData';

export interface AssetFilteringResult {
  activeTab: 'all' | 'images' | 'videos' | '3d';
  searchQuery: string;
  filteredAssets: Asset[];
  setActiveTab: (tab: 'all' | 'images' | 'videos' | '3d') => void;
  setSearchQuery: (query: string) => void;
}

/**
 * 资产过滤和搜索的自定义hook
 * @param assets 原始资产列表
 * @returns 过滤后的资产列表和相关控制函数
 */
export function useAssetFiltering(assets: Asset[]): AssetFilteringResult {
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos' | '3d'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 过滤资产
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // 按类型过滤
      if (activeTab === 'all') return true;
      if (activeTab === 'images') return asset.type === 'image';
      if (activeTab === 'videos') return asset.type === 'video';
      if (activeTab === '3d') return asset.type === '3d';
      return true;
    }).filter(asset =>
      // 按名称搜索
      asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [assets, activeTab, searchQuery]);

  return {
    activeTab,
    searchQuery,
    filteredAssets,
    setActiveTab,
    setSearchQuery
  };
}
