'use client';

import { Mail } from 'lucide-react';
import { CountDownButton } from '@/components/auth/CountDownButton';
import { validateEmail } from '@/lib/utils/validation';

interface EmailLoginFormProps {
  email: string;
  code: string;
  isLoading: boolean;
  errors: { email?: string; code?: string };
  touched: { email?: boolean; code?: boolean };
  onEmailChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onEmailBlur: () => void;
  onCodeBlur: () => void;
  onSendCode: () => void;
}

export function EmailLoginForm({
  email,
  code,
  isLoading,
  errors,
  touched,
  onEmailChange,
  onCodeChange,
  onEmailBlur,
  onCodeBlur,
  onSendCode
}: EmailLoginFormProps) {
  return (
    <>
      <div>
        <label className="block text-[13px] font-medium mb-2 text-gray-700">
          邮箱地址
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-xl pl-11 pr-4 py-3.5 text-[14px] bg-white border border-neutral-200 text-gray-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-300 transition-colors"
            placeholder="请输入您的邮箱地址"
            value={email}
            onBlur={onEmailBlur}
            onChange={(e) => onEmailChange(e.target.value)}
          />
        </div>
        {touched.email && errors.email && (
          <p className="mt-1 text-sm text-error-700">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-[13px] font-medium mb-2 text-gray-700">
          验证码
        </label>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              id="email-code"
              name="email-code"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              className="w-full rounded-xl pl-4 pr-4 py-3.5 text-[14px] bg-white border border-neutral-200 text-gray-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-300 transition-colors"
              placeholder="请输入6位验证码"
              value={code}
              onBlur={onCodeBlur}
              onChange={(e) => onCodeChange(e.target.value)}
            />
            {touched.code && errors.code && (
              <p className="mt-1 text-sm text-error-700">{errors.code}</p>
            )}
          </div>
          
          <div>
            <CountDownButton
              isLoading={isLoading}
              disabled={!email || !!validateEmail(email)}
              onClick={onSendCode}
              initialText="获取验证码"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </>
  );
}
