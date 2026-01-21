'use client'

import { useState } from 'react'
import { FolderOpen, Search, Upload, Image as ImageIcon, Video as VideoIcon, Box as BoxIcon, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

interface Asset {
  id: number
  type: 'image' | 'video' | '3d'
  name: string
}

// 使用与studio项目相同的数据结构
const ASSETS: Asset[] = [
  { id: 0, type: 'image', name: 'Texture_00.png' },
  { id: 1, type: 'video', name: 'Render_seq_01.mp4' },
  { id: 2, type: '3d', name: 'Model_02.glb' }
]

const AssetIcon = ({ type }: { type: Asset['type'] }) => {
  switch (type) {
    case 'image':
      return <ImageIcon className="w-5 h-5 transition-colors text-muted-foreground group-hover:text-foreground" />
    case 'video':
      return <VideoIcon className="w-5 h-5 transition-colors text-muted-foreground group-hover:text-foreground" />
    case '3d':
      return <BoxIcon className="w-5 h-5 transition-colors text-muted-foreground group-hover:text-foreground" />
    default:
      return <FolderOpen className="w-5 h-5 transition-colors text-muted-foreground group-hover:text-foreground" />
  }
}

export function AssetLibraryMenu() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos' | '3d'>('all')
  // 管理资产列表，支持删除操作后更新
  const [assets, setAssets] = useState<Asset[]>(ASSETS)
  // 管理正在编辑的资产ID和新名称
  const [editingAssetId, setEditingAssetId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  // 管理加载状态
  const [loading, setLoading] = useState<{ [key: number]: 'rename' | 'delete' | null }>({})
  // 管理错误信息
  const [errors, setErrors] = useState<{ [key: number]: string | null }>({})
  // 管理删除确认对话框
  const [confirmDelete, setConfirmDelete] = useState<{ visible: boolean; assetId: number }>({ visible: false, assetId: 0 })

  // 过滤资产
  const filteredAssets = assets.filter(asset => {
    if (activeTab === 'all') return true
    if (activeTab === 'images') return asset.type === 'image'
    if (activeTab === 'videos') return asset.type === 'video'
    if (activeTab === '3d') return asset.type === '3d'
    return true
  }).filter(asset =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 模拟API调用 - 重命名资产
  const handleRenameAsset = async (assetId: number, newName: string) => {
    setLoading(prev => ({ ...prev, [assetId]: 'rename' }))
    setErrors(prev => ({ ...prev, [assetId]: null }))

    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      // 模拟API调用
      // const response = await api.assets.rename(assetId, newName)
      
      // 更新本地资产列表
      setAssets(prev => prev.map(asset => 
        asset.id === assetId ? { ...asset, name: newName } : asset
      ))
      setEditingAssetId(null)
    } catch (error) {
      console.error('重命名失败:', error)
      setErrors(prev => ({ ...prev, [assetId]: '重命名失败，请重试' }))
      // 恢复编辑前的名称
      const originalAsset = assets.find(a => a.id === assetId)
      if (originalAsset) {
        setEditingName(originalAsset.name)
      }
    } finally {
      setLoading(prev => ({ ...prev, [assetId]: null }))
    }
  }

  // 模拟API调用 - 删除资产
  const handleDeleteAsset = async (assetId: number) => {
    setLoading(prev => ({ ...prev, [assetId]: 'delete' }))
    setErrors(prev => ({ ...prev, [assetId]: null }))

    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      // 模拟API调用
      // const response = await api.assets.delete(assetId)
      
      // 从本地列表中移除资产
      setAssets(prev => prev.filter(asset => asset.id !== assetId))
      setConfirmDelete({ visible: false, assetId: 0 })
    } catch (error) {
      console.error('删除失败:', error)
      setErrors(prev => ({ ...prev, [assetId]: '删除失败，请重试' }))
      setConfirmDelete({ visible: false, assetId: 0 })
    } finally {
      setLoading(prev => ({ ...prev, [assetId]: null }))
    }
  }

  // 处理编辑确认
  const handleEditConfirm = (assetId: number) => {
    if (editingName.trim()) {
      handleRenameAsset(assetId, editingName.trim())
    } else {
      // 名称不能为空，恢复编辑前的名称
      const originalAsset = assets.find(a => a.id === assetId)
      if (originalAsset) {
        setEditingName(originalAsset.name)
      }
      setEditingAssetId(null)
    }
  }

  // 处理编辑取消
  const handleEditCancel = () => {
    setEditingAssetId(null)
  }

  return (
    <div className="w-[380px] h-[520px] rounded-lg shadow-lg flex flex-col z-[60] bg-background border border-muted">
      {/* Search */}
      <div className="px-4 py-3 border-b border-muted">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索资产 ..."
            className={cn(
              "w-full rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none transition-colors",
              "bg-background border border-muted text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
            )}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 flex gap-1 border-b border-muted">
        {[
          { key: 'all', label: '全部' },
          { key: 'images', label: '图片' },
          { key: 'videos', label: '视频' },
          { key: '3d', label: '3D' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
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

      {/* Assets Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Upload Placeholder */}
          <label className={cn(
            "aspect-square border border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-all cursor-pointer",
            "border-muted hover:bg-muted hover:border-accent"
          )}>
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">上传</span>
            <input type="file" className="hidden" multiple />
          </label>

          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/reactflow', JSON.stringify({
                  type: asset.type,
                  name: editingAssetId === asset.id ? editingName : asset.name,
                  id: `asset-${asset.id}`,
                  data: {
                    label: editingAssetId === asset.id ? editingName : asset.name,
                    type: asset.type,
                    name: editingAssetId === asset.id ? editingName : asset.name,
                    url: ''
                  }
                }));
                e.dataTransfer.effectAllowed = 'move';
              }}
              className={cn(
                "group relative aspect-square rounded-lg border transition-all cursor-grab active:cursor-grabbing flex flex-col items-center justify-center gap-2",
                "bg-background border-muted hover:border-accent hover:bg-muted"
              )}
            >
              <AssetIcon type={asset.type} />
              
              {/* 资产名称显示/编辑区域 */}
              {editingAssetId === asset.id ? (
                <div className="w-full px-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleEditConfirm(asset.id);
                      } else if (e.key === 'Escape') {
                        handleEditCancel();
                      }
                    }}
                    className={cn(
                      "w-full text-xs text-center transition-colors px-2 py-1 rounded-md",
                      "bg-background border border-accent text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    )}
                    autoFocus
                  />
                </div>
              ) : (
                <span className={cn(
                  "text-xs px-2 truncate w-full text-center transition-colors",
                  "text-muted-foreground group-hover:text-foreground"
                )}>
                  {asset.name}
                </span>
              )}

              {/* 错误信息显示 */}
              {errors[asset.id] && (
                <span className="text-[10px] text-red-500 px-2 w-full text-center">
                  {errors[asset.id]}
                </span>
              )}

              {/* Hover Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className={cn(
                        "w-6 h-6 rounded-md flex items-center justify-center transition-colors",
                        "bg-background hover:bg-muted"
                      )}
                      disabled={loading[asset.id] !== null}
                    >
                      {loading[asset.id] ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-36" align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingAssetId(asset.id);
                        setEditingName(asset.name);
                      }}
                      disabled={loading[asset.id] !== null}
                      className="flex items-center gap-2"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>修改</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setConfirmDelete({ visible: true, assetId: asset.id })}
                      disabled={loading[asset.id] !== null}
                      className="flex items-center gap-2 text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>删除</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="h-10 flex items-center justify-between px-4 rounded-b-lg border-t border-muted bg-muted">
        <span className="text-xs text-muted-foreground">
          共 {filteredAssets.length}
        </span>
        <span className="text-xs text-muted-foreground">
          可拖放到画布中
        </span>
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={confirmDelete.visible}
        title="确认删除"
        message="您确定要删除此资产吗？此操作不可恢复。"
        confirmText="确认删除"
        cancelText="取消"
        onConfirm={() => handleDeleteAsset(confirmDelete.assetId)}
        onCancel={() => setConfirmDelete({ visible: false, assetId: 0 })}
        isConfirming={loading[confirmDelete.assetId] === 'delete'}
      />
    </div>
  )
}