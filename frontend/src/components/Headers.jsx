import {
  faHome,
  faProjectDiagram,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

const Header = () => {
  const [activeSection, setActiveSection] = useState("home");

  // no mobile overlay menu; keep scrolling enabled

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
    <header className={`fixed w-full top-6 z-50 transition-all duration-300`}>
      {/* Semi-transparent header background */}
      <div
        className="absolute inset-0 transition-all duration-300"
      />

      <nav className="container mx-auto flex justify-between items-center px-4 py-3 relative z-10">
        {/* Logo */}
        <a href="#home" className="flex items-center group z-50">
          <span className="text-xl font-['Great_Vibes'] bg-gradient-to-r from-[#60A5FA] to-[#93C5FD] bg-clip-text text-transparent">
          </span>
        </a>

        {/* Compact mobile nav (no hamburger) - always centered */}
        <ul className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 z-40">
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
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs border backdrop-blur-sm transition-colors
                    ${isActive ? "bg-white/15 border-blue-400/50 text-blue-200" : "bg-[#131320]/40 border-white/10 text-blue-300"}`}
                >
                  <FontAwesomeIcon icon={item.icon} className="text-[12px]" />
                  <span>{item.text}</span>
                </a>
              </li>
            );
          })}
        </ul>

        {/* Removed full-screen mobile menu */}

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
