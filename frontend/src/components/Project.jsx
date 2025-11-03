import { faClock, faCode, faExternalLinkAlt, faLightbulb, faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import videoPlayerManager from "../utils/videoPlayerManager";

const Project = ({
  title,
  description,
  link,
  githubLink,
  index,
  technologies = [],
  image,
  features = [],
  duration,
  challenges,
  cloudinaryVideoUrl,
  cloudinaryThumbnailUrl,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  // Generate unique video ID for this instance
  const videoIdRef = useRef(`project-video-${title}-${index}-${Date.now()}`);

  // Intersection Observer to lazy load video when in viewport
  useEffect(() => {
    if (!cloudinaryVideoUrl || shouldLoadVideo) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Video is in viewport, load it
            setShouldLoadVideo(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before video enters viewport
        threshold: 0.1,
      }
    );

    if (videoContainerRef.current) {
      observer.observe(videoContainerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [cloudinaryVideoUrl, shouldLoadVideo]);

  // Load video on hover or click
  const handleVideoInteraction = () => {
    if (!isVideoLoaded) {
      setShouldLoadVideo(true);
    }
  };

  // Register/unregister video with the manager
  useEffect(() => {
    if (!cloudinaryVideoUrl || !shouldLoadVideo) return;

    // Capture values for cleanup
    const videoId = videoIdRef.current;
    let videoElement = null;
    let timeoutId = null;
    const handlers = {
      loadedmetadata: null,
      loadeddata: null,
    };

    // Use a small delay to ensure the video element is rendered
    timeoutId = setTimeout(() => {
      videoElement = videoRef.current;
      if (!videoElement) return;

      // Register video when it's loaded
      const handleVideoLoaded = () => {
        videoPlayerManager.registerVideo(videoId, videoElement);
      };

      handlers.loadedmetadata = handleVideoLoaded;
      handlers.loadeddata = handleVideoLoaded;

      // Register immediately if video is already loaded, otherwise wait for load
      if (videoElement.readyState >= 2) {
        // Video metadata is loaded
        videoPlayerManager.registerVideo(videoId, videoElement);
      } else {
        videoElement.addEventListener('loadedmetadata', handleVideoLoaded);
        videoElement.addEventListener('loadeddata', handleVideoLoaded);
      }
    }, 100);

    // Cleanup: unregister on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Remove event listeners if they were added
      if (videoElement && handlers.loadedmetadata) {
        videoElement.removeEventListener('loadedmetadata', handlers.loadedmetadata);
        videoElement.removeEventListener('loadeddata', handlers.loadeddata);
      }
      
      videoPlayerManager.unregisterVideo(videoId);
    };
  }, [cloudinaryVideoUrl, shouldLoadVideo]);

  return (
    <div
      data-aos="fade-up"
      data-aos-delay={index * 100}
      className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-500 hover:bg-white/10 hover:scale-[1.02] hover:shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Project video, thumbnail, or fallback image */}
      {cloudinaryVideoUrl ? (
        <div
          ref={videoContainerRef}
          className="w-[100%] px-2 sm:px-4 pt-2 sm:pt-4 overflow-hidden relative"
          onMouseEnter={handleVideoInteraction}
          onClick={handleVideoInteraction}
        >
          {!shouldLoadVideo ? (
            // Show thumbnail as placeholder until video is ready to load
            <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
              {cloudinaryThumbnailUrl ? (
                <img
                  src={cloudinaryThumbnailUrl}
                  alt={title}
                  loading="lazy"
                  className="w-full h-full object-cover transform transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gray-800/50 flex items-center justify-center">
                  <FontAwesomeIcon icon={faPlayCircle} className="w-16 h-16 text-white/50" />
                </div>
              )}
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer">
                <FontAwesomeIcon icon={faPlayCircle} className="w-16 h-16 text-white/80 hover:text-white transition-all hover:scale-110" />
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              src={cloudinaryVideoUrl}
              controls
              className="w-full h-auto object-cover transform transition-transform duration-700"
              style={{
                aspectRatio: "16/9",
              }}
              preload="metadata"
              onLoadedData={() => setIsVideoLoaded(true)}
              onMouseEnter={handleVideoInteraction}
              onClick={handleVideoInteraction}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      ) : cloudinaryThumbnailUrl ? (
        <div className="w-[100%] px-2 sm:px-4 pt-2 sm:pt-4 overflow-hidden">
          <img
            src={cloudinaryThumbnailUrl}
            alt={title}
            loading="lazy"
            className="w-full h-auto object-cover transform transition-transform duration-700"
            style={{
              aspectRatio: "16/9",
            }}
          />
        </div>
      ) : image && (
        <div className="w-[100%] px-2 sm:px-4 pt-2 sm:pt-4 overflow-hidden">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-auto object-cover transform transition-transform duration-700"
            style={{
              aspectRatio: "16/9",
            }}
          />
        </div>
      )}

      <div className="relative p-3 sm:p-6 space-y-2 sm:space-y-4">
        {/* Title with animated gradient on hover */}
        <h3
          className={`text-xl font-bold tracking-tight transition-all duration-500 ${
            isHovered
              ? "bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent bg-size-200 bg-pos-0 group-hover:bg-pos-100"
              : "text-[#8594FB]"
          }`}
        >
          {title}
        </h3>

        {/* Description with fade-in effect */}
        <p className="text-gray-400 text-sm leading-relaxed transform transition-all duration-500 group-hover:text-gray-300">
          {description}
        </p>


        {/* Features List */}
        {features.length > 0 && (
          <div className="pt-2 space-y-1">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
              <FontAwesomeIcon icon={faLightbulb} className="w-3 h-3 text-yellow-400" />
              <span className="font-semibold">Features:</span>
            </div>
            <ul className="list-disc list-inside pl-4 space-y-1">
              {features.slice(0, 3).map((feature, i) => (
                <li key={i} className="text-[10px] sm:text-xs text-gray-400">
                  {feature}
                </li>
              ))}
              {features.length > 3 && (
                <li className="text-[10px] sm:text-xs text-gray-500 italic">
                  +{features.length - 3} more...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Technologies used tags */}
        {technologies.length > 0 && (
          <div className="pt-2">
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {technologies.map((tech, i) => (
                <span
                  key={i}
                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full bg-white/5 text-blue-300 border border-blue-500/20"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Duration */}
        {duration && (
          <div className="flex items-center gap-2 pt-1 text-[10px] sm:text-xs text-gray-400">
            <FontAwesomeIcon icon={faClock} className="w-3 h-3 text-blue-400" />
            <span>Duration: {duration}</span>
          </div>
        )}

        {/* Challenges */}
        {challenges && (
          <div className="pt-2">
            <div className="flex items-start gap-2">
              <FontAwesomeIcon icon={faLightbulb} className="w-3 h-3 text-orange-400 mt-0.5" />
              <div>
                <span className="text-[10px] sm:text-xs font-semibold text-gray-300 block mb-1">Challenges:</span>
                <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed">{challenges}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 sm:pt-3">
          {/* Live project button */}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all duration-300 group/link"
            >
              <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
                Visit Project
              </span>
              <FontAwesomeIcon
                icon={faExternalLinkAlt}
                className="w-3 h-3 transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300"
              />
            </a>
          )}

          {/* GitHub link */}
          {githubLink && (
            <a
              href={githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 transition-all duration-300 group/github"
            >
              <FontAwesomeIcon
                icon={faCode}
                className="w-2.5 h-2.5 sm:w-3 sm:h-3"
              />
              <span className="text-xs sm:text-sm font-semibold">Code</span>
            </a>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 transform rotate-45 translate-x-12 -translate-y-12 group-hover:translate-x-6 group-hover:-translate-y-6 transition-transform duration-500"></div>

        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 transform -rotate-45 -translate-x-8 translate-y-8 opacity-0 group-hover:opacity-100 group-hover:-translate-x-4 group-hover:translate-y-4 transition-all duration-500"></div>
      </div>
    </div>
  );
};

Project.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  link: PropTypes.string,
  githubLink: PropTypes.string,
  index: PropTypes.number.isRequired,
  technologies: PropTypes.arrayOf(PropTypes.string),
  image: PropTypes.string,
  features: PropTypes.arrayOf(PropTypes.string),
  duration: PropTypes.string,
  challenges: PropTypes.string,
  cloudinaryVideoUrl: PropTypes.string,
  cloudinaryThumbnailUrl: PropTypes.string,
};

export default Project;
