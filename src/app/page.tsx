'use client';

import Link from 'next/link';
import {
  BoltIcon,
  CpuChipIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-background to-primary-50 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full mx-auto">
        {/* 欢迎语部分 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            {/* 欢迎来到 */}
            <span className="block bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-800 bg-clip-text text-transparent">
              M2VF
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground max-w-3xl mx-auto leading-relaxed">
            图文智能生成视频，让你的创意实现更便捷
          </p>
        </div>

        {/* 特性展示 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-background/20">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <BoltIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                快速构建
              </h3>
              <p className="text-foreground leading-relaxed">
                可视化编排界面，快速创建复杂工作流，让创意即刻实现
              </p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-success-600 to-success-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-background/20">
              <div className="w-16 h-16 bg-gradient-to-br from-success-100 to-success-200 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <CpuChipIcon className="w-8 h-8 text-success-600" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">AI智能</h3>
              <p className="text-foreground leading-relaxed">
                集成多种AI模型，实现智能自动化，让工作更高效
              </p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-secondary-600 to-secondary-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-background/20">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <ArrowsRightLeftIcon className="w-8 h-8 text-secondary-600" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                多模态支持
              </h3>
              <p className="text-foreground leading-relaxed">
                支持文本、图像、音频等多种数据格式，满足多样化需求
              </p>
            </div>
          </div>
        </div>

        {/* 行动按钮 */}
        <div className="text-center space-y-6">
          <Link
            href="/login"
            className="inline-flex items-center justify-center bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold text-lg px-12 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <BoltIcon className="w-5 h-5 mr-2" />
            开始使用 - 立即登录
          </Link>
          <div className="text-foreground text-sm">
            还没有账户？{' '}
            <Link
              href="/register"
              className="text-primary-600 hover:text-primary-700 font-medium  transition-colors"
            >
              点击注册
            </Link>
          </div>
        </div>

        {/* 装饰元素 */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-warning-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-error-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
