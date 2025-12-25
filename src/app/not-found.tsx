'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full mx-auto text-center">
        {/* 错误代码和标题 */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            页面未找到
          </h1>
          <p className="text-xl text-gray-600 max-w-md mx-auto">
            抱歉，您访问的页面不存在或已被移动
          </p>
        </div>

        {/* 插图或图标 */}
        <div className="mb-8">
          <div className="w-48 h-48 mx-auto relative">
            {/* 搜索图标动画 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 border-4 border-gray-300 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-400 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="w-16 h-4 bg-gray-300 absolute top-3/4 left-3/4 transform rotate-45"></div>
            </div>

            {/* 飘动的元素 */}
            <div className="absolute top-4 left-4 w-6 h-6 bg-blue-500 rounded-full animate-bounce"></div>
            <div
              className="absolute top-8 right-8 w-4 h-4 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: '200ms' }}
            ></div>
            <div
              className="absolute bottom-8 left-8 w-5 h-5 bg-green-500 rounded-full animate-bounce"
              style={{ animationDelay: '400ms' }}
            ></div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-4 mb-8">
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg px-8 py-3 rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
          >
            返回首页
          </Link>
          <div className="text-sm">
            <button
              onClick={() => window.history.back()}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              返回上一页
            </button>
          </div>
        </div>

        {/* 有用的链接 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <Link
            href="/login"
            className="p-4 bg-white/50 backdrop-blur-sm rounded-lg hover:bg-white/70 transition"
          >
            <div className="font-medium text-gray-900">登录</div>
            <div className="text-gray-600">访问您的账户</div>
          </Link>

          <Link
            href="/register"
            className="p-4 bg-white/50 backdrop-blur-sm rounded-lg hover:bg-white/70 transition"
          >
            <div className="font-medium text-gray-900">注册</div>
            <div className="text-gray-600">创建新账户</div>
          </Link>

          <Link
            href="/edit"
            className="p-4 bg-white/50 backdrop-blur-sm rounded-lg hover:bg-white/70 transition"
          >
            <div className="font-medium text-gray-900">编辑器</div>
            <div className="text-gray-600">开始创建工作流</div>
          </Link>
        </div>

        {/* 技术支持信息 */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            如果您认为这是一个错误，请联系{' '}
            <a
              href="mailto:support@m2vflow.com"
              className="text-blue-600 hover:text-blue-700"
            >
              技术支持
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
