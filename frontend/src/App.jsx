import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useEffect, useState } from "react";

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

function BrandIntro({ onFinish }) {
  const brand = "JEEVANSETU";

  const [visibleLetters, setVisibleLetters] = useState(0);
  const [showTagline, setShowTagline] = useState(false);
  const [closing, setClosing] = useState(false);

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

    return () => clearInterval(typingTimer);
  }, []);

  useEffect(() => {
    if (visibleLetters !== brand.length) return;

    const taglineTimer = setTimeout(() => {
      setShowTagline(true);
    }, 250);

    const closeTimer = setTimeout(() => {
      setClosing(true);

      setTimeout(() => {
        onFinish();
      }, 650);
    }, 2200);

    return () => {
      clearTimeout(taglineTimer);
      clearTimeout(closeTimer);
    };
  }, [visibleLetters, brand.length, onFinish]);

  return (
    <div
      className={
        closing
          ? "js-brand-intro js-brand-intro-close"
          : "js-brand-intro"
      }
    >

      {/* Background glow */}
      <div className="js-glow js-glow-one"></div>
      <div className="js-glow js-glow-two"></div>

      {/* Floating particles */}
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

      {/* Rings */}
      <div className="js-ring js-ring-one"></div>
      <div className="js-ring js-ring-two"></div>
      <div className="js-ring js-ring-three"></div>


      <div className="js-brand-content">

        {/* Top label */}
        <div className="js-overline">
          <span></span>
          <p>SMART COMMUNITY PLATFORM</p>
          <span></span>
        </div>


        {/* Logo */}
        <div className="js-logo">
          <div className="js-logo-inner">
            JS
          </div>
        </div>


        {/* Brand Name */}
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


        {/* Connecting dots */}
        <div className="js-connect">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>


        {/* Tagline */}
        <div
          className={
            showTagline
              ? "js-tagline js-tagline-show"
              : "js-tagline"
          }
        >
          <strong>Connecting People.</strong>
          <p>Empowering Communities.</p>
        </div>


        {/* Loading */}
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

      </div>
    </div>
  );
}


/* =========================================================
   MAIN APP
========================================================= */

function App() {

  /*
    Intro will show only once per browser tab/session.

    If the user changes route:
    /login → /register
    /login → /citizen
    /citizen → /jeevan-sathi
    etc.

    the intro will NOT appear again.
  */
  const [showIntro, setShowIntro] = useState(() => {
    return sessionStorage.getItem("jeevansetu_intro_seen") !== "true";
  });


  const handleIntroFinish = () => {
    sessionStorage.setItem("jeevansetu_intro_seen", "true");
    setShowIntro(false);
  };


  return (
    <>

      {/* Brand animation - shown only once per session */}
      {showIntro && (
        <BrandIntro
          onFinish={handleIntroFinish}
        />
      )}


      <BrowserRouter>

        <Routes>

          {/* HOME */}
          <Route
            path="/"
            element={
              <Navigate to="/login" />
            }
          />


          {/* LOGIN */}
          <Route
            path="/login"
            element={
              <Login />
            }
          />


          {/* REGISTER */}
          <Route
            path="/register"
            element={
              <Register />
            }
          />


          {/* CITIZEN */}
          <Route
            path="/citizen"
            element={
              <CitizenDashboard />
            }
          />


          {/* JEEVAN SATHI */}
          <Route
            path="/jeevan-sathi"
            element={
              <JeevanSathi />
            }
          />


          {/* WORKER */}
          <Route
            path="/worker"
            element={
              <WorkerDashboard />
            }
          />


          {/* GOVERNMENT */}
          <Route
            path="/government"
            element={
              <GovernmentDashboard />
            }
          />


          {/* INVALID URL */}
          <Route
            path="*"
            element={
              <Navigate to="/login" />
            }
          />

        </Routes>

      </BrowserRouter>

    </>
  );
}

export default App;