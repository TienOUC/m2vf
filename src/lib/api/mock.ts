import Mock from 'mockjs';

// Mock图片上传响应
Mock.mock(/api\/images\/api\/projects\/\d+\/folders\/\d+\/images\/upload\//, 'post', (options) => {
  // 模拟上传延迟
  return new Promise((resolve) => {
    setTimeout(() => {
      // 生成随机图片ID
      const imageId = Mock.Random.id();
      const imageName = options.body?.get('name') || 'test-image.jpg';
      
      resolve({
        status: 200,
        message: '上传成功',
        data: {
          id: imageId,
          name: imageName,
          url: `/test-images/${imageId}.jpg`,
          thumbnail_url: `/test-images/${imageId}-thumb.jpg`,
          width: 1920,
          height: 1080,
          size: Mock.Random.integer(1024, 1024000), // 1KB - 1MB
          uploaded_at: Mock.Random.datetime(),
          folder_id: parseInt(options.url.match(/\/folders\/(\d+)\//)?.[1] || '0'),
          project_id: parseInt(options.url.match(/\/projects\/(\d+)\//)?.[1] || '0'),
          description: options.body?.get('description') || ''
        }
      });
    }, 500);
  });
});

// Mock视频上传响应
Mock.mock(/api\/images\/api\/projects\/\d+\/(folders\/\d+\/)?videos\/upload\//, 'post', (options) => {
  // 模拟上传延迟
  return new Promise((resolve) => {
    setTimeout(() => {
      // 生成随机视频ID
      const videoId = Mock.Random.id();
      const videoName = options.body?.get('name') || 'test-video.mp4';
      
      resolve({
        status: 200,
        message: '上传成功',
        data: {
          id: videoId,
          name: videoName,
          url: `/test-images/${videoId}.mp4`,
          thumbnail_url: `/test-images/${videoId}-thumb.jpg`,
          duration: Mock.Random.integer(10, 300), // 10秒 - 5分钟
          width: 1920,
          height: 1080,
          size: Mock.Random.integer(1024000, 102400000), // 1MB - 100MB
          uploaded_at: Mock.Random.datetime(),
          folder_id: options.url.includes('/folders/') ? parseInt(options.url.match(/\/folders\/(\d+)\//)?.[1] || '0') : null,
          project_id: parseInt(options.url.match(/\/projects\/(\d+)\//)?.[1] || '0'),
          description: options.body?.get('description') || ''
        }
      });
    }, 1000);
  });
});

// 初始化Mock
if (process.env.NODE_ENV === 'development') {
  Mock.setup({
    timeout: '300-1000'
  });
  console.log('Mock API initialized');
}

export default Mock;
