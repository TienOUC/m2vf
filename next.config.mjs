/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生产环境下移除 console.log
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'], // 保留 console.error 和 console.warn
    },
  },

  // 代理到后端，只在开发环境启用
  async rewrites() {
    // 只在开发环境启用代理
    if (process.env.NODE_ENV !== 'production') {
      return [
        {
          source: '/api2/:path*/',  // 明确匹配尾部斜杠
          destination: 'http://115.190.176.116:8001/:path*/',
        },
        {
          source: '/api2/:path*',  // 也匹配不带尾部斜杠的情况
          destination: 'http://115.190.176.116:8001/:path*',
        },
      ];
    }
    return [];
  },

  // 禁用自动添加尾部斜杠
  skipTrailingSlashRedirect: true,
}

export default nextConfig;
