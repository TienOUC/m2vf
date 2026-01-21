export interface SidebarButtonConfig {
  id: string;
  icon: React.ReactNode;
  title: string;
  animation?: 'rotate' | 'scale';
  onClick: () => void;
  menu?: React.ReactNode;
  useDefaultMenuStyles?: boolean;
  menuWidth?: string;
}

export interface LeftSidebarProps {
  onAddClick?: () => void;
  onAddTextNode?: () => void;
  onAddImageNode?: () => void;
  onAddVideoNode?: () => void;
}
