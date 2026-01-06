'use client';
import Link from 'next/link';
import {
  BoltIcon,
  CpuChipIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full mx-auto">
        {/* 欢迎语部分 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-6 leading-tight">
            <span className="block text-primary-600">M2VF</span>
          </h1>
          <p className="text-xl md:text-2xl text-neutral-700 max-w-3xl mx-auto leading-relaxed">
            图文智能生成视频，让你的创意实现更便捷
          </p>
        </div>

        {/* 特性展示 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-neutral-200">
            <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <BoltIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">
              快速构建
            </h3>
            <p className="text-neutral-600 leading-relaxed">
              可视化编排界面，快速创建复杂工作流，让创意即刻实现
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm border border-neutral-200">
            <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <CpuChipIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">AI智能</h3>
            <p className="text-neutral-600 leading-relaxed">
              集成多种AI模型，实现智能自动化，让工作更高效
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm border border-neutral-200">
            <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <ArrowsRightLeftIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">
              多模态支持
            </h3>
            <p className="text-neutral-600 leading-relaxed">
              支持文本、图像、音频等多种数据格式，满足多样化需求
            </p>
          </div>
        </div>

        {/* 行动按钮 */}
        <div className="text-center space-y-6">
          <Link
            href="/login"
            className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-semibold text-lg px-12 py-4 rounded-lg transition-colors"
          >
            <BoltIcon className="w-5 h-5 mr-2" />
            开始使用 - 立即登录
          </Link>
          <div className="text-neutral-600 text-sm">
            还没有账户？{' '}
            <Link
              href="/register"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              点击注册
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
