'use client';

import { FolderOpen, Image as ImageIcon, Video as VideoIcon, Box as BoxIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type AssetType = 'image' | 'video' | '3d';

interface AssetIconProps {
  type: AssetType;
  className?: string;
}

/**
 * 资产图标组件，根据资产类型显示不同的图标
 */
export function AssetIcon({ type, className }: AssetIconProps) {
  const baseClass = "transition-colors text-muted-foreground group-hover:text-foreground";
  const combinedClass = cn(baseClass, className);
  
  switch (type) {
    case 'image':
      return <ImageIcon className={combinedClass} />;
    case 'video':
      return <VideoIcon className={combinedClass} />;
    case '3d':
      return <BoxIcon className={combinedClass} />;
    default:
      return <FolderOpen className={combinedClass} />;
  }
}
