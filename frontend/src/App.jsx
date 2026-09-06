import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useEffect, useState } from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

import Login from "./pages/Citizen/Login";
import Register from "./pages/Citizen/Register";

import CitizenDashboard from "./pages/Citizen/CitizenDashboard";
import WorkerDashboard from "./pages/Worker/WorkerDashboard";
import GovernmentDashboard from "./pages/Government/GovernmentDashboard";

import JeevanSathi from "./pages/Citizen/JeevanSathi";

import "./App.css";


/* =========================================================
   JEEVANSETU BRAND INTRO
========================================================= */

function BrandIntro({ onLogin, onRegister, darkMode, onToggleTheme }) {

  const brand = "JEEVANSETU";

  const [visibleLetters, setVisibleLetters] = useState(0);
  const [showTagline, setShowTagline] = useState(false);


  /* =======================================================
     LETTER ANIMATION
  ======================================================= */

  useEffect(() => {

    const typingTimer = setInterval(() => {

      setVisibleLetters((prev) => {

        if (prev >= brand.length) {

          clearInterval(typingTimer);

          return prev;
        }

        return prev + 1;

      });

    }, 120);


    return () => {
      clearInterval(typingTimer);
    };

  }, [brand.length]);


  /* =======================================================
     TAGLINE ANIMATION

     IMPORTANT:
     Intro does NOT automatically close.
     It stays until user clicks Login/Register.
  ======================================================= */

  useEffect(() => {

    if (visibleLetters !== brand.length) {
      return;
    }


    const taglineTimer = setTimeout(() => {

      setShowTagline(true);

    }, 250);


    return () => {

      clearTimeout(taglineTimer);

    };

  }, [visibleLetters, brand.length]);


  /* =======================================================
     LOGIN / REGISTER
  ======================================================= */

  const handleLoginClick = () => {

    onLogin();

  };


  const handleRegisterClick = () => {

    onRegister();

  };


  /* =======================================================
     UI
  ======================================================= */

  return (

    <div className="js-brand-intro">

      {/* ================================================
          TOP RIGHT AUTH BUTTONS
      ================================================= */}

      <div className="js-intro-auth">

        <button
          type="button"
          className="js-intro-theme"
          onClick={onToggleTheme}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <span>{darkMode ? "☀️" : "🌙"}</span>
          <span>{darkMode ? "Light" : "Dark"}</span>
        </button>

        <button
          type="button"
          className="js-intro-login"
          onClick={handleLoginClick}
        >
          Login
        </button>


        <button
          type="button"
          className="js-intro-register"
          onClick={handleRegisterClick}
        >
          Register
        </button>

      </div>


      {/* ================================================
          BACKGROUND GLOW
      ================================================= */}

      <div className="js-glow js-glow-one"></div>

      <div className="js-glow js-glow-two"></div>


      {/* ================================================
          PARTICLES
      ================================================= */}

      <div className="js-particles">

        <span></span>
        <span></span>
        <span></span>
        <span></span>

        <span></span>
        <span></span>
        <span></span>
        <span></span>

      </div>


      {/* ================================================
          DECORATIVE RINGS
      ================================================= */}

      <div className="js-ring js-ring-one"></div>

      <div className="js-ring js-ring-two"></div>

      <div className="js-ring js-ring-three"></div>


      {/* ================================================
          MAIN BRAND CONTENT
      ================================================= */}

      <div className="js-brand-content">


        {/* ==============================================
            OVERLINE
        ============================================== */}

        <div className="js-overline">

          <span></span>

          <p>
            SMART COMMUNITY PLATFORM
          </p>

          <span></span>

        </div>


        {/* ==============================================
            JS LOGO
        ============================================== */}

        <div className="js-logo">

          <div className="js-logo-inner">
            JS
          </div>

        </div>


        {/* ==============================================
            BRAND NAME
        ============================================== */}

        <div className="js-brand-name">

          {brand.split("").map((letter, index) => (

            <span
              key={index}
              className={
                index < visibleLetters
                  ? "js-letter js-letter-visible"
                  : "js-letter"
              }
            >

              {letter}

            </span>

          ))}

        </div>


        {/* ==============================================
            CONNECTING DOTS
        ============================================== */}

        <div className="js-connect">

          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>

        </div>


        {/* ==============================================
            TAGLINE
        ============================================== */}

        <div
          className={
            showTagline
              ? "js-tagline js-tagline-show"
              : "js-tagline"
          }
        >

          <strong>
            Connecting People.
          </strong>

          <p>
            Empowering Communities.
          </p>

        </div>


        {/* ==============================================
            LOADING / PROGRESS
        ============================================== */}

        <div className="js-loading">

          <div className="js-loading-track">

            <div
              className="js-loading-fill"
              style={{
                width: `${Math.min(
                  (visibleLetters / brand.length) * 100,
                  100
                )}%`,
              }}
            ></div>

          </div>


          <small>
            BUILDING A BETTER TOMORROW
          </small>

        </div>


        {/* ==============================================
            HELPER TEXT AFTER ANIMATION
        ============================================== */}

        {showTagline && (

          <div className="js-intro-hint">

            <span className="js-hint-dot"></span>

            <span>
              Choose an option above to continue
            </span>

          </div>

        )}

      </div>

    </div>

  );

}


