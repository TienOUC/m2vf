import { useState, useCallback, useRef, useEffect } from 'react';

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
        // 使用本地Data URL处理文件
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setFileUrl(result);
          if (onFileSelected) onFileSelected(result);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('文件处理失败:', error);
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