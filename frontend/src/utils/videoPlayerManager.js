/**
 * Video Player Manager Utility
 * 
 * Manages global video playback state to ensure only one video plays at a time.
 * When a video starts playing, all other registered videos are automatically paused.
 */

class VideoPlayerManager {
  constructor() {
    // Store all registered video elements with their unique IDs
    this.videos = new Map();
    // Track the currently active video ID
    this.activeVideoId = null;
  }

  /**
   * Register a video element with a unique ID
   * @param {string} videoId - Unique identifier for the video
   * @param {HTMLVideoElement} videoElement - The video DOM element
   */
  registerVideo(videoId, videoElement) {
    if (!videoElement || !(videoElement instanceof HTMLVideoElement)) {
      console.warn(`VideoPlayerManager: Invalid video element for ID ${videoId}`);
      return;
    }

    this.videos.set(videoId, videoElement);
    
    // Add event listeners to handle play/pause
    this._setupVideoListeners(videoId, videoElement);
  }

  /**
   * Unregister a video element
   * @param {string} videoId - Unique identifier for the video
   */
  unregisterVideo(videoId) {
    const videoElement = this.videos.get(videoId);
    
    if (videoElement) {
      // Remove event listeners
      this._removeVideoListeners(videoId, videoElement);
      
      // Pause if it's currently playing
      if (this.activeVideoId === videoId) {
        videoElement.pause();
        this.activeVideoId = null;
      }
    }
    
    this.videos.delete(videoId);
  }

  /**
   * Set a video as active (playing) and pause all others
   * @param {string} videoId - Unique identifier for the video to play
   * @returns {boolean} - True if successfully set, false otherwise
   */
  setActiveVideo(videoId) {
    const targetVideo = this.videos.get(videoId);
    
    if (!targetVideo) {
      console.warn(`VideoPlayerManager: Video with ID ${videoId} not found`);
      return false;
    }

    // If this video is already active, do nothing
    if (this.activeVideoId === videoId) {
      return true;
    }

    // Pause all other videos
    this.pauseAllExcept(videoId);

    // Set the new active video
    this.activeVideoId = videoId;
    
    return true;
  }

  /**
   * Pause all videos except the specified one
   * @param {string} exceptVideoId - Video ID to exclude from pausing
   */
  pauseAllExcept(exceptVideoId) {
    this.videos.forEach((videoElement, videoId) => {
      if (videoId !== exceptVideoId && videoElement) {
        try {
          // Pause the video
          videoElement.pause();
          
          // Reset the current time to prevent resume on next play
          // This is optional - remove if you want videos to resume from where they stopped
          // videoElement.currentTime = 0;
        } catch (error) {
          console.warn(`VideoPlayerManager: Error pausing video ${videoId}:`, error);
        }
      }
    });
  }

  /**
   * Pause all videos
   */
  pauseAll() {
    this.videos.forEach((videoElement, videoId) => {
      if (videoElement) {
        try {
          videoElement.pause();
        } catch (error) {
          console.warn(`VideoPlayerManager: Error pausing video ${videoId}:`, error);
        }
      }
    });
    
    this.activeVideoId = null;
  }

  /**
   * Get the currently active video ID
   * @returns {string|null} - The active video ID or null
   */
  getActiveVideoId() {
    return this.activeVideoId;
  }

  /**
   * Check if a video is currently active
   * @param {string} videoId - Video ID to check
   * @returns {boolean} - True if the video is active
   */
  isActive(videoId) {
    return this.activeVideoId === videoId;
  }

  /**
   * Setup event listeners for a video element
   * @private
   */
  _setupVideoListeners(videoId, videoElement) {
    // Handle when video starts playing
    const handlePlay = () => {
      this.setActiveVideo(videoId);
    };

    // Handle when video is paused (by user or programmatically)
    const handlePause = () => {
      if (this.activeVideoId === videoId) {
        this.activeVideoId = null;
      }
    };

    // Store the handlers so we can remove them later
    videoElement._videoManagerHandlers = {
      play: handlePlay,
      pause: handlePause,
    };

    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
  }

  /**
   * Remove event listeners from a video element
   * @private
   */
  _removeVideoListeners(videoId, videoElement) {
    if (videoElement._videoManagerHandlers) {
      const { play, pause } = videoElement._videoManagerHandlers;
      
      videoElement.removeEventListener('play', play);
      videoElement.removeEventListener('pause', pause);
      
      delete videoElement._videoManagerHandlers;
    }
  }

  /**
   * Clear all registered videos
   */
  clear() {
    this.pauseAll();
    this.videos.clear();
  }

  /**
   * Get the number of registered videos
   * @returns {number} - Number of registered videos
   */
  getVideoCount() {
    return this.videos.size;
  }
}

// Create a singleton instance
const videoPlayerManager = new VideoPlayerManager();

export default videoPlayerManager;

