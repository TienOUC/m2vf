export function getLoginErrorMessage(message: string | undefined): string {
  if (!message) return '登录失败，请检查凭证';

  if (message.includes('email') || message.includes('Email')) {
    return '邮箱不存在或格式错误';
  }
  if (message.includes('phone') || message.includes('Phone')) {
    return '手机号不存在或格式错误';
  }
  if (message.includes('password') || message.includes('Password')) {
    return '密码错误';
  }
  if (message.includes('code') || message.includes('Code')) {
    return '验证码错误或已过期';
  }
  if (message.includes('invalid') || message.includes('Invalid')) {
    return '登录信息错误';
  }

  return message;
}

export function getRequestErrorMessage(error: unknown): string {
  const errorMessage = '网络请求失败，请稍后重试';
  
  if (!(error instanceof Error)) {
    return errorMessage;
  }

  const message = error.message;

  if (message.includes('超时')) {
    return '请求超时，请检查网络连接';
  }
  if (message.includes('401') || message.includes('未授权')) {
    return '登录信息错误';
  }
  if (message.includes('400')) {
    return '请求参数错误，请检查输入格式';
  }
  if (message.includes('500')) {
    return '服务器内部错误，请稍后重试';
  }
  if (message.includes('code') || message.includes('Code')) {
    return '验证码错误或已过期';
  }

  return errorMessage;
}
