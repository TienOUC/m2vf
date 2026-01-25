'use client';

interface AssetFooterProps {
  assetCount: number;
}

/**
 * 资产库页脚组件
 */
export function AssetFooter({ assetCount }: AssetFooterProps) {
  return (
    <div className="h-10 flex items-center justify-between px-4 rounded-b-lg border-t border-muted bg-muted">
      <span className="text-xs text-muted-foreground">
        共 {assetCount} 项
      </span>
      <span className="text-xs text-muted-foreground">
        可拖放到画布中
      </span>
    </div>
  );
}
