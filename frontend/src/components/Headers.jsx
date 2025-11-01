import {
  faBars,
  faHome,
  faProjectDiagram,
  faTimes,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      // Get all sections
      const sections = ["home", "about", "projects"];

      // Find which section is currently in view
      let current = "home";
      let currentDistance = Infinity;

      // Check if we're at the top of the page
      if (window.scrollY < 100) {
        setActiveSection("home");
        return;
      }

      // Find the section closest to the viewport center
      const viewportCenter = window.innerHeight / 2;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top;
          const elementBottom = rect.bottom;
          const elementCenter = rect.top + rect.height / 2;
          
          // Check if section is visible in viewport
          if (elementTop < window.innerHeight && elementBottom > 0) {
            // Calculate distance from viewport center to section center
            const distance = Math.abs(viewportCenter - elementCenter);
            if (distance < currentDistance) {
              currentDistance = distance;
              current = section;
            }
          }
        }
      }

      setActiveSection(current);
    };

    // Initial check
    handleScroll();

    // Add scroll listener with throttling for better performance
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300`}>
      {/* Semi-transparent header background */}
      <div
        className="absolute inset-0 transition-all duration-300"
      />

      <nav className="container mx-auto flex justify-between items-center px-4 py-4 relative z-10">
        {/* Logo */}
        <a href="#home" className="flex items-center group z-50">
          <span className="text-xl font-['Great_Vibes'] bg-gradient-to-r from-[#60A5FA] to-[#93C5FD] bg-clip-text text-transparent">
          </span>
        </a>

        {/* Mobile Hamburger Button - Enhanced visibility */}
        <button
          className={`md:hidden z-50 w-12 h-12 flex items-center justify-center rounded-xl
                    ${
                      isOpen
                        ? "bg-white/10 shadow-lg border border-white/20"
                        : "bg-[#1a2544] shadow-lg border border-blue-500/30"
                    }
                    transition-all duration-300 hover:scale-105 active:scale-95`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <FontAwesomeIcon
            icon={isOpen ? faTimes : faBars}
            className={`text-xl transition-all duration-300
                        ${
                          isOpen
                            ? "text-white rotate-90 scale-110"
                            : "text-blue-400 rotate-0"
                        }`}
          />
        </button>

        {/* Mobile Menu - Enhanced blur and layout */}
        <div
          className={`fixed inset-0 transition-all duration-300 md:hidden
                        ${
                          isOpen
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 translate-x-full pointer-events-none"
                        }`}
        >
          {/* Enhanced blur background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/90 to-[#0a0a12]/95" />

          {/* Content Layer with improved spacing */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <ul className="flex flex-col items-center space-y-8 p-6 w-full max-w-sm mx-auto">
              {[
                { href: "#home", text: "Home", icon: faHome, id: "home" },
                { href: "#about", text: "About", icon: faUser, id: "about" },
                { href: "#projects", text: "Projects", icon: faProjectDiagram, id: "projects" },
              ].map((item, index) => {
                const isActive = activeSection === item.id;
                return (
                  <li
                    key={index}
                    className={`w-full transform transition-all duration-300 ${
                      isOpen
                        ? "translate-x-0 opacity-100"
                        : "translate-x-8 opacity-0"
                    }`}
                  >
                    <a
                      href={item.href}
                      className={`flex items-center justify-center group w-full px-6 py-4 rounded-xl
                                        border transition-all duration-300 hover:scale-105 ${
                        isActive
                          ? "bg-white/15 border-blue-400/50 shadow-lg shadow-blue-400/20"
                          : "bg-[#131320]/40 border-white/10 hover:bg-white/10 hover:border-blue-400/30"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <FontAwesomeIcon
                        icon={item.icon}
                        className={`mr-3 text-xl transition-colors duration-300 ${
                          isActive
                            ? "text-blue-300"
                            : "text-blue-400 group-hover:text-blue-300"
                        }`}
                      />
                      <span
                        className={`text-2xl font-['Great_Vibes'] transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-r from-[#ff4d4d] to-[#A64DDA] bg-clip-text text-transparent"
                            : "bg-gradient-to-r from-[#60A5FA] to-[#93C5FD] bg-clip-text text-transparent"
                        }`}
                      >
                        {item.text}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center space-x-8">
          {[
            { href: "#home", text: "Home", icon: faHome, id: "home" },
            { href: "#about", text: "About", icon: faUser, id: "about" },
            { href: "#projects", text: "Projects", icon: faProjectDiagram, id: "projects" },
          ].map((item, index) => {
            const isActive = activeSection === item.id;
            return (
              <li key={index}>
                <a
                  href={item.href}
                  className={`relative handDrag px-3 py-2 group font-['Great_Vibes'] text-2xl shimmer-effect ${
                    isActive ? "active-tab" : ""
                  }`}
                >
                  <span
                    className={`relative z-10 bg-clip-text text-transparent transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-[#ff4d4d] to-[#A64DDA] text-shadow-[0_0_12px_rgba(166,77,218,0.6),0_0_20px_rgba(166,77,218,0.4)]"
                        : "bg-gradient-to-r from-[#60A5FA] to-[#93C5FD] group-hover:from-[#ff4d4d] group-hover:to-[#A64DDA] group-hover:text-shadow-[0_0_12px_rgba(166,77,218,0.6),0_0_20px_rgba(166,77,218,0.4)]"
                    }`}
                  >
                    {item.text}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#ff4d4d] to-[#A64DDA] rounded-full"></span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <style>{`
        .shimmer-effect::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(166, 77, 218, 0.6),
            transparent
          );
          transition: width 0.4s ease;
          pointer-events: none;
        }

        .shimmer-effect:hover::before {
          width: 100%;
        }

        @keyframes magneticGlowPurple {
          0% {
            box-shadow:
              0 0 35px rgba(166, 77, 218, 0.6),
              0 0 70px rgba(166, 77, 218, 0.3);
          }
          50% {
            box-shadow:
              0 0 50px rgba(166, 77, 218, 0.8),
              0 0 100px rgba(166, 77, 218, 0.5);
          }
          100% {
            box-shadow:
              0 0 35px rgba(166, 77, 218, 0.6),
              0 0 70px rgba(166, 77, 218, 0.3);
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
