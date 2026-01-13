'use client';

import { useEffect, useState } from 'react';

interface ScanningAnimationProps {
  /** 是否显示动画 */
  isActive?: boolean;
  /** 动画持续时间（毫秒） */
  duration?: number;
  /** 动画完成回调 */
  onComplete?: () => void;
  /** 容器类名 */
  className?: string;
}

/**
 * 垂直扫描动画组件
 * 从左到右的扫描效果，用于表示图片处理进度
 */
export const ScanningAnimation: React.FC<ScanningAnimationProps> = ({
  isActive = true,
  duration = 1500,
  onComplete,
  className = ''
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      return;
    }

    const startTime = Date.now();
    let animationFrameId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);

      if (newProgress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isActive, duration, onComplete]);

  // 计算扫描条位置
  const scanPosition = progress * 100; // 百分比位置

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-md bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 ${className}`}>
      {/* 动态网格效果 */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(0deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* 扫描条 */}
      <div
        className="absolute top-0 bottom-0 w-10 transition-all duration-100 ease-out"
        style={{
          left: `${scanPosition}%`,
          transform: 'translateX(-20px)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-lg shadow-blue-500/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent blur-sm opacity-60" />
      </div>

      {/* 进度指示器 */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center">
        <div className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>处理中 {Math.round(progress * 100)}%</span>
        </div>
      </div>

      {/* 处理中文字提示 */}
      <div className="absolute top-2 left-0 right-0 flex justify-center">
        <div className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
          图片抠图中...
        </div>
      </div>

      {/* 动态光点效果 */}
      <div className="absolute inset-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + Math.sin(i) * 20}%`,
              animationDelay: `${i * 0.3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ScanningAnimation;