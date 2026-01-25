'use client';

import { Search as SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssetSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/**
 * 资产库搜索组件
 */
export function AssetSearch({ searchQuery, onSearchChange }: AssetSearchProps) {
  return (
    <div className="px-4 py-3 border-b border-muted">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="搜索资产 ..."
          className={cn(
            "w-full rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none transition-colors",
            "bg-background border border-muted text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
          )}
        />
      </div>
    </div>
  );
}
