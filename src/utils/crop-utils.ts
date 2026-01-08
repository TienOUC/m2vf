import type { ImageDimensions, CropCoordinates, FabricObject } from '@/types/fabric-image-editor';

export const calculateImageDimensions = (naturalWidth: number, naturalHeight: number): ImageDimensions => {
  const aspectRatio = naturalWidth / naturalHeight;
  
  // 计算图片放大比例和canvas尺寸
  const viewportWidth = window.innerWidth * 0.8;
  const viewportHeight = window.innerHeight * 0.8;
  
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
  const imgWidth = imageWidth * scale;
  const imgHeight = imageHeight * scale;
  
  // 计算裁剪框初始尺寸：图片的80%，保持宽高比
  const scaleFactor = 0.8;
  let cropWidth = imgWidth * scaleFactor;
  let cropHeight = imgHeight * scaleFactor;
  
  // 确保不小于最小裁剪尺寸
  cropWidth = Math.max(cropWidth, minCropSize.width);
  cropHeight = Math.max(cropHeight, minCropSize.height);

  // 计算裁剪框初始位置，使其居中显示
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
      cropHeight: 0,
      imgLeft: 0,
      imgTop: 0,
      imgScaleX: 1,
      imgScaleY: 1
    };
  }

  // 获取裁剪框在图片上的实际位置和尺寸（考虑缩放）
  const imgLeft = image.left || 0;
  const imgTop = image.top || 0;
  const imgScaleX = image.scaleX || 1;
  const imgScaleY = image.scaleY || 1;

  // 计算裁剪区域相对于原始图片的坐标
  const cropLeft = ((cropBox.left || 0) - imgLeft) / imgScaleX;
  const cropTop = ((cropBox.top || 0) - imgTop) / imgScaleY;
  const cropWidth = (cropBox.width || 0) / imgScaleX;
  const cropHeight = (cropBox.height || 0) / imgScaleY;

  return {
    cropLeft,
    cropTop,
    cropWidth,
    cropHeight,
    imgLeft,
    imgTop,
    imgScaleX,
    imgScaleY
  };
};

export const performCrop = (imageUrl: string, coordinates: CropCoordinates): Promise<string> => {
  return new Promise((resolve) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = coordinates.cropWidth;
    tempCanvas.height = coordinates.cropHeight;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) {
      resolve('');
      return;
    }

    const originalImage = new Image();
    originalImage.crossOrigin = 'anonymous';

    originalImage.onload = () => {
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
    };

    originalImage.onerror = () => {
      resolve('');
    };

    originalImage.src = imageUrl;
  });
};