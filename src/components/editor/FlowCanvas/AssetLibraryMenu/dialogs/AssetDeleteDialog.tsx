'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Asset } from '@/lib/mock/assetMockData';

interface AssetDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset;
  onConfirm: () => Promise<void>;
}

export function AssetDeleteDialog({ open, onOpenChange, asset, onConfirm }: AssetDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      setError('删除失败，请重试');
      console.error('Delete error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="dialog-content z-[100]" 
        onClick={(e) => e.stopPropagation()} 
        onPointerDown={(e) => e.stopPropagation()}
      >
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
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
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
  );
}
