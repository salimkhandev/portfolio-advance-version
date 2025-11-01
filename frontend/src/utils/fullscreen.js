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
 * Request fullscreen mode
 * @param {HTMLElement} element - Element to make fullscreen (default: document.documentElement)
 * @returns {Promise<void>} - Promise that resolves when fullscreen is entered
 */
export const requestFullscreen = async (element = document.documentElement) => {
  // Check support first
  if (!isFullscreenSupported()) {
    const error = new Error('Fullscreen API is not supported in this browser');
    console.warn('Fullscreen not supported:', error.message);
    throw error;
  }

  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      // Safari
      await element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      // Firefox
      await element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      // IE/Edge
      await element.msRequestFullscreen();
    } else {
      throw new Error('Fullscreen methods are not available on this element');
    }
  } catch (error) {
    console.error('Error entering fullscreen:', error);
    throw error;
  }
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
 * Toggle fullscreen mode
 * @param {HTMLElement} element - Element to make fullscreen
 * @returns {Promise<void>} - Promise that resolves when toggled
 */
export const toggleFullscreen = async (element = document.documentElement) => {
  // Check support before attempting toggle
  if (!isFullscreenSupported()) {
    const error = new Error('Fullscreen API is not supported in this browser');
    console.warn('Cannot toggle fullscreen:', error.message);
    throw error;
  }

  try {
    if (isFullscreen()) {
      await exitFullscreen();
    } else {
      await requestFullscreen(element);
    }
  } catch (error) {
    console.error('Error toggling fullscreen:', error);
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

/**
 * Check if fullscreen can be auto-triggered
 * iOS Safari requires user gesture, so auto-fullscreen won't work
 * @returns {boolean} - True if auto-fullscreen is possible
 */
export const canAutoFullscreen = () => {
  // iOS Safari requires user interaction, cannot auto-trigger
  if (isIOS()) {
    return false;
  }
  return isFullscreenSupported();
};

