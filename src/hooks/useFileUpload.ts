import { useState, useCallback, useRef } from 'react';

export function useFileUpload(acceptType: string) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileUrl, setFileUrl] = useState<string>('');

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, onFileSelected?: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith(acceptType)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFileUrl(result);
        onFileSelected && onFileSelected(result);
      };
      reader.readAsDataURL(file);
    }
  }, [acceptType]);

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