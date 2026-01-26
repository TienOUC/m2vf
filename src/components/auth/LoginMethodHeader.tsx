'use client';

import { cn } from '@/lib/utils';

export type AccountLoginMethod = 'password' | 'phoneCode';

interface LoginMethodHeaderProps {
  isEmailCode: boolean;
  accountMethod: AccountLoginMethod;
  onAccountMethodChange: (method: AccountLoginMethod) => void;
}

export function LoginMethodHeader({ isEmailCode, accountMethod, onAccountMethodChange }: LoginMethodHeaderProps) {
  if (isEmailCode) {
    return (
      <div className="border-b border-neutral-200">
        <h3 className="py-2.5 px-1 text-[14px] font-medium text-primary border-b-2 border-primary">
          邮箱登录
        </h3>
      </div>
    );
  }

  return (
    <div className="flex gap-6 border-b border-neutral-200">
      <button
        type="button"
        className={cn(
          "py-2.5 px-1 text-[14px] font-medium transition-all relative",
          accountMethod === 'password'
            ? "text-primary border-b-2 border-primary"
            : "text-neutral-700 hover:text-primary"
        )}
        onClick={() => onAccountMethodChange('password')}
      >
        账号登录
      </button>
      <button
        type="button"
        className={cn(
          "py-2.5 px-1 text-[14px] font-medium transition-all relative",
          accountMethod === 'phoneCode'
            ? "text-primary border-b-2 border-primary"
            : "text-neutral-700 hover:text-primary"
        )}
        onClick={() => onAccountMethodChange('phoneCode')}
      >
        手机号登录
      </button>
    </div>
  );
}
