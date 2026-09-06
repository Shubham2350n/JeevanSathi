import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./LocationTracker.css";

const validPhone = (phone) =>
  /^\d{10}$/.test(String(phone || ""));

const distanceKm = (a, b) => {
  if (!a || !b) return null;

  const R = 6371;
  const rad = Math.PI / 180;

  const dLat = (b.latitude - a.latitude) * rad;
  const dLon = (b.longitude - a.longitude) * rad;

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 *
      Math.cos(a.latitude * rad) *
      Math.cos(b.latitude * rad);

  return (
    R *
    2 *
    Math.atan2(
      Math.sqrt(x),
      Math.sqrt(1 - x)
    )
  );
};

function FitMap({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    if (points.length === 1) {
      map.setView(points[0], 15);
    } else {
      map.fitBounds(points, {
        padding: [35, 35]
      });
    }
  }, [map, points]);

  return null;
}

export default function LocationTracker({
  jobId,
  myRole = "worker",
  enabled = true
}) {
  const [mine, setMine] = useState(null);
  const [other, setOther] = useState(null);
  const [myPhone, setMyPhone] = useState("");
  const [otherPhone, setOtherPhone] = useState("");
  const [otherName, setOtherName] = useState("");
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [route, setRoute] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);

  const watchRef = useRef(null);
  const worker = myRole === "worker";

  const load = async () => {
    if (!jobId) return;

    try {
      const { data } = await API.get(
        `/location/job/${jobId}`
      );

      if (!data?.success) return;

      const myData = worker
        ? data.worker_location
        : data.citizen_location;

      const otherData = worker
        ? data.citizen_location
        : data.worker_location;

      const myPerson = worker
        ? data.worker
        : data.citizen;

      const otherPerson = worker
        ? data.citizen
        : data.worker;

      if (myPerson?.phone) {
        setMyPhone(String(myPerson.phone));
      }

      if (otherPerson?.phone) {
        setOtherPhone(String(otherPerson.phone));
      }

      if (otherPerson?.name) {
        setOtherName(otherPerson.name);
      }

      if (
        myData?.latitude != null &&
        myData?.longitude != null
      ) {
        setMine(myData);
      }

      if (
        otherData?.latitude != null &&
        otherData?.longitude != null
      ) {
        setOther(otherData);

        if (otherData.updated_at) {
          setUpdatedAt(
            new Date(otherData.updated_at)
          );
        }
      }
    } catch (err) {
      console.error(
        "Location loading error:",
        err
      );
    }
  };

  const sendLocation = async (position) => {
    const {
      latitude,
      longitude,
      accuracy
    } = position.coords;

    setMine({
      latitude,
      longitude,
      accuracy
    });

    try {
      const { data } = await API.post(
        "/location/update",
        {
          job_id: jobId,
          latitude,
          longitude,
          accuracy
        }
      );

      if (data?.success) {
        setTracking(true);
        setError("");
        setUpdatedAt(new Date());
      }
    } catch (err) {
      setTracking(false);

      setError(
        err.response?.data?.message ||
          "Unable to update your location."
      );
    } finally {
      setLoading(false);
    }
  };

  const startTracking = () => {
    setError("");

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    if (watchRef.current !== null) {
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await sendLocation(position);

        watchRef.current =
          navigator.geolocation.watchPosition(
            sendLocation,
            (geoError) => {
              console.error(
                "GPS watch error:",
                geoError
              );

              setTracking(false);

              if (geoError.code === 1) {
                setError(
                  "Location permission denied. Please allow GPS access."
                );
              }
            },
            {
              enableHighAccuracy: true,
              maximumAge: 3000,
              timeout: 20000
            }
          );
      },
      (geoError) => {
        setLoading(false);
        setTracking(false);

        if (geoError.code === 1) {
          setError(
            "Please allow location access to start live tracking."
          );
        } else {
          setError(
            "Could not get your current GPS location."
          );
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 20000
      }
    );
  };

  const stopTracking = () => {
    if (
      watchRef.current !== null &&
      navigator.geolocation
    ) {
      navigator.geolocation.clearWatch(
        watchRef.current
      );
    }

    watchRef.current = null;
    setTracking(false);
  };

  useEffect(() => {
    if (!enabled || !jobId) return;

    load();

    const interval = setInterval(
      load,
      3000
    );

    return () => {
      clearInterval(interval);

      if (
        watchRef.current !== null &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(
          watchRef.current
        );
      }

      watchRef.current = null;
    };
  }, [jobId, enabled, myRole]);

  // Build a road-following route when both GPS points exist.
  useEffect(() => {
    let cancelled = false;

    const buildRoute = async () => {
      if (!mine || !other) {
        setRoute([]);
        return;
      }

      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${mine.longitude},${mine.latitude};` +
          `${other.longitude},${other.latitude}` +
          `?overview=full&geometries=geojson`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Route service unavailable");
        }

        const data = await response.json();

        const coordinates =
          data?.routes?.[0]?.geometry?.coordinates ||
          [];

        if (!coordinates.length) {
          throw new Error("No route returned");
        }

        if (!cancelled) {
          setRoute(
            coordinates.map(
              ([lng, lat]) => [lat, lng]
            )
          );
        }
      } catch (err) {
        console.warn(
          "Road route unavailable:",
          err
        );

        if (!cancelled) {
          setRoute([
            [mine.latitude, mine.longitude],
            [other.latitude, other.longitude]
          ]);
        }
      }
    };

    buildRoute();

    return () => {
      cancelled = true;
    };
  }, [
    mine?.latitude,
    mine?.longitude,
    other?.latitude,
    other?.longitude
  ]);

  if (!enabled) {
    return null;
  }

  const km = distanceKm(
    mine,
    other
  );

  const eta =
    km == null
      ? null
      : Math.max(
          2,
          Math.ceil((km / 24) * 60)
        );

  const points = [
    mine &&
      [
        mine.latitude,
        mine.longitude
      ],
    other &&
      [
        other.latitude,
        other.longitude
      ]
  ].filter(Boolean);

  const openMap = () => {
    if (!other) return;

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${other.latitude},${other.longitude}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const displayOtherPhone = validPhone(
    otherPhone
  )
    ? otherPhone
    : "";

  return (
    <div className="location-tracker-card">

      <div className="tracking-head">
        <div className="tracking-title">
          <div className="tracking-icon">
            📍
          </div>

          <div>
            <span>
              LIVE SERVICE TRACKING
            </span>

            <h3>
              {worker
                ? "Reach the citizen"
                : "Your worker is on the way"}
            </h3>

            <p>
              Both sides can share live location
            </p>
          </div>
        </div>

        <b
          className={
            tracking
              ? "live-badge"
              : "waiting-badge"
          }
        >
          <i />
          {tracking
            ? "LIVE"
            : "READY"}
        </b>
      </div>

      <div className="tracking-hero">
        <div>
          <small>
            ESTIMATED ARRIVAL
          </small>

          <strong>
            {eta
              ? `${eta} min`
              : "Calculating…"}
          </strong>

          <span>
            {km != null
              ? `${km.toFixed(1)} km away`
              : other
                ? "Calculating distance"
                : "Waiting for live GPS"}
          </span>
        </div>

        <div className="journey-line">
          <span className="journey-point green" />

          <div>
            <b>You</b>
            <small>
              {mine
                ? "Location shared"
                : "Start live location"}
            </small>
          </div>

          <em />

          <span className="journey-point blue" />

          <div>
            <b>
              {worker
                ? "Citizen"
                : "Worker"}
            </b>

            <small>
              {other
                ? "Location received"
                : "Waiting for GPS"}
            </small>
          </div>
        </div>
      </div>

      <div className="tracking-map">
        {points.length > 0 ? (
          <MapContainer
            center={points[0]}
            zoom={14}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FitMap points={points} />

            {mine && (
              <CircleMarker
                center={[
                  mine.latitude,
                  mine.longitude
                ]}
                radius={9}
                pathOptions={{
                  color: "#087f68",
                  fillColor: "#16c79a",
                  fillOpacity: 1
                }}
              />
            )}

            {other && (
              <CircleMarker
                center={[
                  other.latitude,
                  other.longitude
                ]}
                radius={9}
                pathOptions={{
                  color: "#2563eb",
                  fillColor: "#60a5fa",
                  fillOpacity: 1
                }}
              />
            )}

            {route.length > 1 && (
              <Polyline
                positions={route}
                pathOptions={{
                  color: "#16a085",
                  weight: 5,
                  opacity: 0.85,
                  dashArray: "8 8"
                }}
              />
            )}
          </MapContainer>
        ) : (
          <div className="map-placeholder">
            🗺️
            <b>
              Waiting for live location
            </b>
            <span>
              Start live location on either side
              to see the journey.
            </span>
          </div>
        )}

        <div className="map-live-label">
          ● Live route
        </div>
      </div>

      <div className="tracking-steps">
        <div className="track-step done">
          <span>✓</span>

          <div>
            <b>
              Request accepted
            </b>

            <small>
              Service assigned
            </small>
          </div>
        </div>

        <div
          className={
            tracking
              ? "track-step done"
              : "track-step current"
          }
        >
          <span>
            {tracking ? "✓" : "2"}
          </span>

          <div>
            <b>
              {worker
                ? "Live location shared"
                : "Worker travelling"}
            </b>

            <small>
              {tracking
                ? "Your GPS is updating"
                : "Tap Start Live Location"}
            </small>
          </div>
        </div>

        <div
          className={
            other
              ? "track-step current"
              : "track-step"
          }
        >
          <span>3</span>

          <div>
            <b>
              {worker
                ? "Reach citizen"
                : "Worker arrives"}
            </b>

            <small>
              {eta
                ? `Around ${eta} min`
                : "ETA pending"}
            </small>
          </div>
        </div>
      </div>

      <div className="tracking-contact">
        <div className="contact-avatar">
          {worker ? "👤" : "👷"}
        </div>

        <div className="contact-text">
          <span>
            {worker
              ? "CITIZEN"
              : "WORKER"}
          </span>

          <b>
            {otherName ||
              (worker
                ? "Citizen"
                : "Worker")}
          </b>

          <small>
            {displayOtherPhone ||
              "Phone number unavailable"}
          </small>
        </div>

        <div className="contact-actions">
          {displayOtherPhone && (
            <a
              href={`tel:${displayOtherPhone}`}
            >
              📞 Call
            </a>
          )}

          {other && (
            <button
              type="button"
              onClick={openMap}
            >
              🗺️ Map
            </button>
          )}
        </div>
      </div>

      <div className="tracking-actions">
        <small>
          🔄{" "}
          {updatedAt
            ? `Other side updated ${updatedAt.toLocaleTimeString()}`
            : "Waiting for location update"}
        </small>

        {!tracking ? (
          <button
            type="button"
            className="tracking-start"
            onClick={startTracking}
            disabled={loading}
          >
            {loading
              ? "Getting location…"
              : "📡 Start Live Location"}
          </button>
        ) : (
          <button
            type="button"
            className="tracking-stop"
            onClick={stopTracking}
          >
            ⏹ Stop Sharing
          </button>
        )}
      </div>

      {error && (
        <div className="tracking-error">
          ⚠️ {error}
        </div>
      )}

      <p className="tracking-privacy">
        🔒 Location is used only for this active
        service request.
      </p>
    </div>
  );
}
