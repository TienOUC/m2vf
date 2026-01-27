// 提取视频第一帧作为缩略图
export async function extractVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);
    
    video.onloadedmetadata = () => {
      video.currentTime = 0;
    };
    
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnailUrl = canvas.toDataURL('image/jpeg');
      URL.revokeObjectURL(video.src);
      resolve(thumbnailUrl);
    };
  });
}

// 释放文件相关的 URL 对象
export function revokeFileUrls(file: { 
  thumbnailUrl?: string; 
  type?: 'image' | 'video'; 
  url?: string; 
}) {
  if (file?.thumbnailUrl) {
    try {
      URL.revokeObjectURL(file.thumbnailUrl);
    } catch {
      // 忽略无效 URL 的错误
    }
  }
  
  if (file?.type === 'video' && file?.url) {
    try {
      URL.revokeObjectURL(file.url);
    } catch {
      // 忽略无效 URL 的错误
    }
  }
}
