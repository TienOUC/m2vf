'use client'

import { useState, useRef } from 'react'
import { FolderOpen, Search, Image as ImageIcon, Video as VideoIcon, Box as BoxIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useClickOutside } from '@/hooks/ui/useClickOutside'

interface Asset {
  id: number
  type: 'image' | 'video'
  name: string
  url: string
}

// 从统一的 Mock 管理入口导入数据
import { mock } from '@/lib/mock';

const MOCK_ASSETS: Asset[] = mock.data.assets

const AssetIcon = ({ type }: { type: Asset['type'] }) => {
  switch (type) {
    case 'image':
      return <ImageIcon className="w-5 h-5 text-muted-foreground" />
    case 'video':
      return <VideoIcon className="w-5 h-5 text-muted-foreground" />
    default:
      return <BoxIcon className="w-5 h-5 text-muted-foreground" />
  }
}

interface AssetSelectMenuProps {
  onSelect: (asset: Asset) => void
  onClose: () => void
}

export function AssetSelectMenu({ onSelect, onClose }: AssetSelectMenuProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos'>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // 使用 useClickOutside 钩子处理外部点击关闭
  useClickOutside([menuRef], onClose, true)

  // 过滤资产
  const filteredAssets = MOCK_ASSETS.filter(asset => {
    if (activeTab === 'all') return true
    if (activeTab === 'images') return asset.type === 'image'
    if (activeTab === 'videos') return asset.type === 'video'
    return true
  }).filter(asset =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 处理资产选择
  const handleAssetSelect = async (asset: Asset) => {
    try {
      setLoading(true)
      setError(null)
      // 模拟API调用或处理
      await new Promise(resolve => setTimeout(resolve, 500))
      onSelect(asset)
      onClose()
    } catch (err) {
      setError('资产选择失败，请重试')
      console.error('Asset selection error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      ref={menuRef}
      className="w-[320px] h-[400px] rounded-lg shadow-lg flex flex-col z-[60] bg-background border border-muted animate-in slide-in-from-bottom-2 duration-200"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-muted flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">资产库</h3>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-muted">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索资产..."
            className={cn(
              "w-full rounded-md pl-10 pr-4 py-1.5 text-sm focus:outline-none transition-colors",
              "bg-background border border-muted text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
            )}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-1 flex gap-1 border-b border-muted">
        {[
          { key: 'all', label: '全部' },
          { key: 'images', label: '图片' },
          { key: 'videos', label: '视频' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-colors",
              activeTab === tab.key
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 text-xs text-red-500 bg-red-50/10 border-b border-red-500/20">
          {error}
        </div>
      )}

      {/* Assets Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => handleAssetSelect(asset)}
                  className={cn(
                    "group relative aspect-square rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center gap-2",
                    "bg-background border-muted hover:border-accent hover:bg-muted"
                  )}
                >
                  <AssetIcon type={asset.type} />
                  <span className={cn(
                    "text-xs px-2 truncate w-full text-center transition-colors",
                    "text-muted-foreground group-hover:text-foreground"
                  )}>
                    {asset.name}
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-2 flex items-center justify-center h-40 text-sm text-muted-foreground">
                没有找到匹配的资产
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="h-8 flex items-center justify-between px-4 rounded-b-lg border-t border-muted bg-muted">
        <span className="text-xs text-muted-foreground">
          共 {filteredAssets.length} 项
        </span>
      </div>
    </div>
  )
}
