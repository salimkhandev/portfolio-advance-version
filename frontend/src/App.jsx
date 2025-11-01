import { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import About from "./components/About";
import AdminPanel from "./components/AdminPanel";
import CursorTrail from "./components/CursorTrail";
import FloatingChat from "./components/FloatingChat";
import FloatingContact from "./components/FloatingContact";
import Headers from "./components/Headers";
import Home from "./components/Home";
import Login from "./components/Login";
import My3DBackground from "./components/My3DBackground";
import Projects from "./components/Projects";
import ProtectedRoute from "./components/ProtectedRoute";
import SplashScreen from "./components/SplashScreen";
import UnifiedDashboard from "./components/UnifiedDashboard";
import { AuthProvider } from "./context/AuthContext";
import { ProjectsProvider } from "./context/ProjectsContext";
import { SkillsProvider } from "./context/SkillsContext";

function App() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Simulate a delay to hide the splash screen after 3 seconds
    const splashTimeout = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(splashTimeout);
  }, []);
  return (
    <AuthProvider>
      <ProjectsProvider>
        <SkillsProvider>
          <Router>
          <div className="svg relative">
            {showSplash ? (
              <SplashScreen />
            ) : (
              <>
                <My3DBackground />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <UnifiedDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route
                    path="/"
                    element={
                      <>
                        <Headers />
                        <Home />
                        <About />
                        <Projects />
                        <CursorTrail />
                        <FloatingChat />
                        <FloatingContact />
                      </>
                    }
                  />
                </Routes>
              </>
            )}
          </div>
        </Router>
        </SkillsProvider>
      </ProjectsProvider>
    </AuthProvider>
  );
}

export default App;
