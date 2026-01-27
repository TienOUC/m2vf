'use client'

import { useState, useCallback, useEffect } from 'react';
import { useToast } from './use-toast';

interface ErrorItem {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: number;
}

interface UseErrorHandlerReturn {
  errors: ErrorItem[];
  addError: (message: string, type?: 'error' | 'warning' | 'info') => void;
  clearError: (id?: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const { toast } = useToast();

  // 添加错误
  const addError = useCallback((message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    const errorId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newError: ErrorItem = {
      id: errorId,
      message,
      type,
      timestamp: Date.now(),
    };

    setErrors(prev => [...prev, newError]);

    // 显示 toast 通知
    toast({
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });

    // 自动清除错误（5秒后）
    setTimeout(() => {
      clearError(errorId);
    }, 5000);
  }, [toast]);

  // 清除指定错误
  const clearError = useCallback((id?: string) => {
    if (id) {
      setErrors(prev => prev.filter(error => error.id !== id));
    } else {
      // 如果没有指定 id，清除第一个错误
      setErrors(prev => prev.slice(1));
    }
  }, []);

  // 清除所有错误
  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // 检查是否有错误
  const hasErrors = errors.length > 0;

  return {
    errors,
    addError,
    clearError,
    clearAllErrors,
    hasErrors,
  };
}
