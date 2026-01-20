export interface VideoNodeData {
  label?: string;
  videoUrl?: string;
  isLoading?: boolean;
  onDelete?: (nodeId: string) => void;
  onGenerateVideo?: (nodeId: string, prompt: string, config: any) => void;
  onFirstLastFrameGenerate?: (nodeId: string) => void;
  onFirstFrameGenerate?: (nodeId: string) => void;
  hasConnectedFrameNodes?: boolean;
}
