import { ChatFile } from '@/lib/stores/chatFilesStore';

interface ChatFilePreviewProps {
  files: ChatFile[];
  onDelete: (id: string) => void;
}

export function ChatFilePreview({ files, onDelete }: ChatFilePreviewProps) {
  if (files.length === 0) return null;
  
  return (
    <div className="px-4 pt-3 pb-2 flex flex-wrap gap-2">
      {files.map((file) => (
        <div 
          key={file.id} 
          className="relative group flex-shrink-0"
        >
          {/* 缩略图容器 */}
          <div className="w-[60px] h-[60px] rounded-md overflow-hidden border border-border bg-background flex items-center justify-center">
            {file.type === 'image' ? (
              <img
                src={file.thumbnailUrl}
                alt={file.file ? file.file.name : `file-${file.id}`}
                className="w-full h-full object-cover"
                loading="eager"
              />
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={file.thumbnailUrl}
                  alt={file.file ? file.file.name : `file-${file.id}`}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                {/* 视频标识 */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-black"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* 文件名显示 */}
          <div className="mt-1 text-xs text-muted-foreground truncate w-[60px] text-center">
            {file.file ? file.file.name : file.url ? file.url.split('/').pop() || `file-${file.id}` : `file-${file.id}`}
          </div>
          
          {/* 删除按钮 */}
          <button
            onClick={() => onDelete(file.id)}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm hover:bg-red-600"
            aria-label="删除文件"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
