/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], 
    } : false,
  },

  // 图片/视频mock源配置，仅在开发环境使用
  images: process.env.NODE_ENV === 'development' ? {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'test-videos.co.uk',
        pathname: '/**',
      },
    ],
  } : {},


  // 代理到后端，只在开发环境启用
  async rewrites() {
    // 只在开发环境启用代理
    if (process.env.NODE_ENV !== 'production') {
      return [
        {
          source: '/api/:path*/',  // 明确匹配尾部斜杠
          destination: 'http://47.92.68.167:59911/:path*/',
        },
        {
          source: '/api/:path*',  // 也匹配不带尾部斜杠的情况
          destination: 'http://47.92.68.167:59911/:path*',
        },
      ];
    }
    return [];
  },

  // 禁用自动添加尾部斜杠
  skipTrailingSlashRedirect: true,
}

export default nextConfig;
