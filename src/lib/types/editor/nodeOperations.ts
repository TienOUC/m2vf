import { Node, Edge, NodeChange, EdgeChange } from '@xyflow/react';


export type FontType = 'h1' | 'h2' | 'h3' | 'p';

export interface NodeData {
  label?: string;
  imageUrl?: string;
  backgroundColor?: string;
  fontType?: FontType;
  needsUpdate?: boolean;
  isLoading?: boolean;
  error?: string;
  onDelete?: (nodeId: string) => void;
  onBackgroundColorChange?: (nodeId: string, color: string) => void;
  onReplace?: (nodeId: string) => void;
  onImageUpdate?: (nodeId: string, imageUrl: string) => void;
  onDownload?: (nodeId: string) => void;
  onBackgroundRemove?: (nodeId: string) => void;
  getContent?: (nodeId: string) => string;
}

export interface NodeOperationHandlers {
  handleReplace: (nodeId: string) => void;
  handleImageUpdate: (nodeId: string, imageUrl: string) => void;
  handleDelete: (nodeId: string) => void;
  handleBackgroundColorChange: (nodeId: string, color: string) => void;
  handleFontTypeChange: (nodeId: string, fontType: FontType) => void;
  handleEditingChange: (nodeId: string, editing: boolean) => void;
  handleCropComplete: (nodeId: string, croppedImageUrl: string) => void;
  handleDownload: (nodeId: string) => void;
  handleBackgroundRemove: (nodeId: string) => void;
}

export interface NodeState {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  isAnyEditing: boolean;
  editingNodeIds: React.MutableRefObject<Set<string>>;
}

export interface NodeOperations extends NodeState, NodeOperationHandlers {}