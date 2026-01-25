'use client';

import { Upload as UploadIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssetUploadProps {
  // 可以添加上传处理函数作为props
  onUpload?: (files: FileList) => void;
}

/**
 * 资产上传占位符组件
 */
export function AssetUpload({ onUpload }: AssetUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload?.(e.target.files);
    }
  };

  return (
    <label className={cn(
      "aspect-square border border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-all cursor-pointer",
      "border-muted hover:bg-muted hover:border-accent"
    )}>
      <UploadIcon className="w-5 h-5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">上传</span>
      <input 
        type="file" 
        className="hidden" 
        multiple 
        onChange={handleFileChange}
        // 可以根据需要添加accept属性，限制上传文件类型
        // accept="image/*,video/*,.glb,.gltf"
      />
    </label>
  );
}
