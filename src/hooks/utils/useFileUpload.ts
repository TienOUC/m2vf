import { useState, useCallback, useRef, useEffect } from 'react';
import { uploadProjectImage } from '@/lib/api/client/images';

export function useFileUpload(acceptType: string, initialUrl?: string) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileUrl, setFileUrl] = useState<string>(initialUrl || '');
  const [isUploading, setIsUploading] = useState(false);

  // 当initialUrl变化时，同步更新本地状态
  useEffect(() => {
    if (initialUrl) {
      setFileUrl(initialUrl);
    }
  }, [initialUrl]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, onFileSelected?: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith(acceptType)) {
      setIsUploading(true);
      
      try {
        // 模拟项目ID和文件夹ID
        const projectId = 1;
        const folderId = 1;
        
        // 调用实际的上传API
        const response = await uploadProjectImage(projectId, folderId, file, file.name);
        
        if (response.ok) {
          const data = await response.json();
          
          // 使用上传成功返回的URL
          const uploadedUrl = data.data.url;
          setFileUrl(uploadedUrl);
          if (onFileSelected) onFileSelected(uploadedUrl);
        } else {
          // 如果上传失败，回退到本地Data URL
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            setFileUrl(result);
            if (onFileSelected) onFileSelected(result);
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.error('上传失败:', error);
        // 上传失败时，使用本地Data URL作为备选
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setFileUrl(result);
          if (onFileSelected) onFileSelected(result);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploading(false);
      }
    }
  }, [acceptType]); // 注意：这里不包含 onFileSelected，因为它是每次调用时传入的参数

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    fileInputRef,
    fileUrl,
    isUploading,
    setFileUrl,
    handleFileSelect,
    handleButtonClick
  };
}