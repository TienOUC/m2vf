/**
 * 下载图片工具函数
 * @param imageUrl 图片URL
 * @param filename 文件名（可选）
 * @returns Promise<boolean> 下载是否成功
 */
export const downloadImage = async (imageUrl: string, filename?: string): Promise<boolean> => {
  try {
    // 获取图片扩展名
    const extension = getImageExtension(imageUrl);
    
    // 如果没有提供文件名，则使用当前时间戳
    const defaultFilename = `image-${Date.now()}.${extension}`;
    const finalFilename = filename || defaultFilename;
    
    // 获取图片数据
    const response = await fetch(imageUrl, {
      mode: 'cors', // 支持跨域
      headers: {
        'Accept': 'image/*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`图片请求失败: ${response.status}`);
    }
    
    // 将响应转换为Blob
    const blob = await response.blob();
    
    // 创建下载链接
    const downloadUrl = window.URL.createObjectURL(blob);
    
    // 创建a标签并触发下载
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = finalFilename;
    link.style.display = 'none';
    
    // 添加到文档并触发点击
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    return true;
  } catch (error) {
    console.error('图片下载失败:', error);
    alert('图片下载失败，请稍后重试');
    return false;
  }
};

/**
 * 获取图片扩展名
 * @param imageUrl 图片URL
 * @returns string 图片扩展名
 */
export const getImageExtension = (imageUrl: string): string => {
  // 从URL中提取扩展名
  const matches = imageUrl.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i);
  if (matches && matches[1]) {
    return matches[1].toLowerCase();
  }
  
  // 如果没有找到扩展名，默认为png
  return 'png';
};
