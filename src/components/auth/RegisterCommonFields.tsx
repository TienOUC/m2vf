'use client';

import { UserRound } from 'lucide-react';
import { PasswordInput } from '@/components/auth/PasswordInput';

interface RegisterCommonFieldsProps {
  name: string;
  password: string;
  confirmPassword: string;
  errors: { name?: string; password?: string; confirmPassword?: string };
  touched: { name?: boolean; password?: boolean; confirmPassword?: boolean };
  onNameChange: (value: string) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNameBlur: () => void;
  onPasswordBlur: () => void;
  onConfirmPasswordBlur: () => void;
}

export function RegisterCommonFields({
  name,
  password,
  confirmPassword,
  errors,
  touched,
  onNameChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onNameBlur,
  onPasswordBlur,
  onConfirmPasswordBlur
}: RegisterCommonFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-[13px] font-medium mb-2 text-gray-700">
          姓名 *
        </label>
        <div className="relative">
          <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className="w-full rounded-xl pl-11 pr-4 py-3.5 text-[14px] bg-white border border-neutral-200 text-gray-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-300 transition-colors"
            placeholder="请输入您的姓名"
            value={name}
            onBlur={onNameBlur}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>
        {touched.name && errors.name && (
          <p className="mt-1 text-sm text-error-700">{errors.name}</p>
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

      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        value={confirmPassword}
        onChange={onConfirmPasswordChange}
        onBlur={onConfirmPasswordBlur}
        placeholder="请再次输入密码"
        error={errors.confirmPassword}
        touched={touched.confirmPassword}
      />
    </>
  );
}
