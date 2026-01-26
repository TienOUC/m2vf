'use client';

import Link from 'next/link';
import { SquareUserRound } from 'lucide-react';
import { PasswordInput } from '@/components/auth/PasswordInput';

interface PasswordLoginFormProps {
  credential: string;
  password: string;
  errors: { credential?: string; password?: string };
  touched: { credential?: boolean; password?: boolean };
  onCredentialChange: (value: string) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCredentialBlur: () => void;
  onPasswordBlur: () => void;
}

export function PasswordLoginForm({
  credential,
  password,
  errors,
  touched,
  onCredentialChange,
  onPasswordChange,
  onCredentialBlur,
  onPasswordBlur
}: PasswordLoginFormProps) {
  return (
    <>
      <div>
        <label className="block text-[13px] font-medium mb-2 text-gray-700">
          账号
        </label>
        <div className="relative">
          <SquareUserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            id="credential"
            name="credential"
            type="text"
            autoComplete="username"
            required
            className="w-full rounded-xl pl-11 pr-4 py-3.5 text-[14px] bg-white border border-neutral-200 text-gray-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-300 transition-colors"
            placeholder="请输入邮箱或手机号"
            value={credential}
            onBlur={onCredentialBlur}
            onChange={(e) => onCredentialChange(e.target.value)}
          />
        </div>
        {touched.credential && errors.credential && (
          <p className="mt-1 text-sm text-error-700">{errors.credential}</p>
        )}
      </div>

      <PasswordInput
        id="password"
        name="password"
        value={password}
        onChange={onPasswordChange}
        onBlur={onPasswordBlur}
        error={errors.password}
        touched={touched.password}
      />

      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-[13px] text-gray-500 hover:text-gray-700 transition-colors">
          忘记密码？
        </Link>
      </div>
    </>
  );
}
