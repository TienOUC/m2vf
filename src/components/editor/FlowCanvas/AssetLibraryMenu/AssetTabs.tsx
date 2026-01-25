'use client';

import { cn } from '@/lib/utils';

interface AssetTabsProps {
  activeTab: 'all' | 'images' | 'videos' | '3d';
  onTabChange: (tab: 'all' | 'images' | 'videos' | '3d') => void;
}

/**
 * 资产库标签页组件
 */
export function AssetTabs({ activeTab, onTabChange }: AssetTabsProps) {
  const tabs = [
    { key: 'all' as const, label: '全部' },
    { key: 'images' as const, label: '图片' },
    { key: 'videos' as const, label: '视频' },
    { key: '3d' as const, label: '3D' },
  ];

  return (
    <div className="px-4 py-2 flex gap-1 border-b border-muted">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
            activeTab === tab.key
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
