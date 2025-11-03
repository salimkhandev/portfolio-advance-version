import "animate.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Ensure page is not zoomed on load
if (typeof window !== 'undefined') {
  // Reset zoom to 1.0
  document.documentElement.style.zoom = '1.0';
  
  // Reset viewport scale if it was modified
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  }
  
  // Prevent text size adjustment
  document.documentElement.style.webkitTextSizeAdjust = '100%';
  document.documentElement.style.mozTextSizeAdjust = '100%';
  document.documentElement.style.msTextSizeAdjust = '100%';
  document.documentElement.style.textSizeAdjust = '100%';
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
