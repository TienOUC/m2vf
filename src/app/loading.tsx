export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-md w-full mx-auto text-center">
        {/* Logo/标题区域 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              M2V-Flow
            </span>
          </h1>
          <p className="text-gray-600">AI工作流编辑器</p>
        </div>

        {/* 加载动画 */}
        <div className="space-y-6">
          {/* 主加载动画 */}
          <div className="flex justify-center">
            <div className="relative">
              {/* 外圈旋转动画 */}
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>

              {/* 内圈旋转动画 */}
              <div className="w-8 h-8 border-2 border-purple-200 rounded-full absolute top-4 left-4"></div>
              <div
                className="w-8 h-8 border-2 border-purple-600 border-b-transparent rounded-full animate-spin absolute top-4 left-4"
                style={{ animationDirection: 'reverse' }}
              ></div>
            </div>
          </div>

          {/* 加载文本 */}
          <div className="space-y-2">
            <p className="text-gray-700 font-medium">正在加载...</p>
            <div className="flex justify-center space-x-1">
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              ></div>
            </div>
          </div>

          {/* 进度指示器 */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* 底部提示信息 */}
        <div className="mt-8 text-sm text-gray-500">
          <p>请稍等，正在为您准备最佳体验</p>
        </div>
      </div>
    </div>
  );
}