/* =========================================================
   MAIN APP
========================================================= */

function AppContent() {

  const { darkMode, toggleTheme } = useTheme();


  /* =======================================================
     INTRO STATE

     We DON'T automatically hide intro after animation.
     It stays until Login/Register is clicked.
  ======================================================= */

  const [showIntro, setShowIntro] = useState(() => {

    return (
      sessionStorage.getItem(
        "jeevansetu_intro_seen"
      ) !== "true"
    );

  });


  useEffect(() => {
    document.body.style.overflow = showIntro ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [showIntro]);


  /* =======================================================
     LOGIN BUTTON
  ======================================================= */

  const handleLogin = () => {

    sessionStorage.setItem(
      "jeevansetu_intro_seen",
      "true"
    );

    setShowIntro(false);

    window.location.href = "/login";

  };


  /* =======================================================
     REGISTER BUTTON
  ======================================================= */

  const handleRegister = () => {

    sessionStorage.setItem(
      "jeevansetu_intro_seen",
      "true"
    );

    setShowIntro(false);

    window.location.href = "/register";

  };


  /* =======================================================
     APP
  ======================================================= */

  return (

    <>

      {/* ===================================================
          BRAND INTRO
      ================================================== */}

      {showIntro && (

        <BrandIntro
          onLogin={handleLogin}
          onRegister={handleRegister}
          darkMode={darkMode}
          onToggleTheme={toggleTheme}
        />

      )}


      {/* ===================================================
          ROUTER
      ================================================== */}

      <BrowserRouter>

        <Routes>


          {/* ==============================================
              HOME
          ============================================== */}

          <Route
            path="/"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />


          {/* ==============================================
              AUTH
          ============================================== */}

          <Route
            path="/login"
            element={<Login />}
          />


          <Route
            path="/register"
            element={<Register />}
          />


          {/* ==============================================
              CITIZEN
          ============================================== */}

          <Route
            path="/citizen"
            element={<CitizenDashboard />}
          />


          {/* ==============================================
              JEEVAN SATHI
          ============================================== */}

          <Route
            path="/jeevan-sathi"
            element={<JeevanSathi />}
          />


          {/* ==============================================
              WORKER
          ============================================== */}

          <Route
            path="/worker"
            element={<WorkerDashboard />}
          />


          {/* ==============================================
              GOVERNMENT
          ============================================== */}

          <Route
            path="/government"
            element={<GovernmentDashboard />}
          />


          {/* ==============================================
              FALLBACK
          ============================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

        </Routes>

      </BrowserRouter>

    </>

  );

}


function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;