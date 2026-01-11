// 图片上传相关的 mock 逻辑

export const handleImageUploadMock = (url: string, options: RequestInit): Promise<Response> | null => {
  const imageUploadMatch = url.match(/api\/images\/api\/projects\/(\d+)\/folders\/(\d+)\/images\/upload\//);
  if (!imageUploadMatch) return null;

  return new Promise((resolve) => {
    setTimeout(() => {
      const projectId = imageUploadMatch[1];
      const folderId = imageUploadMatch[2];
      const formData = options.body as FormData;
      const imageName = formData.get('name') as string || 'test-image.jpg';
      
      // 生成随机ID
      const imageId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // 创建模拟响应数据
      const mockData = {
        status: 200,
        message: '上传成功',
        data: {
          id: imageId,
          name: imageName,
          url: `/test-images/test.jpg`,
          thumbnail_url: `/test-images/test.jpg`,
          width: 1920,
          height: 1080,
          size: Math.floor(Math.random() * (1024000 - 1024 + 1)) + 1024, // 1KB - 1MB
          uploaded_at: new Date().toISOString(),
          folder_id: parseInt(folderId),
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
    }, 500);
  });
};
