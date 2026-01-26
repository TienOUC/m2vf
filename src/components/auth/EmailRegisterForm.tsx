'use client';

import { Mail } from 'lucide-react';

interface EmailRegisterFormProps {
  email: string;
  error?: string;
  touched?: boolean;
  onEmailChange: (value: string) => void;
  onEmailBlur: () => void;
}

export function EmailRegisterForm({
  email,
  error,
  touched,
  onEmailChange,
  onEmailBlur
}: EmailRegisterFormProps) {
  return (
    <div>
      <label className="block text-[13px] font-medium mb-2 text-gray-700">
        邮箱地址 *
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
      {touched && error && (
        <p className="mt-1 text-sm text-error-700">{error}</p>
      )}
    </div>
  );
}
