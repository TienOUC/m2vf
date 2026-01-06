import { useState, useCallback, useRef, useEffect } from 'react';

export function useFileUpload(acceptType: string, initialUrl?: string) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileUrl, setFileUrl] = useState<string>(initialUrl || '');

  // 当initialUrl变化时，同步更新本地状态
  useEffect(() => {
    if (initialUrl) {
      setFileUrl(initialUrl);
    }
  }, [initialUrl]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, onFileSelected?: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith(acceptType)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFileUrl(result);
        if (onFileSelected) onFileSelected(result);
      };
      reader.readAsDataURL(file);
    }
  }, [acceptType]); // 注意：这里不包含 onFileSelected，因为它是每次调用时传入的参数

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    fileInputRef,
    fileUrl,
    setFileUrl,
    handleFileSelect,
    handleButtonClick
  };
}