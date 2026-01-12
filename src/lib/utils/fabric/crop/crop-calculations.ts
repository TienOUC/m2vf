import type { ImageInfo } from '@/types/crop';
import type { FabricObject } from '@/types/editor/fabric';

/**
 * 裁剪计算相关工具函数
 */

/**
 * 计算图片尺寸和缩放比例
 */
export const calculateImageDimensions = (
  naturalWidth: number,
  naturalHeight: number
): ImageInfo => {
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

  // 限制最大缩放比例，避免图片过大
  scale = Math.min(scale, 1);

  const scaledWidth = naturalWidth * scale;
  const scaledHeight = naturalHeight * scale;

  return {
    url: '', // 需要在调用时设置
    naturalWidth,
    naturalHeight,
    aspectRatio,
    scale,
    scaledWidth,
    scaledHeight,
    left: 0,
    top: 0
  };
};

/**
 * 计算裁剪框初始位置和尺寸
 */
export const calculateCropBoxPosition = (
  imageWidth: number,
  imageHeight: number,
  scale: number,
  minCropSize: { width: number; height: number }
) => {
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

/**
 * 计算裁剪坐标
 */


/**
 * 约束裁剪框在图片区域内
 */
export const constrainCropBoxToBounds = (
  cropBox: FabricObject,
  imageBounds: { left: number; top: number; width: number; height: number }
) => {
  if (!cropBox) return;

  // 获取裁剪框当前状态
  const cropBounds = cropBox.getBoundingRect(true);
  let newLeft = cropBounds.left;
  let newTop = cropBounds.top;
  let newWidth = cropBox.width || 0;
  let newHeight = cropBox.height || 0;

  // 最小尺寸约束
  const minWidth = 50;
  const minHeight = 50;
  newWidth = Math.max(minWidth, newWidth);
  newHeight = Math.max(minHeight, newHeight);

  // 最大尺寸约束
  newWidth = Math.min(newWidth, imageBounds.width);
  newHeight = Math.min(newHeight, imageBounds.height);

  // 边界位置约束
  newLeft = Math.max(imageBounds.left, Math.min(newLeft, imageBounds.left + imageBounds.width - newWidth));
  newTop = Math.max(imageBounds.top, Math.min(newTop, imageBounds.top + imageBounds.height - newHeight));

  // 应用约束
  cropBox.set({
    left: newLeft,
    top: newTop,
    width: newWidth,
    height: newHeight
  });
  cropBox.setCoords();
};