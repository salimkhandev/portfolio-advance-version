import {
  Composer,
  Container,
  Header,
  MessageList,
  useWebchat,
} from "@botpress/webchat";
import { useEffect, useMemo, useState } from "react";

import profilePic from "/profilePic.webp";

const headerConfig = {
  botName: "Salim's Assistant",
  botAvatar: "https://avatars.githubusercontent.com/u/147515973?v=4",
  botDescription: "Your virtual assistant for all things support.",
  textColor: "white",

  phone: {
    title: "Call Support",
    link: "tel:+923201970649",
  },

  email: {
    title: "Email Us",
    link: "mailto:salimkhandev@gmail.com",
  },

  website: {
    title: "Visit Portfolio",
    link: "https://github.com/salimkhandev",
  },

  termsOfService: {
    title: "Terms of Service",
    link: "https://github.com/salimkhandev",
  },

  privacyPolicy: {
    title: "Privacy Policy",
    link: "https://github.com/salimkhandev",
  },
};

function FloatingChat() {
  const [isWebchatOpen, setIsWebchatOpen] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const { client, messages, isTyping, user, clientState, newConversation } =
    useWebchat({
      clientId: "a6c7357f-fcef-4f45-8147-64ea05db31d5", // ✅ your client ID
    });

  const config = {
    botName: "Salim's Assistant",
    botAvatar: profilePic,
    botDescription: "Your virtual assistant for all things support.",
    textColor: "white",
  };

  const enrichedMessages = useMemo(
    () =>
      messages.map((message) => {
        const { authorId } = message;
        const direction = authorId === user?.userId ? "outgoing" : "incoming";
        return {
          ...message,
          direction,
          sender:
            direction === "outgoing"
              ? { name: user?.name ?? "You", avatar: user?.pictureUrl }
              : { name: config.botName ?? "Bot", avatar: config.botAvatar },
        };
      }),
    [
      config.botAvatar,
      config.botName,
      messages,
      user?.userId,
      user?.name,
      user?.pictureUrl,
    ],
  );

  const toggleWebchat = () => {
    setIsWebchatOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Initial size check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Prevent body scrolling when chat is open in mobile fullscreen
    if (isWebchatOpen && window.innerWidth < 480) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "";
    };
  }, [isWebchatOpen]);

  useEffect(() => {
    // Initial popup notification has been removed
    // Nothing to do here, but keeping the useEffect for potential future usage
    return () => {};
  }, []);

  // Calculate responsive dimensions
  const getChatDimensions = () => {
    const width = windowSize.width;
    const height = windowSize.height;

    // Small mobile (< 480px)
    if (width < 480) {
      return {
        width: "100vw",
        height: "100vh",
        bottom: "0",
        right: "0",
        left: "0",
        top: "0",
        position: "fixed",
      };
    }
    // Tablet (480px - 768px)
    else if (width < 768) {
      return {
        width: "450px",
        height: "550px",
        bottom: "80px",
        right: "10px",
        left: "auto",
      };
    }
    // Small desktop (768px - 1024px)
    else if (width < 1024) {
      return {
        width: "480px",
        height: Math.min(height * 0.5, 400), // Use height variable for responsive sizing
        bottom: "90px",
        right: "20px",
        left: "auto",
      };
    }
    // Medium desktop (1024px - 1440px)
    else if (width < 1440) {
      return {
        width: "500px",
        height: Math.min(height * 0.45, 380), // Use height variable for responsive sizing
        bottom: "90px",
        right: "20px",
        left: "auto",
      };
    }
    // Large desktop (≥ 1440px)
    else {
      return {
        width: "520px",
        height: "520px",
        bottom: "90px",
        right: "20px",
        left: "auto",
      };
    }
  };

  const dimensions = getChatDimensions();

  return (
    <>
      {/* Chat Container */}
      <Container
        connected={clientState !== "disconnected"}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          maxWidth: "100%",
          display: isWebchatOpen ? "flex" : "none",
          position: "fixed",
          bottom: dimensions.bottom,
          right: dimensions.right,
          left: dimensions.left,
          top: windowSize.width < 480 ? "0" : "auto",
          borderRadius: windowSize.width < 480 ? "0" : "12px",
          overflow: "hidden",
          backgroundColor: "#0d1424",
          boxShadow:
            windowSize.width < 480 ? "none" : "0px 4px 20px rgba(0,0,0,0.3)",
          zIndex: 9998,
          color: "white",
          transition: "width 0.3s, height 0.3s, border-radius 0.3s",
        }}
      >
        <Header
          defaultOpen={false}
          closeWindow={() => setIsWebchatOpen(false)}
          restartConversation={newConversation}
          disabled={false}
          configuration={headerConfig}
          style={{
            paddingTop: windowSize.width < 480 ? "30px" : "inherit",
            position: windowSize.width < 480 ? "sticky" : "relative",
            top: windowSize.width < 480 ? "0" : "auto",
            zIndex: windowSize.width < 480 ? "1" : "auto",
            backgroundColor: "#0d1424",
          }}
        />
        <MessageList
          botName={config.botName}
          botDescription={config.botDescription}
          isTyping={isTyping}
          headerMessage="Chat with Salim's Assistant"
          showMarquee={true}
          messages={enrichedMessages}
          sendMessage={client?.sendMessage}
          style={{
            color: "white",
          }}
        />
        <Composer
          disableComposer={false}
          isReadOnly={false}
          allowFileUpload={true}
          connected={clientState !== "disconnected"}
          sendMessage={client?.sendMessage}
          uploadFile={client?.uploadFile}
          composerPlaceholder="Type a message..."
          style={{ color: "white" }}
        />
      </Container>

      {/* Floating Action Button */}
      <div
        onClick={toggleWebchat}
        style={{
          position: "fixed",
          bottom: "20px",
          right: windowSize.width < 480 ? "10px" : "20px",
          width: windowSize.width < 480 ? "56px" : "64px",
          height: windowSize.width < 480 ? "56px" : "64px",
          background:
            "linear-gradient(135deg, rgba(37,99,235,1) 0%, rgba(147,51,234,1) 100%)",
          color: "white",
          zIndex: isWebchatOpen && windowSize.width < 480 ? "0" : "9999",
          opacity: isWebchatOpen && windowSize.width < 480 ? "0" : "1",
          transition: "width 0.3s, height 0.3s, opacity 0.3s, transform 0.3s",
          pointerEvents:
            isWebchatOpen && windowSize.width < 480 ? "none" : "auto",
          animation: !isWebchatOpen
            ? "pulse 2s infinite, wiggle 5s ease-in-out infinite"
            : "none",
          boxShadow: "0 0 15px 5px rgba(99, 102, 241, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          cursor: "pointer",
        }}
      >
        <img
          src="/chatbot.png"
          alt="Chat with AI Assistant"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
          }

          50% {
            transform: scale(1.1);
            box-shadow: 0 0 15px 10px rgba(99, 102, 241, 0.6);
          }

          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
          }
        }

        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(0deg);
          }
          88% {
            transform: rotate(0deg);
          }
          90% {
            transform: rotate(-10deg);
          }
          92% {
            transform: rotate(10deg);
          }
          94% {
            transform: rotate(-10deg);
          }
          96% {
            transform: rotate(10deg);
          }
          98% {
            transform: rotate(-5deg);
          }
        }
      `}</style>
    </>
  );
}

export default FloatingChat;
