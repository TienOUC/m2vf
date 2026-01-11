import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* 卡片容器 */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-neutral-200">
          {children}
        </div>
      </div>
    </div>
  );
}
