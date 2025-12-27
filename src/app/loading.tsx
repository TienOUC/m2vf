export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-md w-full mx-auto text-center">
        {/* Logo/标题区域 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              M2VF
            </span>
          </h1>
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
        </div>
      </div>
    </div>
  );
}
