import {
  useEffect,
  useRef,
  useState
} from "react";

import API from "../../services/api";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import "./JeevanSathi.css";


// =======================================================
// FIX LEAFLET MARKER ICON
// =======================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});


// =======================================================
// MAP CLICK COMPONENT
// =======================================================

function MapClickHandler({
  onLocationSelect
}) {

  useMapEvents({

    click(event) {

      const latitude =
        event.latlng.lat;

      const longitude =
        event.latlng.lng;

      onLocationSelect(
        latitude,
        longitude
      );
    }

  });

  return null;
}


// =======================================================
// MAIN COMPONENT
// =======================================================

function JeevanSathi({
  initialProblem = ""
}) {

  const [problem, setProblem] =
    useState(initialProblem);

  const [location, setLocation] =
    useState("");

  const [coordinates, setCoordinates] =
    useState(null);

  const [gettingLocation, setGettingLocation] =
    useState(false);

  const [showMap, setShowMap] =
    useState(false);

  const [mapCenter, setMapCenter] =
    useState([
      20.5937,
      78.9629
    ]);

  const [result, setResult] =
    useState(null);

  const [workers, setWorkers] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [workerLoading, setWorkerLoading] =
    useState(false);

  const [bookingWorker, setBookingWorker] =
    useState(null);

  const [error, setError] =
    useState("");


  // =======================================================
  // VOICE
  // =======================================================

  const [isListening, setIsListening] =
    useState(false);

  const [voiceSupported, setVoiceSupported] =
    useState(true);

  const recognitionRef =
    useRef(null);


  // =======================================================
  // INITIAL PROBLEM
  // =======================================================

  useEffect(() => {

    if (initialProblem) {

      setProblem(
        initialProblem
      );

      setError("");

    }

  }, [initialProblem]);


  // =======================================================
  // VOICE SETUP
  // =======================================================

  useEffect(() => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

      setVoiceSupported(false);

      return;

    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous =
      false;

    recognition.interimResults =
      true;

    recognition.maxAlternatives =
      1;

    recognition.lang =
      "en-IN";


    recognition.onstart = () => {

      setIsListening(true);

      setError("");

    };


    recognition.onresult = (
      event
    ) => {

      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {

        transcript +=
          event.results[i][0]
            .transcript;

      }

      transcript =
        transcript.trim();

      if (transcript) {

        setProblem(
          transcript
        );

      }

    };


    recognition.onerror = (
      event
    ) => {

      setIsListening(false);

      if (
        event.error ===
        "not-allowed"
      ) {

        setError(
          "🎙️ Microphone permission denied."
        );

      } else if (
        event.error ===
        "no-speech"
      ) {

        setError(
          "🔇 No speech detected."
        );

      } else if (
        event.error ===
        "audio-capture"
      ) {

        setError(
          "🎙️ Microphone not found."
        );

      } else {

        setError(
          "❌ Voice recognition failed."
        );

      }

    };


    recognition.onend = () => {

      setIsListening(false);

    };


    recognitionRef.current =
      recognition;


    return () => {

      try {

        recognition.stop();

      } catch {}

    };

  }, []);


  // =======================================================
  // VOICE TOGGLE
  // =======================================================

  const toggleVoice = () => {

    if (!voiceSupported) {

      setError(
        "Voice command is not supported. Please use Chrome or Edge."
      );

      return;

    }

    const recognition =
      recognitionRef.current;

    if (!recognition) {

      setError(
        "Voice recognition is unavailable."
      );

      return;

    }


    if (isListening) {

      try {

        recognition.stop();

      } catch {}

      return;

    }


    setError("");

    try {

      recognition.start();

    } catch (error) {

      if (
        error.name ===
        "InvalidStateError"
      ) {

        try {

          recognition.stop();

        } catch {}

        setTimeout(() => {

          try {

            recognition.start();

          } catch {

            setError(
              "Unable to start voice recognition."
            );

          }

        }, 300);

      } else {

        setError(
          "Unable to start voice recognition."
        );

      }

    }

  };


  // =======================================================
  // REVERSE GEOCODING
  // =======================================================

  const getReadableAddress = async (
    latitude,
    longitude
  ) => {

    try {

      const response =
        await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        );

      if (
        response.ok
      ) {

        const data =
          await response.json();

        if (
          data.display_name
        ) {

          return data.display_name;

        }

      }

    } catch (addressError) {

      console.log(
        "Address lookup unavailable:",
        addressError
      );

    }

    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

  };


  // =======================================================
  // SET SELECTED LOCATION
  // =======================================================

  const setSelectedLocation = async (
    latitude,
    longitude,
    accuracy = null
  ) => {

    setCoordinates({

      latitude,

      longitude,

      accuracy

    });


    setMapCenter([
      latitude,
      longitude
    ]);


    setLocation(
      `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
    );


    const readableAddress =
      await getReadableAddress(
        latitude,
        longitude
      );


    setLocation(
      readableAddress
    );


    setShowMap(false);

    setError("");

  };


  // =======================================================
  // GET EXACT GPS LOCATION
  // =======================================================

  const getExactLocation = () => {

    if (
      !navigator.geolocation
    ) {

      setError(
        "GPS location is not supported by this browser."
      );

      return;

    }


    setGettingLocation(true);

    setError("");


    navigator.geolocation.getCurrentPosition(

      async (position) => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        const accuracy =
          position.coords.accuracy;


        await setSelectedLocation(
          latitude,
          longitude,
          accuracy
        );


        setGettingLocation(
          false
        );

      },

      (locationError) => {

        console.error(
          "GPS error:",
          locationError
        );


        setGettingLocation(
          false
        );


        if (
          locationError.code === 1
        ) {

          setError(
            "📍 Location permission denied. Please allow location access in your browser."
          );

        } else if (
          locationError.code === 2
        ) {

          setError(
            "📍 Unable to determine your current location."
          );

        } else if (
          locationError.code === 3
        ) {

          setError(
            "📍 GPS request timed out. Please try again."
          );

        } else {

          setError(
            "📍 Unable to get your current location."
          );

        }

      },

      {

        enableHighAccuracy:
          true,

        timeout:
          20000,

        maximumAge:
          0

      }

    );

  };


  // =======================================================
  // OPEN MAP
  // =======================================================

  const openLocationMap = () => {

    setError("");

    setShowMap(true);


    if (coordinates) {

      setMapCenter([

        coordinates.latitude,

        coordinates.longitude

      ]);

      return;

    }


    // Try GPS only for map centering.
    // If permission is denied,
    // India remains the fallback.

    if (
      navigator.geolocation
    ) {

      navigator.geolocation.getCurrentPosition(

        (position) => {

          setMapCenter([

            position.coords.latitude,

            position.coords.longitude

          ]);

        },

        () => {

          setMapCenter([
            20.5937,
            78.9629
          ]);

        },

        {

          enableHighAccuracy:
            true,

          timeout:
            8000,

          maximumAge:
            60000

        }

      );

    }

  };


  // =======================================================
  // MAP LOCATION SELECT
  // =======================================================

  const handleMapLocationSelect =
    async (
      latitude,
      longitude
    ) => {

      setError("");

      await setSelectedLocation(
        latitude,
        longitude,
        null
      );

    };


  // =======================================================
  // AI ANALYSIS
  // =======================================================

  const analyzeProblem =
    async () => {

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

        const response =
          await API.post(
            "/ai/analyze",
            {
              problem:
                problem.trim()
            }
          );


        setResult(
          response.data.analysis
        );

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


  // =======================================================
  // FIND WORKERS
  // =======================================================

  const findWorkers =
    async () => {

      if (!result)
        return;


      if (!location.trim()) {

        setError(
          "Please share your exact location first."
        );

        return;

      }


      if (!coordinates) {

        setError(
          "Please use GPS or choose your location on the map first."
        );

        return;

      }


      setWorkerLoading(true);

      setError("");

      setWorkers([]);


      try {

        const response =
          await API.post(
            "/ai/match-workers",
            {

              skill:
                result.skill,

              location:
                location.trim()

            }
          );


        setWorkers(
          response.data.workers ||
          []
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


  // =======================================================
  // REQUEST WORKER
  // =======================================================

  const requestWorker =
    async (worker) => {

      if (!problem.trim()) {

        setError(
          "Problem description is missing."
        );

        return;

      }


      if (!location.trim()) {

        setError(
          "Please share your exact location."
        );

        return;

      }


      if (!coordinates) {

        setError(
          "Please choose your exact location using GPS or the map."
        );

        return;

      }


      setBookingWorker(
        worker.worker_id
      );

      setError("");


      try {

        const response =
          await API.post(
            "/citizen/jobs",
            {

              worker_id:
                worker.worker_id,

              service:
                result?.service ||
                result?.skill ||
                "General Service",

              description:
                problem.trim(),

              location:
                location.trim(),

              latitude:
                coordinates.latitude,

              longitude:
                coordinates.longitude,

              location_accuracy:
                coordinates.accuracy

            }
          );


        if (
          response.data.success
        ) {

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

        setBookingWorker(
          null
        );

      }

    };


  // =======================================================
  // EXAMPLE
  // =======================================================

  const useExample = () => {

    setProblem(
      "My AC is running but cooling is not working"
    );

    setLocation("");

    setCoordinates(
      null
    );

    setResult(null);

    setWorkers([]);

    setError("");

  };


  // =======================================================
  // CLEAR
  // =======================================================

  const clearAll = () => {

    setProblem("");

    setLocation("");

    setCoordinates(null);

    setResult(null);

    setWorkers([]);

    setError("");

    setShowMap(false);


    if (
      isListening &&
      recognitionRef.current
    ) {

      try {

        recognitionRef.current.stop();

      } catch {}

    }

  };


  // =======================================================
  // RESULT VALUES
  // =======================================================

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


  // =======================================================
  // RENDER
  // =======================================================

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
          PROBLEM
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


        <textarea
          className="problem-textarea"
          value={problem}
          onChange={(e) =>
            setProblem(
              e.target.value
            )
          }
          placeholder="Example: My AC is running but cooling is not working..."
        />


        {/* =================================================
            VOICE
        ================================================= */}

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

            ⚠️ Voice command is not supported
            in this browser. Try Chrome or Edge.

          </div>

        )}


        {/* =================================================
            LOCATION
        ================================================= */}

        <div className="location-input">

          <label>
            📍 Your Exact Service Location
          </label>


          <div className="gps-location-row">

            <input
              type="text"
              value={location}
              onChange={(e) => {

                setLocation(
                  e.target.value
                );

                setCoordinates(
                  null
                );

              }}
              placeholder="Use GPS or choose your location on map"
            />


            <button
              type="button"
              className="gps-location-btn"
              onClick={
                getExactLocation
              }
              disabled={
                gettingLocation
              }
            >

              {gettingLocation ? (

                <>

                  <span className="spinner"></span>

                  Getting GPS...

                </>

              ) : (

                <>

                  🎯 Use My Exact Location

                </>

              )}

            </button>

          </div>


          {/* =================================================
              MAP BUTTON
          ================================================= */}

          <div className="manual-location-actions">

            <button
              type="button"
              className="choose-map-btn"
              onClick={
                openLocationMap
              }
            >

              🗺️ Choose Location on Map

            </button>

            {coordinates && (

              <button
                type="button"
                className="change-location-btn"
                onClick={
                  openLocationMap
                }
              >

                ✏️ Change Location

              </button>

            )}

          </div>


          {/* =================================================
              MAP PICKER
          ================================================= */}

          {showMap && (

            <div className="location-map-wrapper">

              <div className="location-map-header">

                <div>

                  <strong>
                    🗺️ Choose your service location
                  </strong>

                  <span>
                    Tap anywhere on the map to place
                    your service location.
                  </span>

                </div>


                <button
                  type="button"
                  className="close-map-btn"
                  onClick={() =>
                    setShowMap(false)
                  }
                >
                  ✕
                </button>

              </div>


              <div className="location-map">

                <MapContainer
                  center={mapCenter}
                  zoom={
                    coordinates
                      ? 16
                      : 5
                  }
                  scrollWheelZoom={true}
                  style={{
                    height: "360px",
                    width: "100%"
                  }}
                >

                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />


                  <MapClickHandler
                    onLocationSelect={
                      handleMapLocationSelect
                    }
                  />


                  {coordinates && (

                    <Marker
                      position={[
                        coordinates.latitude,
                        coordinates.longitude
                      ]}
                    />

                  )}

                </MapContainer>

              </div>


              <div className="map-instruction">

                <span>
                  📌
                </span>

                <div>

                  <strong>
                    Select your location
                  </strong>

                  <p>
                    Click/tap on the exact place
                    where the service is needed.
                  </p>

                </div>

              </div>

            </div>

          )}


          {/* =================================================
              GPS SUCCESS
          ================================================= */}

          {coordinates && (

            <div className="gps-success">

              <div>

                <strong>
                  ✓ Location Selected
                </strong>

                <span>

                  {coordinates.accuracy
                    ? `GPS Accuracy: ±${Math.round(
                        coordinates.accuracy
                      )} metres`
                    : "Location selected manually on map"}

                </span>

              </div>

              <small>

                {coordinates.latitude.toFixed(6)}

                {" , "}

                {coordinates.longitude.toFixed(6)}

              </small>

            </div>

          )}

        </div>


        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="ai-actions">

          <button
            className="analyze-btn"
            onClick={
              analyzeProblem
            }
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
            onClick={
              useExample
            }
          >

            💡 Try Example

          </button>


          <button
            className="clear-btn"
            onClick={
              clearAll
            }
          >

            ↻ Clear

          </button>

        </div>


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
            onClick={
              findWorkers
            }
            disabled={
              workerLoading
            }
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

            {workers.map(
              (worker) => (

                <div
                  className="matched-worker-card"
                  key={
                    worker.worker_id
                  }
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
                      requestWorker(
                        worker
                      )
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

              )
            )}

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

            <div>
              🔍
            </div>

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