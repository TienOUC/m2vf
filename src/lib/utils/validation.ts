// 验证工具函数

// 邮箱格式验证
export const validateEmail = (value: string): string | undefined => {
  if (!value.trim()) {
    return '请输入邮箱地址';
  }

  // 邮箱验证正则
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(value)) {
    return '请输入有效的邮箱地址';
  }

  return undefined;
};

// 手机号格式验证
export const validatePhone = (value: string): string | undefined => {
  if (!value.trim()) {
    return '请输入手机号码';
  }

  // 手机号验证正则（中国手机号）
  const phoneRegex = /^1[3-9]\d{9}$/;

  if (!phoneRegex.test(value)) {
    return '请输入有效的手机号码';
  }

  return undefined;
};

// 密码格式验证
export const validatePassword = (value: string): string | undefined => {
  if (!value.trim()) {
    return '请输入密码';
  }

  if (value.length < 6) {
    return '密码长度不能少于6位';
  }

  if (value.length > 20) {
    return '密码长度不能超过20位';
  }

  return undefined;
};

// 确认密码验证
export const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
  if (!confirmPassword.trim()) {
    return '请确认密码';
  }

  if (password !== confirmPassword) {
    return '两次输入的密码不一致';
  }

  return undefined;
};

// 用户名验证
export const validateName = (value: string): string | undefined => {
  if (!value.trim()) {
    return '请输入姓名';
  }

  if (value.length < 2) {
    return '姓名长度不能少于2个字符';
  }

  if (value.length > 20) {
    return '姓名长度不能超过20个字符';
  }

  return undefined;
};

// 验证登录凭据（邮箱或手机号）
export const validateLoginCredential = (value: string): string | undefined => {
  if (!value.trim()) {
    return '请输入邮箱或手机号';
  }

  // 检查是否为邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // 检查是否为手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/;

  if (!emailRegex.test(value) && !phoneRegex.test(value)) {
    return '请输入有效的邮箱地址或手机号码';
  }

  return undefined;
};

// 验证码格式验证
export const validateCode = (value: string): string | undefined => {
  if (!value.trim()) {
    return '请输入验证码';
  }

  // 验证码验证正则（6位数字）
  const codeRegex = /^\d{6}$/;

  if (!codeRegex.test(value)) {
    return '请输入6位数字验证码';
  }

  return undefined;
};