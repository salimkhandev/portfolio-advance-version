import { useEffect, useRef, useState } from 'react';

export default function My3DBackground() {
  const containerRef = useRef(null);
  const vantaRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const hasInteractedRef = useRef(false);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    setMounted(true);

    // Check for user's preferred color scheme
    const prefersDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setIsDarkMode(e.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isSmallScreen = window.innerWidth < 768;

    if (prefersReducedMotion || isSmallScreen) {
      // Fallback static gradient background
      containerRef.current.style.background = isDarkMode
        ? 'radial-gradient(circle at 50% 50%, #1a1a3a 0%, #050510 100%)'
        : 'radial-gradient(circle at 50% 50%, #e0e0ff 0%, #f5f5f5 100%)';
      return;
    }

    let isMounted = true;

    const initVanta = async () => {
      if (!isMounted || !containerRef.current || !isVisibleRef.current || document.hidden) return;
      if (vantaRef.current) return;
      try {
        // Load Three.js if not already loaded
        if (!window.THREE) {
          const threeScript = document.createElement('script');
          threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
          threeScript.async = true;
          await new Promise((resolve, reject) => {
            threeScript.onload = resolve;
            threeScript.onerror = reject;
            document.head.appendChild(threeScript);
          });
        }

        if (!isMounted) return;

        // Load Vanta NET effect
        if (!window.VANTA?.NET) {
          const vantaScript = document.createElement('script');
          vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js';
          vantaScript.async = true;
          await new Promise((resolve, reject) => {
            vantaScript.onload = resolve;
            vantaScript.onerror = reject;
            document.head.appendChild(vantaScript);
          });
        }

        if (!isMounted || !containerRef.current) return;

        // Destroy previous instance if exists
        if (vantaRef.current) {
          vantaRef.current.destroy();
        }

        // Initialize Vanta NET with lighter params
        vantaRef.current = window.VANTA.NET({
          el: containerRef.current,
          THREE: window.THREE,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 0.8,
          color: isDarkMode ? 0x4d8aff : 0x7aa2ff,
          backgroundColor: isDarkMode ? 0x0b1020 : 0xf5f5f5,
          points: 6.0,
          maxDistance: 14.0,
          spacing: 20.0,
          showDots: true,
        });
      } catch (error) {
        console.error('Failed to initialize Vanta NET:', error);
        // Fallback to gradient on error
        if (containerRef.current) {
          containerRef.current.style.background = isDarkMode
            ? 'radial-gradient(circle at 50% 50%, #1a1a3a 0%, #050510 100%)'
            : 'radial-gradient(circle at 50% 50%, #e0e0ff 0%, #f5f5f5 100%)';
        }
      }
    };

    // Visibility observer: only run when element is in viewport
    const io = new IntersectionObserver((entries) => {
      const entry = entries[0];
      isVisibleRef.current = !!entry?.isIntersecting;
      if (isVisibleRef.current) initVanta();
      else if (vantaRef.current) {
        vantaRef.current.destroy();
        vantaRef.current = null;
      }
    }, { threshold: 0.05 });
    io.observe(containerRef.current);

    // Tab visibility pause/destroy
    const onVisibility = () => {
      if (document.hidden) {
        if (vantaRef.current) {
          vantaRef.current.destroy();
          vantaRef.current = null;
        }
      } else {
        initVanta();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Defer: first interaction or idle
    const initOnInteraction = () => {
      hasInteractedRef.current = true;
      initVanta();
      window.removeEventListener('pointerdown', initOnInteraction);
      window.removeEventListener('keydown', initOnInteraction);
      window.removeEventListener('touchstart', initOnInteraction);
    };
    window.addEventListener('pointerdown', initOnInteraction, { once: true });
    window.addEventListener('keydown', initOnInteraction, { once: true });
    window.addEventListener('touchstart', initOnInteraction, { once: true });

    const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 250));
    const idleId = ric(() => { if (!hasInteractedRef.current) initVanta(); });

    const handleResize = () => {
      if (vantaRef.current && vantaRef.current.resize) {
        vantaRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointerdown', initOnInteraction);
      window.removeEventListener('keydown', initOnInteraction);
      window.removeEventListener('touchstart', initOnInteraction);
      window.removeEventListener('resize', handleResize);
      if (vantaRef.current) {
        vantaRef.current.destroy();
        vantaRef.current = null;
      }
    };
  }, [mounted, isDarkMode]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 -z-10 w-full h-full pointer-events-none ${
        isDarkMode ? 'bg-[#0b1020]' : 'bg-[#f5f5f5]'
      }`}
    >
      {/* Mobile-only decorative fallback when Vanta is disabled */}
      <div className="md:hidden absolute top-1/4 left-1/4 w-40 h-40 sm:w-56 sm:h-56 rounded-full blur-3xl opacity-30 pointer-events-none"
           style={{
             background: isDarkMode ? 'rgba(77,138,255,0.2)' : 'rgba(125,125,255,0.2)'
           }} />
      <div className="md:hidden absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-56 sm:h-56 rounded-full blur-3xl opacity-30 pointer-events-none"
           style={{
             background: isDarkMode ? 'rgba(158,77,255,0.18)' : 'rgba(158,77,255,0.18)'
           }} />
    </div>
  );
}