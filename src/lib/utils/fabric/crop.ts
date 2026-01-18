import type { ImageDimensions, CropCoordinates, FabricObject } from '@/types/editor/fabric';

export const calculateImageDimensions = (naturalWidth: number, naturalHeight: number): ImageDimensions => {
  const aspectRatio = naturalWidth / naturalHeight;
  
  // 计算图片放大比例和canvas尺寸
  // 添加客户端检查，避免服务器端渲染问题
  const isClient = typeof window !== 'undefined';
  const viewportWidth = isClient ? window.innerWidth * 0.8 : 800;
  const viewportHeight = isClient ? window.innerHeight * 0.8 : 600;
  
  // 确保图片完全显示在viewport内，并且不超过80%的视口大小
  let scale: number;
  if (aspectRatio >= 1) {
    // 横屏或正方形图片：以宽度为基准
    scale = Math.min(viewportWidth / naturalWidth, viewportHeight / naturalHeight);
  } else {
    // 竖屏图片：以高度为基准
    scale = Math.min(viewportHeight / naturalHeight, viewportWidth / naturalWidth);
  }

  const scaledWidth = naturalWidth * scale;
  const scaledHeight = naturalHeight * scale;

  return {
    width: naturalWidth,
    height: naturalHeight,
    aspectRatio,
    scale,
    scaledWidth,
    scaledHeight
  };
};

export const calculateCropBoxPosition = (imageWidth: number, imageHeight: number, scale: number, minCropSize: { width: number; height: number }) => {
  // 如果scale为1，说明传入的尺寸已经是画布上的实际尺寸
  const imgWidth = scale === 1 ? imageWidth : imageWidth * scale;
  const imgHeight = scale === 1 ? imageHeight : imageHeight * scale;
  
  // 计算裁剪框初始尺寸：图片的80%，保持宽高比
  const scaleFactor = 0.8;
  let cropWidth = imgWidth * scaleFactor;
  let cropHeight = imgHeight * scaleFactor;
  
  // 确保不小于最小裁剪尺寸
  cropWidth = Math.max(cropWidth, minCropSize.width);
  cropHeight = Math.max(cropHeight, minCropSize.height);

  // 确保裁剪框不超过图片尺寸
  cropWidth = Math.min(cropWidth, imgWidth);
  cropHeight = Math.min(cropHeight, imgHeight);

  // 基于左上角原点(0,0)，计算裁剪框居中位置
  const cropBoxLeft = (imgWidth - cropWidth) / 2;
  const cropBoxTop = (imgHeight - cropHeight) / 2;

  return {
    width: cropWidth,
    height: cropHeight,
    left: cropBoxLeft,
    top: cropBoxTop
  };
};

export const calculateCropCoordinates = (image: FabricObject | null, cropBox: FabricObject | null): CropCoordinates => {
  if (!image || !cropBox) {
    return {
      cropLeft: 0,
      cropTop: 0,
      cropWidth: 0,
      cropHeight: 0
    };
  }

  // 获取图片的变换信息
  const imgLeft = image.left || 0;
  const imgTop = image.top || 0;
  const imgScaleX = image.scaleX || 1;
  const imgScaleY = image.scaleY || 1;
  const imgWidth = (image.width || 0) * imgScaleX;
  const imgHeight = (image.height || 0) * imgScaleY;

  // 获取裁剪框的变换信息
  const cropBoxLeft = cropBox.left || 0;
  const cropBoxTop = cropBox.top || 0;
  // 裁剪框的缩放只是UI效果，不影响实际裁剪尺寸
  const cropBoxWidth = cropBox.width || 0;
  const cropBoxHeight = cropBox.height || 0;

  // 计算裁剪框相对于图片左上角的坐标（考虑图片的缩放和位置）
  // 裁剪框在画布坐标系中的坐标需要转换为相对于图片的坐标
  const relativeLeft = cropBoxLeft - imgLeft;
  const relativeTop = cropBoxTop - imgTop;

  // 确保裁剪框在图片范围内
  const constrainedLeft = Math.max(0, Math.min(relativeLeft, imgWidth - cropBoxWidth));
  const constrainedTop = Math.max(0, Math.min(relativeTop, imgHeight - cropBoxHeight));

  // 将画布坐标转换为原始图片坐标（考虑缩放）
  const cropLeft = constrainedLeft / imgScaleX;
  const cropTop = constrainedTop / imgScaleY;
  const cropWidth = cropBoxWidth / imgScaleX;
  const cropHeight = cropBoxHeight / imgScaleY;

  return {
    cropLeft,
    cropTop,
    cropWidth,
    cropHeight
  };
};

export const performCrop = (imageUrl: string, coordinates: CropCoordinates): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 验证裁剪参数
    if (coordinates.cropWidth <= 0 || coordinates.cropHeight <= 0) {
      reject(new Error('Invalid crop dimensions: width and height must be positive'));
      return;
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = coordinates.cropWidth;
    tempCanvas.height = coordinates.cropHeight;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    const originalImage = new Image();
    originalImage.crossOrigin = 'anonymous';

    originalImage.onload = () => {
      try {
        tempCtx.drawImage(
          originalImage,
          coordinates.cropLeft,
          coordinates.cropTop,
          coordinates.cropWidth,
          coordinates.cropHeight,
          0,
          0,
          coordinates.cropWidth,
          coordinates.cropHeight
        );

        const croppedImageUrl = tempCanvas.toDataURL('image/png');
        resolve(croppedImageUrl);
      } catch (error) {
        reject(new Error(`Failed to draw image: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    originalImage.onerror = () => {
      reject(new Error(`Failed to load image from URL: ${imageUrl}`));
    };

    originalImage.src = imageUrl;
  });
};