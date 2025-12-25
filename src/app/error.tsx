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

        {/* 操作按钮 */}
        <div className="space-y-4 mb-8">
          <button
            onClick={handleReset}
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg px-8 py-3 rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
          >
            重试操作
          </button>

          <button
            onClick={handleReload}
            className="block mx-auto text-blue-600 hover:text-blue-700 font-medium underline text-sm"
          >
            重新加载页面
          </button>
        </div>

        {/* 故障排除建议 */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">故障排除建议</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-left">
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span>检查网络连接</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span>清除浏览器缓存</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span>等待几分钟后重试</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span>联系技术支持</span>
              </div>
            </div>
          </div>
        </div>

        {/* 技术支持信息 */}
        <div className="text-sm text-gray-500">
          <p>
            如果问题持续存在，请联系{' '}
            <a
              href="mailto:support@m2vflow.com"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              技术支持
            </a>
          </p>
          {error.digest && <p className="mt-1">错误ID: {error.digest}</p>}
        </div>
      </div>
    </div>
  );
}
