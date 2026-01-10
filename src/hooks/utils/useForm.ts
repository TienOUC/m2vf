import { useState, useCallback } from 'react';

type FormErrors<T> = {
  [K in keyof T]?: string | undefined;
};

type FormTouched<T> = {
  [K in keyof T]?: boolean;
};

interface UseFormProps<T> {
  initialValues: T;
  validate: (values: T) => FormErrors<T>;
  onSubmit: (values: T) => void | Promise<void>;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit
}: UseFormProps<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<FormTouched<T>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    // 如果字段已经被触摸过，实时验证
    if (touched[name as string]) {
      setErrors(prev => {
        const newValues = { ...values, [name]: value };
        return {
          ...prev,
          [name]: validate(newValues as T)[name]
        };
      });
    }
  }, [touched, values, validate]);

  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // 失焦时验证该字段
    setErrors(prev => ({
      ...prev,
      [name]: validate(values)[name]
    }));
  }, [values, validate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证所有字段
    const formErrors = validate(values);
    setErrors(formErrors);
    setTouched(Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as FormTouched<T>));

    // 检查是否有错误
    const hasErrors = Object.values(formErrors).some(error => error);
    if (hasErrors) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('表单提交错误:', error);
    } finally {
      setIsLoading(false);
    }
  }, [values, validate, onSubmit]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsLoading(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm
  };
};