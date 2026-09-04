
import { useEffect, useRef, useState } from "react";
import API from "../../services/api";
import "./JeevanSathi.css";

function JeevanSathi({ initialProblem = "" }) {
  const [problem, setProblem] = useState(initialProblem);
  const [location, setLocation] = useState("");
  const [result, setResult] = useState(null);
  const [workers, setWorkers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [workerLoading, setWorkerLoading] = useState(false);
  const [bookingWorker, setBookingWorker] = useState(null);

  const [error, setError] = useState("");

  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);

  const recognitionRef = useRef(null);

  // --------------------------------------------------
  // INITIAL PROBLEM FROM DASHBOARD
  // --------------------------------------------------

  useEffect(() => {
    if (initialProblem) {
      setProblem(initialProblem);
      setError("");
    }
  }, [initialProblem]);

  // --------------------------------------------------
  // VOICE RECOGNITION SETUP
  // --------------------------------------------------

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      setError(
        "Voice command is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    // Voice settings
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // Indian English
    recognition.lang = "en-IN";

    // --------------------------------------------------
    // START
    // --------------------------------------------------

    recognition.onstart = () => {
      console.log("🎙️ Speech recognition started");

      setIsListening(true);
      setError("");
    };

    // --------------------------------------------------
    // RESULT
    // --------------------------------------------------

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript += event.results[i][0].transcript;
      }

      transcript = transcript.trim();

      console.log("🎤 Recognized voice:", transcript);

      if (transcript) {
        setProblem(transcript);
      }
    };

    // --------------------------------------------------
    // ERROR
    // --------------------------------------------------

    recognition.onerror = (event) => {
      console.error(
        "❌ Speech recognition error:",
        event.error
      );

      setIsListening(false);

      if (event.error === "not-allowed") {
        setError(
          "🎙️ Microphone permission denied. Please allow microphone access from your browser settings."
        );
      } else if (event.error === "no-speech") {
        setError(
          "🔇 No speech detected. Please speak clearly after clicking the microphone."
        );
      } else if (event.error === "audio-capture") {
        setError(
          "🎙️ Microphone not found. Please check your microphone connection."
        );
      } else if (event.error === "network") {
        setError(
          "🌐 Voice recognition needs an internet connection. Please check your network."
        );
      } else if (event.error === "aborted") {
        // User stopped recognition manually.
        setIsListening(false);
      } else {
        setError(
          "❌ Voice recognition failed. Please try again."
        );
      }
    };

    // --------------------------------------------------
    // END
    // --------------------------------------------------

    recognition.onend = () => {
      console.log("🎙️ Speech recognition ended");

      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Cleanup
    return () => {
      try {
        recognition.stop();
      } catch (error) {
        console.log("Recognition already stopped.");
      }
    };
  }, []);

  // --------------------------------------------------
  // START / STOP VOICE
  // --------------------------------------------------

  const toggleVoice = () => {
    if (!voiceSupported) {
      setError(
        "Voice command is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );
      return;
    }

    const recognition = recognitionRef.current;

    if (!recognition) {
      setError(
        "Voice recognition is unavailable."
      );
      return;
    }

    // STOP
    if (isListening) {
      try {
        recognition.stop();
      } catch (error) {
        console.error(
          "Voice stop error:",
          error
        );
      }

      return;
    }

    // START
    setError("");

    try {
      recognition.start();
    } catch (error) {
      console.error(
        "Voice start error:",
        error
      );

      /*
       * Sometimes Chrome throws InvalidStateError
       * if start() is called while recognition is
       * already active.
       */

      if (
        error.name === "InvalidStateError"
      ) {
        try {
          recognition.stop();
        } catch {}

        setTimeout(() => {
          try {
            recognition.start();
          } catch (err) {
            console.error(
              "Voice restart error:",
              err
            );

            setError(
              "Unable to start voice recognition. Please try again."
            );
          }
        }, 300);
      } else {
        setError(
          "Unable to start voice recognition. Please try again."
        );
      }
    }
  };

  // --------------------------------------------------
  // AI ANALYSIS
  // --------------------------------------------------

  const analyzeProblem = async () => {
    if (!problem.trim()) {
      setError(
        "Please describe your problem first."
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setWorkers([]);

    try {
      const response = await API.post(
        "/ai/analyze",
        {
          problem: problem.trim(),
        }
      );

      setResult(response.data.analysis);
    } catch (error) {
      console.error(
        "AI analysis error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to analyze your problem."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FIND WORKERS
  // --------------------------------------------------

  const findWorkers = async () => {
    if (!result) return;

    if (!location.trim()) {
      setError(
        "Please enter your location first."
      );
      return;
    }

    setWorkerLoading(true);
    setError("");
    setWorkers([]);

    try {
      const response = await API.post(
        "/ai/match-workers",
        {
          skill: result.skill,
          location: location.trim(),
        }
      );

      setWorkers(
        response.data.workers || []
      );
    } catch (error) {
      console.error(
        "Worker matching error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to find matching workers."
      );
    } finally {
      setWorkerLoading(false);
    }
  };

  // --------------------------------------------------
  // REQUEST WORKER
  // --------------------------------------------------

  const requestWorker = async (worker) => {
    if (!problem.trim()) {
      setError(
        "Problem description is missing."
      );
      return;
    }

    if (!location.trim()) {
      setError(
        "Please enter your location."
      );
      return;
    }

    setBookingWorker(worker.worker_id);
    setError("");

    try {
      const response = await API.post(
        "/citizen/jobs",
        {
          worker_id: worker.worker_id,
          service:
            result?.service ||
            result?.skill ||
            "General Service",
          description: problem.trim(),
          location: location.trim(),
        }
      );

      if (response.data.success) {
        alert(
          `Request sent successfully to ${worker.name}!`
        );

        setWorkers(
          (currentWorkers) =>
            currentWorkers.filter(
              (item) =>
                item.worker_id !==
                worker.worker_id
            )
        );
      }
    } catch (error) {
      console.error(
        "Booking error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to send worker request."
      );
    } finally {
      setBookingWorker(null);
    }
  };

  // --------------------------------------------------
  // EXAMPLE
  // --------------------------------------------------

  const useExample = () => {
    setProblem(
      "My AC is running but cooling is not working"
    );

    setLocation("Chandigarh");

    setResult(null);
    setWorkers([]);
    setError("");
  };

  // --------------------------------------------------
  // CLEAR
  // --------------------------------------------------

  const clearAll = () => {
    setProblem("");
    setLocation("");
    setResult(null);
    setWorkers([]);
    setError("");

    if (
      isListening &&
      recognitionRef.current
    ) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log(
          "Recognition already stopped."
        );
      }
    }
  };

  // --------------------------------------------------
  // RESULT VALUES
  // --------------------------------------------------

  const serviceName =
    result?.service ||
    result?.recommended_service ||
    result?.category ||
    "Service";

  const skillName =
    result?.skill ||
    result?.required_skill ||
    "Skilled Worker";

  const category =
    result?.category ||
    result?.service_category ||
    "General Service";

  const urgency =
    result?.urgency ||
    result?.priority ||
    "Normal";

  const reason =
    result?.reason ||
    result?.explanation ||
    result?.description ||
    "Based on your problem, this service appears to be the most suitable.";

  return (
    <div className="jeevan-sathi-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="ai-hero">

        <div className="ai-hero-icon">
          🤖
        </div>

        <div className="ai-hero-content">

          <span className="ai-badge">
            ✨ AI POWERED
          </span>

          <h1>
            Jeevan Sathi AI
          </h1>

          <p>
            Tell us your problem and let AI find
            the right service and verified worker.
          </p>

        </div>

      </section>

      {/* =================================================
          PROBLEM INPUT
      ================================================= */}

      <section className="ai-problem-section">

        <div className="ai-section-heading">

          <span>📝</span>

          <div>

            <h2>
              Tell us your problem
            </h2>

            <p>
              Describe your issue in simple words.
              You can type or use your voice.
            </p>

          </div>

        </div>

        {/* TEXTAREA */}

        <textarea
          className="problem-textarea"
          value={problem}
          onChange={(e) =>
            setProblem(e.target.value)
          }
          placeholder="Example: My AC is running but cooling is not working..."
        />

        {/* VOICE AREA */}

        <div className="voice-command-area">

          <div className="voice-info">

            <div
              className={
                isListening
                  ? "voice-mic listening"
                  : "voice-mic"
              }
            >
              {isListening
                ? "🔴"
                : "🎙️"}
            </div>

            <div>

              <strong>
                {isListening
                  ? "Listening..."
                  : "Use Voice Command"}
              </strong>

              <p>
                {isListening
                  ? "Speak your problem clearly"
                  : "Click the microphone and speak"}
              </p>

            </div>

          </div>

          <button
            type="button"
            className={
              isListening
                ? "voice-btn stop"
                : "voice-btn"
            }
            onClick={toggleVoice}
          >
            {isListening
              ? "⏹ Stop Listening"
              : "🎙️ Speak Problem"}
          </button>

        </div>

        {!voiceSupported && (
          <div className="voice-warning">
            ⚠️ Voice command is not supported in this
            browser. Try Chrome or Microsoft Edge.
          </div>
        )}

        {/* LOCATION */}

        <div className="location-input">

          <label>
            📍 Your Location
          </label>

          <input
            type="text"
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
            placeholder="Enter your city or area"
          />

        </div>

        {/* ACTIONS */}

        <div className="ai-actions">

          <button
            className="analyze-btn"
            onClick={analyzeProblem}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Analyzing...
              </>
            ) : (
              <>
                🤖 Analyze Problem
              </>
            )}
          </button>

          <button
            className="example-btn"
            onClick={useExample}
          >
            💡 Try Example
          </button>

          <button
            className="clear-btn"
            onClick={clearAll}
          >
            ↻ Clear
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="ai-error">
            ⚠️ {error}
          </div>
        )}

      </section>

      {/* =================================================
          AI RESULT
      ================================================= */}

      {result && (
        <section className="ai-result-section">

          <div className="result-header">

            <div>

              <span className="result-label">
                AI ANALYSIS COMPLETE
              </span>

              <h2>
                We found the right service for you
              </h2>

            </div>

            <div className="ai-success-icon">
              ✓
            </div>

          </div>

          <div className="result-grid">

            <div className="result-card">

              <span>
                Recommended Service
              </span>

              <strong>
                {serviceName}
              </strong>

            </div>

            <div className="result-card">

              <span>
                Required Skill
              </span>

              <strong>
                {skillName}
              </strong>

            </div>

            <div className="result-card">

              <span>
                Category
              </span>

              <strong>
                {category}
              </strong>

            </div>

            <div className="result-card">

              <span>
                Priority
              </span>

              <strong>
                {urgency}
              </strong>

            </div>

          </div>

          <div className="ai-reason">

            <strong>
              💡 Why this service?
            </strong>

            <p>
              {reason}
            </p>

          </div>

          <button
            className="find-workers-btn"
            onClick={findWorkers}
            disabled={workerLoading}
          >
            {workerLoading ? (
              <>
                <span className="spinner"></span>
                Finding Workers...
              </>
            ) : (
              <>
                🔎 Find Verified Workers
              </>
            )}
          </button>

        </section>
      )}

      {/* =================================================
          WORKERS
      ================================================= */}

      {workers.length > 0 && (
        <section className="workers-result-section">

          <div className="workers-result-header">

            <div>

              <span className="result-label">
                SMART MATCHING
              </span>

              <h2>
                Recommended Workers
              </h2>

              <p>
                Verified workers matched with
                your service and location.
              </p>

            </div>

            <div className="worker-count">
              {workers.length} Found
            </div>

          </div>

          <div className="matched-workers-grid">

            {workers.map((worker) => (

              <div
                className="matched-worker-card"
                key={worker.worker_id}
              >

                <div className="worker-card-header">

                  <div className="worker-avatar">
                    👷
                  </div>

                  {worker.verified && (
                    <span className="verified-badge">
                      ✓ Verified
                    </span>
                  )}

                </div>

                <h3>
                  {worker.name}
                </h3>

                <p className="worker-skill">
                  {worker.skill}
                </p>

                <div className="worker-details">

                  <span>
                    ⭐{" "}
                    {worker.rating
                      ? Number(
                          worker.rating
                        ).toFixed(1)
                      : "New"}
                  </span>

                  <span>
                    💼{" "}
                    {worker.experience ||
                      0} yrs
                  </span>

                </div>

                <p className="worker-location">
                  📍 {worker.location}
                </p>

                {worker.certifications && (
                  <p className="worker-certifications">
                    🏅{" "}
                    {worker.certifications}
                  </p>
                )}

                {worker.match_score !==
                  undefined && (
                  <div className="match-score">
                    🎯{" "}
                    {worker.match_score}%
                    Match
                  </div>
                )}

                <button
                  className="request-worker-btn"
                  onClick={() =>
                    requestWorker(worker)
                  }
                  disabled={
                    bookingWorker ===
                    worker.worker_id
                  }
                >
                  {bookingWorker ===
                  worker.worker_id ? (
                    <>
                      <span className="spinner"></span>
                      Sending Request...
                    </>
                  ) : (
                    <>
                      📩 Request Worker
                    </>
                  )}
                </button>

              </div>

            ))}

          </div>

        </section>
      )}

      {/* =================================================
          NO WORKERS
      ================================================= */}

      {result &&
        !workerLoading &&
        workers.length === 0 && (
          <section className="no-workers">

            <div>🔍</div>

            <h3>
              No matching workers found
            </h3>

            <p>
              We couldn't find a suitable verified
              worker for this location right now.
              Try another location or service.
            </p>

          </section>
        )}

    </div>
  );
}

export default JeevanSathi;

