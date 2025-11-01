import { useCallback, useEffect, useState } from 'react';
import {
  canAutoFullscreen,
  exitFullscreen,
  isFullscreen,
  isFullscreenSupported,
  isMobile,
  requestFullscreen,
  toggleFullscreen
} from '../utils/fullscreen';

/**
 * Custom hook for managing fullscreen state
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFullscreen - Automatically enter fullscreen on mount
 * @param {boolean} options.listenToChanges - Listen to fullscreen change events
 * @returns {Object} - Fullscreen state and controls
 */
export const useFullscreen = (options = {}) => {
  const { autoFullscreen = false, listenToChanges = true } = options;
  
  const [isFullscreenActive, setIsFullscreenActive] = useState(isFullscreen());
  const [isSupported] = useState(isFullscreenSupported());
  const [isMobileDevice] = useState(isMobile());
  const [canAutoTrigger] = useState(canAutoFullscreen());

  // Update fullscreen state
  const updateFullscreenState = useCallback(() => {
    setIsFullscreenActive(isFullscreen());
  }, []);

  // Request fullscreen
  const enterFullscreen = useCallback(async (element) => {
    try {
      await requestFullscreen(element);
      updateFullscreenState();
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      // Don't update state on error - user might have denied permission
    }
  }, [updateFullscreenState]);

  // Exit fullscreen
  const leaveFullscreen = useCallback(async () => {
    try {
      await exitFullscreen();
      updateFullscreenState();
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  }, [updateFullscreenState]);

  // Toggle fullscreen
  const toggle = useCallback(async (element) => {
    // Double-check support before attempting
    if (!isSupported) {
      console.warn('Fullscreen is not supported, cannot toggle');
      return;
    }
    
    try {
      await toggleFullscreen(element);
      updateFullscreenState();
    } catch (error) {
      // Silently handle - user might have denied or browser doesn't support
      console.warn('Failed to toggle fullscreen:', error.message);
    }
  }, [updateFullscreenState, isSupported]);

  // Auto-enter fullscreen on mount if enabled
  useEffect(() => {
    if (autoFullscreen && isSupported && canAutoTrigger && !isFullscreenActive) {
      // Wait for user interaction or use a longer delay to ensure page is loaded
      // Some browsers require user gesture, so we'll try after a short delay first
      const tryFullscreen = () => {
        enterFullscreen().catch((error) => {
          // If it fails due to user gesture requirement, wait for first user interaction
          if (error.message.includes('gesture') || error.message.includes('user activation')) {
            // Try again on first user interaction
            const handleFirstInteraction = () => {
              enterFullscreen().catch(() => {
                console.log('Auto-fullscreen requires user interaction');
              });
              // Remove listeners after first try
              document.removeEventListener('click', handleFirstInteraction);
              document.removeEventListener('touchstart', handleFirstInteraction);
              document.removeEventListener('keydown', handleFirstInteraction);
            };
            
            document.addEventListener('click', handleFirstInteraction, { once: true });
            document.addEventListener('touchstart', handleFirstInteraction, { once: true });
            document.addEventListener('keydown', handleFirstInteraction, { once: true });
          } else {
            console.log('Auto-fullscreen not available:', error.message);
          }
        });
      };

      // Try immediately after a short delay (some browsers allow this)
      const timer = setTimeout(tryFullscreen, 300);

      return () => clearTimeout(timer);
    }
    // Note: On iOS Safari, auto-fullscreen won't work due to user gesture requirement
    // User will need to manually trigger fullscreen via button or gesture
  }, [autoFullscreen, isSupported, canAutoTrigger, isFullscreenActive, enterFullscreen]);

  // Listen to fullscreen change events
  useEffect(() => {
    if (!listenToChanges) return;

    const handleFullscreenChange = () => {
      updateFullscreenState();
    };

    // Add event listeners for different browser prefixes
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
  }, [listenToChanges, updateFullscreenState]);

  return {
    isFullscreen: isFullscreenActive,
    isSupported,
    isMobile: isMobileDevice,
    canAutoTrigger,
    enterFullscreen,
    exitFullscreen: leaveFullscreen,
    toggleFullscreen: toggle
  };
};

