import { useEffect, useRef, useState } from 'react';
import { isFullscreen as checkFullscreen, exitFullscreen, isFullscreenSupported } from '../utils/fullscreen';

/**
 * Custom hook for auto-enabling fullscreen on first user interaction
 * Based on a proven working approach that handles all devices correctly
 */
export const useFirstInteractionFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hasTriggered = useRef(false);

  const requestFullscreenHandler = () => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;

    const elem = document.documentElement;

    try {
      if (elem.requestFullscreen) {
        elem.requestFullscreen({ navigationUI: "hide" }).catch(() => {
          hasTriggered.current = false;
        });
      } else if (elem.webkitRequestFullscreen) {
        // Safari
        elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        // Firefox
        elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        // IE/Edge
        elem.msRequestFullscreen();
      }
    } catch (error) {
      console.log('Fullscreen error:', error);
      hasTriggered.current = false;
    }
  };

  // Monitor fullscreen state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(checkFullscreen());
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Trigger fullscreen on ANY user interaction
  useEffect(() => {
    if (!isFullscreenSupported()) return;

    const trigger = () => {
      if (!hasTriggered.current && !checkFullscreen()) {
        requestFullscreenHandler();
      }
    };

    // Only the events that ACTUALLY work as user gestures on all devices
    const events = [
      'click',
      'mousedown',
      'keydown',
      'touchstart',
      'pointerdown'
    ];

    events.forEach(event => {
      document.addEventListener(event, trigger, { once: true, capture: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trigger, { capture: true });
      });
    };
  }, []);

  const exitFullscreenHandler = () => {
    exitFullscreen().catch(() => {
      console.log('Failed to exit fullscreen');
    });
  };

  return {
    isFullscreen,
    exitFullscreen: exitFullscreenHandler
  };
};

