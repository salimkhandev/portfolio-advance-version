import { faCompress } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useFirstInteractionFullscreen } from '../hooks/useFirstInteractionFullscreen';
import { isFullscreenSupported } from '../utils/fullscreen';

/**
 * FullscreenButton Component
 * A small gray button at top-left for exiting fullscreen mode
 * Only shows when in fullscreen mode
 */
const FullscreenButton = () => {
  const { isFullscreen, exitFullscreen } = useFirstInteractionFullscreen();

  if (!isFullscreenSupported() || !isFullscreen) {
    return null;
  }

  return (
    <button
      onClick={exitFullscreen}
      className="fixed top-2 left-2 z-[10000] bg-gray-500/80 hover:bg-gray-600/80 rounded p-1.5 transition-all duration-200 hover:opacity-100 opacity-80 focus:outline-none focus:ring-1 focus:ring-gray-400"
      aria-label="Exit Fullscreen"
      title="Exit Fullscreen"
      style={{
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
      }}
    >
      <FontAwesomeIcon 
        icon={faCompress} 
        className="w-3 h-3"
      />
    </button>
  );
};

export default FullscreenButton;

