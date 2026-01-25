'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AssetEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName: string;
  onConfirm: (newName: string) => Promise<void>;
}

export function AssetEditDialog({ open, onOpenChange, initialName, onConfirm }: AssetEditDialogProps) {
  const [editingName, setEditingName] = useState(initialName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset name when dialog opens
  useEffect(() => {
    if (open) {
      setEditingName(initialName);
      setError(null);
    }
  }, [open, initialName]);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm(editingName);
      onOpenChange(false);
    } catch (err) {
      setError('编辑失败，请重试');
      console.error('Edit error:', err);
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
              onPointerDown={(e) => e.stopPropagation()}
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
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            onClick={handleConfirm}
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
  );
}
