'use client';

import React, { useCallback } from 'react';

interface UploadManagerProps {
  onUploadImage?: () => void;
  onUploadVideo?: () => void;
}

const UploadManager: React.FC<UploadManagerProps> = ({ 
  onUploadImage, 
  onUploadVideo 
}) => {
  // 处理图片上传
  const handleUploadImage = useCallback(() => {
    console.log('上传图片功能');
    if (onUploadImage) {
      onUploadImage();
    } else {
      alert('上传图片功能即将实现');
    }
  }, [onUploadImage]);

  // 处理视频上传
  const handleUploadVideo = useCallback(() => {
    console.log('上传视频功能');
    if (onUploadVideo) {
      onUploadVideo();
    } else {
      alert('上传视频功能即将实现');
    }
  }, [onUploadVideo]);

  return null;
};

export default UploadManager;