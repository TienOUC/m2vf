import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  leftContent?: ReactNode;
  gradient?: 'login' | 'register';
}

export function AuthLayout({ children, leftContent, gradient = 'login' }: AuthLayoutProps) {
  const getGradientClass = () => {
    switch (gradient) {
      case 'login':
        return 'bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100';
      case 'register':
        return 'bg-gradient-to-br from-rose-100 via-purple-50 to-indigo-100';
      default:
        return 'bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100';
    }
  };

  return (
    <div className="min-h-screen font-sans bg-neutral-50 text-gray-900 flex">
      <div className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${getGradientClass()}`}>
        <div className="absolute inset-0">
          {gradient === 'login' && (
            <>
              <div className="absolute w-96 h-96 rounded-full blur-3xl bg-emerald-300/40 top-20 left-20" />
              <div className="absolute w-80 h-80 rounded-full blur-3xl bg-cyan-300/40 bottom-20 right-20" />
              <div className="absolute w-72 h-72 rounded-full blur-3xl bg-amber-200/40 top-1/2 left-1/3" />
            </>
          )}
          
          {gradient === 'register' && (
            <>
              <div className="absolute w-96 h-96 rounded-full blur-3xl bg-rose-300/40 top-20 left-20" />
              <div className="absolute w-80 h-80 rounded-full blur-3xl bg-purple-300/40 bottom-20 right-20" />
              <div className="absolute w-72 h-72 rounded-full blur-3xl bg-indigo-200/40 top-1/2 left-1/3" />
            </>
          )}
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16">
          {leftContent}
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col">
        {children}
      </div>
    </div>
  );
}
