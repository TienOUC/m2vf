'use client';

import { useState } from 'react';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AssetIcon } from './AssetIcon';
import { Asset } from '@/lib/mock/assetMockData';
import { AssetEditDialog } from './dialogs/AssetEditDialog';
import { AssetDeleteDialog } from './dialogs/AssetDeleteDialog';

interface AssetCardProps {
  asset: Asset;
  onUpdate?: (asset: Asset) => Promise<void>;
  onDelete?: (assetId: number) => Promise<void>;
}

/**
 * 资产卡片组件，带编辑和删除功能
 */
export function AssetCard({ asset, onUpdate, onDelete }: AssetCardProps) {
  // 状态管理
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 处理拖拽开始事件
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // 使用统一管理的URL
    e.dataTransfer.setData('application/relay-media', JSON.stringify({
      type: asset.type,
      url: asset.url,
      name: asset.name
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleUpdate = async (newName: string) => {
    if (onUpdate) {
      const updatedAsset = { ...asset, name: newName.trim() };
      await onUpdate(updatedAsset);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(asset.id);
    }
  };

  return (
    <>
      <div
        key={asset.id}
        draggable={!isEditDialogOpen && !isDeleteDialogOpen && asset.type !== '3d'}
        onDragStart={handleDragStart}
        className={cn(
          "group relative aspect-square rounded-lg border transition-all flex flex-col items-center justify-center gap-2",
          "bg-background border-muted hover:border-accent hover:bg-muted",
          (!isEditDialogOpen && !isDeleteDialogOpen && asset.type !== '3d') ? "cursor-grab active:cursor-grabbing" : "cursor-default"
        )}
      >
        {/* 显示资产缩略图 */}
        {asset.type === 'image' && asset.url ? (
          <img 
            src={asset.url} 
            alt={asset.name} 
            className="w-16 h-16 object-cover rounded-md transition-all hover:scale-105" 
            loading="lazy"
          />
        ) : asset.type === 'video' && asset.url ? (
          <div className="relative w-16 h-16">
            <video 
              src={asset.url} 
              muted 
              playsInline 
              autoPlay 
              loop 
              className="w-full h-full object-cover rounded-md transition-all hover:scale-105" 
            />
          </div>
        ) : (
          <AssetIcon type={asset.type} className="w-10 h-10" />
        )}
        
        {/* 资产名称显示 */}
        <span className={cn(
          "text-xs px-2 truncate w-full text-center transition-colors",
          "text-muted-foreground hover:text-foreground"
        )}>
          {asset.name}
        </span>

        {/* 操作按钮：ellipsis下拉菜单 */}
        {(onUpdate || onDelete) && (
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Ellipsis按钮 */}
            <button
              className="h-6 w-6 rounded-full bg-background/80 hover:bg-background border border-muted flex items-center justify-center transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="更多选项"
            >
              <MoreHorizontal className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>

            {/* 下拉菜单 */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-background border border-muted rounded-md shadow-lg z-50 overflow-hidden">
                {/* 编辑选项 */}
                {onUpdate && (
                  <button
                    className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-3 w-3 text-muted-foreground" />
                    <span>编辑</span>
                  </button>
                )}

                {/* 删除选项 */}
                {onDelete && (
                  <button
                    className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2 text-red-500 hover:text-red-600"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>删除</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 编辑对话框 */}
      {onUpdate && (
        <AssetEditDialog 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen} 
          initialName={asset.name} 
          onConfirm={handleUpdate} 
        />
      )}

      {/* 删除确认对话框 */}
      {onDelete && (
        <AssetDeleteDialog 
          open={isDeleteDialogOpen} 
          onOpenChange={setIsDeleteDialogOpen} 
          asset={asset} 
          onConfirm={handleDelete} 
        />
      )}
    </>
  );
}
