/**
 * Fullscreen API utility functions
 * Provides modular fullscreen functionality with cross-browser support
 * 
 * Browser Support:
 * - Desktop: ✅ Full support (Chrome, Firefox, Safari, Edge, Opera)
 * - Android Mobile: ✅ Supported (Chrome, Firefox)
 * - iOS Safari: ⚠️ Limited - Works on iPad, NOT on iPhone
 * - iOS Safari: Requires user gesture (cannot auto-trigger)
 */

/**
 * Check if fullscreen is currently active
 * @returns {boolean} - True if fullscreen is active
 */
export const isFullscreen = () => {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
};

/**
 * Exit fullscreen mode
 * @returns {Promise<void>} - Promise that resolves when fullscreen is exited
 */
export const exitFullscreen = async () => {
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      // Safari
      await document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      // Firefox
      await document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      // IE/Edge
      await document.msExitFullscreen();
    }
  } catch (error) {
    console.error('Error exiting fullscreen:', error);
    throw error;
  }
};

/**
 * Detect if device is mobile
 * @returns {boolean} - True if mobile device
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Detect if device is iOS
 * @returns {boolean} - True if iOS device
 */
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

/**
 * Check if fullscreen API is supported (checks both enabled flag and actual methods)
 * @returns {boolean} - True if fullscreen is supported and methods exist
 */
export const isFullscreenSupported = () => {
  // Check if fullscreen is enabled
  const hasSupportFlag = !!(
    document.fullscreenEnabled ||
    document.webkitFullscreenEnabled ||
    document.mozFullScreenEnabled ||
    document.msFullscreenEnabled
  );
  
  // Also check if the actual methods exist on the element
  const element = document.documentElement;
  const hasMethods = !!(
    element.requestFullscreen ||
    element.webkitRequestFullscreen ||
    element.mozRequestFullScreen ||
    element.msRequestFullscreen
  );
  
  // Both flag and methods must be available
  if (!hasSupportFlag || !hasMethods) {
    return false;
  }
  
  // iOS Safari on iPhone doesn't support fullscreen API
  // Only iPad supports it
  if (isIOS()) {
    // Check if it's iPad (has bigger screen)
    const isIPad = /iPad/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return isIPad;
  }
  
  return true;
};

