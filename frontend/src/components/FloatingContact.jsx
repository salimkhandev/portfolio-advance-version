import {
  faGithub,
  faLinkedin,
  faTwitter,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const email = "salimkhandev@gmail.com"; // Your email address

  const emailLink = isMobile
    ? `mailto:${email}` // 📱 Mobile → opens default email app
    : `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`; // 💻 Desktop → opens Gmail web

  const socialLinks = [
    {
      icon: faEnvelope,
      href: emailLink,
      color: "hover:text-green-400",
      label: "Email",
    },
    {
      icon: faWhatsapp,
      href: "https://wa.me/923201970649",
      color: "hover:text-green-400",
      label: "WhatsApp",
    },
    {
      icon: faGithub,
      href: "http://github.com/salimkhandev",
      color: "hover:text-gray-400",
      label: "GitHub",
    },
    {
      icon: faLinkedin,
      href: "https://www.linkedin.com/in/salimkhandev",
      color: "hover:text-blue-400",
      label: "LinkedIn",
    },
    {
      icon: faTwitter,
      href: "https://x.com/SalimKhandev",
      color: "hover:text-blue-400",
      label: "Twitter",
    },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Floating Contact Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 pointer-events-auto w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        aria-label={isOpen ? "Close contact options" : "Open contact options"}
        style={{ zIndex: 9999 }}
      >
        {isOpen ? (
          <svg
            className="w-8 h-8 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <FontAwesomeIcon icon={faEnvelope} className="w-8 h-8 mx-auto" />
        )}
      </button>

      {/* Contact Options Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 left-6 pointer-events-auto bg-white/10 backdrop-blur-xl rounded-lg shadow-2xl border border-white/20 p-4"
          style={{ zIndex: 9998 }}
        >
          <div className="text-center mb-3">
            <h3 className="text-white font-semibold text-sm">Get in Touch</h3>
          </div>

          <div className="flex flex-col space-y-3">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center space-x-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 ${social.color} group`}
                onClick={() => setIsOpen(false)}
              >
                <FontAwesomeIcon
                  icon={social.icon}
                  className="text-xl text-white/80 group-hover:scale-110 transition-transform duration-300"
                />
                <span className="text-white/80 text-sm font-medium">
                  {social.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingContact;
