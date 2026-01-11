import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 定义需要认证的路由
const protectedRoutes = ['/projects', '/edit'];

// 定义公共路由（不需要认证）
const publicRoutes = ['/login', '/register'];

// Token cookie 名称（与 STORAGE_KEYS 保持一致）
const ACCESS_TOKEN_COOKIE = 'access_token';

// 中间件函数
export function middleware(request: NextRequest) {
  // 从请求头获取 Cookie
  const cookies = request.cookies;
  
  // 获取 token
  const token = cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  
  // 获取当前请求路径
  const pathname = request.nextUrl.pathname;
  
  // 检查是否访问的是需要认证的路由
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // 检查是否访问的是公共路由
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // 处理未认证用户访问受保护路由的情况
  if (isProtectedRoute && !token) {
    // 重定向到登录页面，并携带当前路径作为重定向参数
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // 处理已认证用户访问公共路由（如登录、注册页面）的情况
  if (isPublicRoute && token) {
    // 重定向到项目管理页面
    return NextResponse.redirect(new URL('/projects', request.url));
  }
  
  // 允许请求继续
  return NextResponse.next();
}

// 配置中间件匹配的路径
export const config = {
  matcher: ['/', '/login', '/register', '/projects/:path*', '/edit/:path*']
};
