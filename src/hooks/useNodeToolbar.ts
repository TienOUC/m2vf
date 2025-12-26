import { useState, useCallback } from 'react';

export interface ToolbarAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export interface UseNodeToolbarProps {
  actions: ToolbarAction[];
  nodeId?: string;
  defaultVisible?: boolean;
}

export const useNodeToolbar = ({ 
  actions, 
  nodeId, 
  defaultVisible = false 
}: UseNodeToolbarProps) => {
  const [isVisible, setIsVisible] = useState(defaultVisible);

  const showToolbar = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideToolbar = useCallback(() => {
    setIsVisible(false);
  }, []);

  const toggleToolbar = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const toolbar = useCallback(() => {
    return {
      isVisible,
      showToolbar,
      hideToolbar,
      toggleToolbar,
      nodeId,
      actions,
    };
  }, [isVisible, showToolbar, hideToolbar, toggleToolbar, nodeId, actions]);

  return {
    toolbar: toolbar(),
    showToolbar,
    hideToolbar,
    toggleToolbar,
  };
};