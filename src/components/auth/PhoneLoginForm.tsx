'use client';

import { Phone } from 'lucide-react';
import { CountDownButton } from '@/components/auth/CountDownButton';
import { validatePhone } from '@/lib/utils/validation';

interface PhoneLoginFormProps {
  phone: string;
  code: string;
  isLoading: boolean;
  errors: { phone?: string; code?: string };
  touched: { phone?: boolean; code?: boolean };
  onPhoneChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onPhoneBlur: () => void;
  onCodeBlur: () => void;
  onSendCode: () => void;
}

export function PhoneLoginForm({
  phone,
  code,
  isLoading,
  errors,
  touched,
  onPhoneChange,
  onCodeChange,
  onPhoneBlur,
  onCodeBlur,
  onSendCode
}: PhoneLoginFormProps) {
  return (
    <>
      <div>
        <label className="block text-[13px] font-medium mb-2 text-gray-700">
          手机号
        </label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            pattern="\d{11}"
            maxLength={11}
            required
            className="w-full rounded-xl pl-11 pr-4 py-3.5 text-[14px] bg-white border border-neutral-200 text-gray-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-300 transition-colors"
            placeholder="请输入您的手机号"
            value={phone}
            onBlur={onPhoneBlur}
            onChange={(e) => onPhoneChange(e.target.value)}
          />
        </div>
        {touched.phone && errors.phone && (
          <p className="mt-1 text-sm text-error-700">{errors.phone}</p>
        )}
      </div>

      <div>
        <label className="block text-[13px] font-medium mb-2 text-gray-700">
          验证码
        </label>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              id="phone-code"
              name="phone-code"
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
              <p className="mt-1 text-sm text-destructive">{errors.code}</p>
            )}
          </div>
          
          <div>
            <CountDownButton
              isLoading={isLoading}
              disabled={!phone || !!validatePhone(phone)}
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
