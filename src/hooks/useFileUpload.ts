import { useState, useEffect } from 'react';
import { useChatFilesStore, ChatFile } from '@/lib/stores/chatFilesStore';
import { generateId } from '@/lib/utils/id';
import { extractVideoThumbnail, revokeFileUrls } from '@/lib/utils/file';

export function useFileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<Array<ChatFile>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // 从全局状态获取聊天文件
  const { chatFiles, clearChatFiles } = useChatFilesStore();
  
  // 监听全局聊天文件变化，将新文件添加到本地状态
  useEffect(() => {
    if (chatFiles.length > 0) {
      const newFiles = chatFiles.map(file => ({
        id: file.id,
        file: file.file,
        thumbnailUrl: file.thumbnailUrl,
        type: file.type,
        url: file.url
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      // 清空全局状态，避免重复添加
      clearChatFiles();
    }
  }, [chatFiles, clearChatFiles]);
  
  // 处理文件选择
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      setUploadError(null);
      
      try {
        const newFiles: Array<ChatFile> = [];
        
        // 处理每个文件
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const id = generateId();
          const isImage = file.type.startsWith('image/');
          const isVideo = file.type.startsWith('video/');
          
          if (isImage || isVideo) {
            let thumbnailUrl: string;
            let url: string;
            
            if (isImage) {
              // 图片文件直接生成缩略图URL和临时URL
              thumbnailUrl = URL.createObjectURL(file);
              url = thumbnailUrl; // 本地文件临时使用object URL作为url
            } else {
              // 视频文件提取第一帧
              thumbnailUrl = await extractVideoThumbnail(file);
              url = URL.createObjectURL(file); // 本地视频临时使用object URL作为url
            }
            
            newFiles.push({
              id,
              file,
              thumbnailUrl,
              type: isImage ? 'image' : 'video',
              url
            });
          }
        }
        
        // 更新上传队列
        setUploadedFiles(prev => [...prev, ...newFiles]);
      } catch (error) {
        setUploadError('文件处理失败，请重试');
        console.error('File processing error:', error);
      } finally {
        setIsUploading(false);
        // 清空文件输入
        if (e.target) {
          e.target.value = '';
        }
      }
    }
  };
  
  // 处理资产选择
  const handleAssetSelect = (asset: { id: number; type: 'image' | 'video'; name: string; url: string }) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      
      // 创建模拟文件对象并添加到上传队列
      const mockFile = new File([], asset.name, { type: asset.type === 'image' ? 'image/jpeg' : 'video/mp4' });
      const newFile = {
        id: generateId(),
        file: mockFile,
        thumbnailUrl: asset.url,
        type: asset.type,
        url: asset.url
      };
      
      setUploadedFiles(prev => [...prev, newFile]);
      
      setTimeout(() => {
        setIsUploading(false);
      }, 1000);
    } catch (err) {
      setUploadError('资产上传失败，请重试');
      console.error('Asset upload error:', err);
    }
  };
  
  // 处理文件删除
  const handleFileDelete = (id: string) => {
    setUploadedFiles(prev => {
      const fileToDelete = prev.find(file => file.id === id);
      if (fileToDelete) {
        // 释放URL对象
        revokeFileUrls(fileToDelete);
      }
      return prev.filter(file => file.id !== id);
    });
  };
  
  // 清空所有文件
  const clearFiles = () => {
    setUploadedFiles(prev => {
      prev.forEach(file => revokeFileUrls(file));
      return [];
    });
  };
  
  return {
    uploadedFiles,
    isUploading,
    uploadError,
    handleFileChange,
    handleAssetSelect,
    handleFileDelete,
    clearFiles
  };
}
