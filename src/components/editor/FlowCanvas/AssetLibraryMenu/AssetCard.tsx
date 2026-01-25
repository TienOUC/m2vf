'use client';

import { useState } from 'react';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AssetIcon } from './AssetIcon';
import { Asset } from '@/lib/mock/assetMockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AssetCardProps {
  asset: Asset;
  onUpdate?: (asset: Asset) => void;
  onDelete?: (assetId: number) => void;
}

/**
 * 资产卡片组件，带编辑和删除功能
 */
export function AssetCard({ asset, onUpdate, onDelete }: AssetCardProps) {
  // 状态管理
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editingName, setEditingName] = useState(asset.name);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 使用toast hook
  const { toast } = useToast();

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

  // 处理编辑确认
  const handleEditConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      // 更新资产数据
      const updatedAsset = { ...asset, name: editingName.trim() };
      onUpdate?.(updatedAsset);
      setIsEditDialogOpen(false);
      // 显示成功消息
      toast({ title: '成功', description: '资产名称编辑成功', variant: 'default' });
    } catch (err) {
      setError('编辑失败，请重试');
      console.error('Edit error:', err);
      // 显示错误消息
      toast({ title: '错误', description: '编辑失败，请重试', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // 处理删除确认
  const handleDeleteConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      // 删除资产
      onDelete?.(asset.id);
      setIsDeleteDialogOpen(false);
      // 显示成功消息
      toast({ title: '成功', description: '资产删除成功', variant: 'default' });
    } catch (err) {
      setError('删除失败，请重试');
      console.error('Delete error:', err);
      // 显示错误消息
      toast({ title: '错误', description: '删除失败，请重试', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      key={asset.id}
      draggable={asset.type !== '3d'}
      onDragStart={handleDragStart}
      className={cn(
        "group relative aspect-square rounded-lg border transition-all flex flex-col items-center justify-center gap-2",
        "bg-background border-muted hover:border-accent hover:bg-muted",
        asset.type !== '3d' ? "cursor-grab active:cursor-grabbing" : "cursor-default"
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

      {/* 编辑对话框 - 使用shadcn/ui的Dialog组件 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="dialog-content" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>编辑资产名称</DialogTitle>
            <DialogDescription>
              修改资产的显示名称
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                资产名称
              </label>
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                placeholder="请输入资产名称"
                className={cn(
                  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1",
                  error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-muted focus:border-accent focus:ring-accent"
                )}
              />
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button
              onClick={handleEditConfirm}
              disabled={isLoading || !editingName.trim()}
            >
              {isLoading ? (
                <div className="inline-flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>保存中...</span>
                </div>
              ) : (
                '保存'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 - 使用shadcn/ui的Dialog组件 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="dialog-content" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>确认删除资产</DialogTitle>
            <DialogDescription>
              此操作不可恢复，请谨慎操作
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              您确定要删除此资产吗？此操作不可恢复。
            </p>
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm font-medium text-destructive">{asset.name}</p>
              <p className="text-xs text-destructive/80">类型：{asset.type}</p>
            </div>
            <div className="p-2 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground">
                删除后，该资产将从所有项目中移除，无法恢复。
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="inline-flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>删除中...</span>
                </div>
              ) : (
                '确认删除'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
