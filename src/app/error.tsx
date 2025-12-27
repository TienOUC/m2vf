'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 记录错误到错误报告服务
    console.error('应用错误:', error);
  }, [error]);

  const handleReset = () => {
    // 尝试重置错误边界
    reset();
  };

  const handleReload = () => {
    // 完全重新加载页面
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full mx-auto text-center">
        {/* 错误图标 */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto relative">
            {/* 错误图标动画 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-red-500 animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {/* 闪烁的警示点 */}
            <div className="absolute top-2 right-2 w-4 h-4 bg-yellow-500 rounded-full animate-ping"></div>
            <div className="absolute top-2 right-2 w-4 h-4 bg-yellow-400 rounded-full"></div>
          </div>
        </div>

        {/* 错误信息 */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            出了点问题
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            抱歉，应用遇到了一个意外错误
          </p>

          {/* 详细错误信息（开发环境显示） */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left max-w-md mx-auto">
              <div className="text-sm font-mono text-red-800">
                <div className="font-semibold mb-2">错误详情:</div>
                <div className="break-words">{error.message}</div>
                {error.digest && (
                  <div className="mt-2">
                    <span className="font-semibold">错误ID:</span>{' '}
                    {error.digest}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
