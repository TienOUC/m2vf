// 生成唯一ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};
