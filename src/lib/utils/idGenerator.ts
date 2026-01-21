'use client';

/**
 * 生成唯一的节点ID
 * @param prefix 可选的ID前缀
 * @returns 唯一的节点ID字符串
 */
export const generateNodeId = (prefix: string = '') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const suffix = prefix ? `-${prefix}` : '';
  return `node-${timestamp}-${random}${suffix}`;
};

/**
 * 从现有节点中提取最大ID值
 * @param nodes 节点列表
 * @returns 最大ID值
 */
export const getMaxNodeId = (nodes: any[]) => {
  if (nodes.length === 0) return 0;
  
  return nodes.reduce((max, node) => {
    const idMatch = node.id.match(/node-(\d+)(?:-\d+)?(?:-\w+)?$/);
    if (idMatch) {
      const numId = parseInt(idMatch[1], 10);
      return numId > max ? numId : max;
    }
    return max;
  }, 0);
};

/**
 * 生成带有帧类型标识的节点ID
 * @param baseId 基础ID
 * @param frameType 帧类型（first或last）
 * @returns 带有帧类型标识的节点ID
 */
export const generateFrameNodeId = (baseId: number, frameType: 'first' | 'last') => {
  const timestampSuffix = Date.now().toString().slice(-4);
  return `node-${baseId}-${timestampSuffix}-${frameType}`;
};
