import { useCallback } from 'react';
import { type Node, type Edge } from '@xyflow/react';
import { useVideoNodesStore } from '@/lib/stores/videoNodesStore';
import { useImageNodesStore } from '@/lib/stores/imageNodesStore';
import { mockApiService } from '@/lib/api/mockService';
import { findVideoFrameNodes } from '@/lib/utils/nodeFinder';

interface UseDialogSendProps {
  selectedNode: Node | null;
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: any) => void;
  handleDialogClose: () => void;
}

export const useDialogSend = ({ 
  selectedNode, 
  nodes, 
  edges, 
  setNodes, 
  handleDialogClose 
}: UseDialogSendProps) => {
  // 查找与视频节点相连的首帧和尾帧图片节点
  const findConnectedFrameNodes = useCallback(() => {
    if (!selectedNode || selectedNode.type !== 'video') {
      return { firstFrameUrl: undefined, lastFrameUrl: undefined };
    }
    return findVideoFrameNodes(selectedNode, nodes, edges);
  }, [selectedNode, nodes, edges]);
  
  // 处理对话框发送
  const handleDialogSend = useCallback(async (content: string, model: string, config?: Record<string, any>) => {
    if (!selectedNode) return;
    
    if (selectedNode.type === 'video') {
      const { firstFrameUrl, lastFrameUrl } = findConnectedFrameNodes();
      
      if (!firstFrameUrl) {
        console.warn('首帧图片未上传');
        return;
      }
      
      // 更新全局状态：清除旧视频、显示loading
      const videoNodesStore = useVideoNodesStore.getState() as any;
      videoNodesStore.setVideoNode(selectedNode.id, { 
        videoUrl: undefined, 
        isLoading: true 
      });
      
      try {
        // 调用模拟API生成视频
        const mockVideoUrl = await mockApiService.generateVideo(
          content, model, firstFrameUrl, selectedNode.id, lastFrameUrl, config
        );
        
        // 更新全局状态，添加视频URL并关闭loading状态
        videoNodesStore.setVideoNode(selectedNode.id, { 
          videoUrl: mockVideoUrl, 
          isLoading: false 
        });
      } catch (error) {
        console.error('视频生成失败:', error);
        // 更新全局状态，关闭loading状态
        videoNodesStore.setVideoNode(selectedNode.id, { 
          isLoading: false 
        });
      }
    } else if (selectedNode.type === 'image') {
      // 更新节点状态：清除旧图片、显示loading和processing
      setNodes((prevNodes: any) =>
        prevNodes.map((node: any) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, isLoading: true, isProcessing: true, imageUrl: undefined } }
            : node
        )
      );
      
      try {
        // 调用模拟API生成图片
        const mockImageUrl = await mockApiService.generateImage(
          content, model, selectedNode.id, config
        );
        
        // 更新节点数据，添加图片URL并关闭loading和processing状态
        setNodes((prevNodes: any) =>
          prevNodes.map((node: any) =>
            node.id === selectedNode.id
              ? { ...node, data: { ...node.data, imageUrl: mockImageUrl, isLoading: false, isProcessing: false } }
              : node
          )
        );
        
        // 更新全局存储
        setTimeout(() => {
          const imageNodesStore = useImageNodesStore.getState();
          imageNodesStore.setImageNode(selectedNode.id, {
            id: selectedNode.id,
            imageUrl: mockImageUrl,
            position: selectedNode.position
          });
        }, 0);
      } catch (error) {
        console.error('图片生成失败:', error);
        // 更新节点状态，关闭loading和processing状态
        setNodes((prevNodes: any) =>
          prevNodes.map((node: any) =>
            node.id === selectedNode.id
              ? { ...node, data: { ...node.data, isLoading: false, isProcessing: false } }
              : node
          )
        );
      }
    }
    
    handleDialogClose();
  }, [selectedNode, setNodes, handleDialogClose, findConnectedFrameNodes]);
  
  return {
    handleDialogSend,
    findConnectedFrameNodes
  };
};