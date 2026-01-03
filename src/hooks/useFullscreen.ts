import { useCallback, useEffect, useState } from 'react';
import type { RefObject } from 'react';

interface PrefixedDocument extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenEnabled?: boolean;
}

interface WebkitElement extends Element {
  webkitRequestFullscreen?: () => Promise<void> | void;
}

export function useFullscreen(targetRef: RefObject<HTMLElement>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const updateState = useCallback(() => {
    const prefDoc = document as PrefixedDocument;
    const fsEl = document.fullscreenElement || prefDoc.webkitFullscreenElement || null;
    setIsFullscreen(!!fsEl);
  }, []);

  const enter = useCallback(async () => {
    try {
      const el = targetRef.current;
      if (!el) return;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if ((el as WebkitElement).webkitRequestFullscreen) {
        await (el as WebkitElement).webkitRequestFullscreen!();
      }
      updateState();
    } catch (e) {
      console.warn('进入全屏失败', e);
    }
  }, [targetRef, updateState]);

  const exit = useCallback(async () => {
    try {
      const prefDoc = document as PrefixedDocument;
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (prefDoc.webkitExitFullscreen) {
        await prefDoc.webkitExitFullscreen();
      }
      updateState();
    } catch (e) {
      console.warn('退出全屏失败', e);
    }
  }, [updateState]);

  const toggle = useCallback(() => {
    if (isFullscreen) {
      exit();
    } else {
      enter();
    }
  }, [isFullscreen, enter, exit]);

  useEffect(() => {
    const prefDoc = document as PrefixedDocument;
    const handler = () => updateState();
    document.addEventListener('fullscreenchange', handler);
    if (prefDoc.webkitFullscreenEnabled !== undefined) {
      document.addEventListener('webkitfullscreenchange', handler as EventListener);
    }
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      if (prefDoc.webkitFullscreenEnabled !== undefined) {
        document.removeEventListener('webkitfullscreenchange', handler as EventListener);
      }
    };
  }, [updateState]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        exit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen, exit]);

  return { isFullscreen, enter, exit, toggle };
}
