'use client';

import { Phone } from 'lucide-react';

interface PhoneRegisterFormProps {
  phoneNumber: string;
  error?: string;
  touched?: boolean;
  onPhoneChange: (value: string) => void;
  onPhoneBlur: () => void;
}

export function PhoneRegisterForm({
  phoneNumber,
  error,
  touched,
  onPhoneChange,
  onPhoneBlur
}: PhoneRegisterFormProps) {
  return (
    <div>
      <label className="block text-[13px] font-medium mb-2 text-gray-700">
        手机号码 *
      </label>
      <div className="relative">
        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          autoComplete="tel"
          required
          className="w-full rounded-xl pl-11 pr-4 py-3.5 text-[14px] bg-white border border-neutral-200 text-gray-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-300 transition-colors"
          placeholder="请输入您的手机号码"
          value={phoneNumber}
          onBlur={onPhoneBlur}
          onChange={(e) => onPhoneChange(e.target.value)}
        />
      </div>
      {touched && error && (
        <p className="mt-1 text-sm text-error-700">{error}</p>
      )}
    </div>
  );
}
