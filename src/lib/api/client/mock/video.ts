// 视频上传相关的 mock 逻辑

export const handleVideoUploadMock = (url: string, options: RequestInit): Promise<Response> | null => {
  // 匹配完整的URL路径，包括可能的域名
  const videoUploadMatch = url.match(/\/api\/images\/api\/projects\/(\d+)\/(?:folders\/(\d+)\/)?videos\/upload\//);
  if (!videoUploadMatch) return null;

  return new Promise((resolve) => {
    setTimeout(() => {
      const projectId = videoUploadMatch[1];
      const folderId = videoUploadMatch[2] ? parseInt(videoUploadMatch[2]) : null;
      const formData = options.body as FormData;
      const videoName = formData.get('name') as string || 'test-video.mp4';
      
      // 生成随机ID
      const videoId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // 创建模拟响应数据
      const mockData = {
        status: 200,
        message: '上传成功',
        data: {
          id: videoId,
          name: videoName,
          url: `/video/test.mp4`, // 使用真实的视频文件
          thumbnail_url: `/test-images/cat.jpeg`, // 缩略图仍然使用图片
          duration: Math.floor(Math.random() * (300 - 10 + 1)) + 10, // 10秒 - 5分钟
          width: 1920,
          height: 1080,
          size: Math.floor(Math.random() * (102400000 - 1024000 + 1)) + 1024000, // 1MB - 100MB
          uploaded_at: new Date().toISOString(),
          folder_id: folderId,
          project_id: parseInt(projectId),
          description: formData.get('description') as string || ''
        }
      };
      
      // 创建 Response 对象
      resolve(new Response(JSON.stringify(mockData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }));
    }, 1000);
  });
};
