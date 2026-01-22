import Link from 'next/link';

interface AuthFooterProps {
  isLogin: boolean;
}

export function AuthFooter({ isLogin }: AuthFooterProps) {
  return (
    <>
      <p className="text-[14px] mb-8 hidden lg:block text-neutral-500">
        {isLogin ? '还没有账户？' : '已有账户？'} {' '}
        <Link 
          href={isLogin ? '/register' : '/login'} 
          className="font-medium text-primary hover:text-primary/90 transition-colors"
        >
          {isLogin ? '立即注册' : '立即登录'}
        </Link>
      </p>
      
      <p className="text-[14px] text-center mt-8 lg:hidden text-neutral-500">
        {isLogin ? '还没有账户？' : '已有账户？'} {' '}
        <Link 
          href={isLogin ? '/register' : '/login'} 
          className="font-medium text-primary hover:text-primary/90 transition-colors"
        >
          {isLogin ? '立即注册' : '立即登录'}
        </Link>
      </p>
    </>
  );
}
