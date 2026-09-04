import { useEffect, useState } from "react";
import API from "../../services/api";
import "./WorkerDashboard.css";

function WorkerDashboard() {
  const [worker, setWorker] = useState(null);
  const [requests, setRequests] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ==========================================
  // LOAD WORKER DATA
  // ==========================================

  const loadWorkerData = async () => {
    try {
      const [
        profileResponse,
        requestResponse,
        activeResponse,
        completedResponse,
      ] = await Promise.all([
        API.get("/worker/profile", authConfig),
        API.get("/worker/jobs/requests", authConfig),
        API.get("/worker/jobs/active", authConfig),
        API.get("/worker/jobs/completed", authConfig),
      ]);

      setWorker(profileResponse.data.worker);

      setRequests(requestResponse.data.jobs || []);

      setActiveJobs(activeResponse.data.jobs || []);

      setCompletedJobs(
        completedResponse.data.jobs || []
      );
    } catch (error) {
      console.error(
        "Worker data error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkerData();
  }, []);

  // ==========================================
  // UPDATE AVAILABILITY
  // ==========================================

  const updateAvailability = async (value) => {
    if (availabilityLoading) return;

    setAvailabilityLoading(true);

    try {
      const response = await API.put(
        "/worker/availability",
        {
          available: value,
        },
        authConfig
      );

      setWorker((currentWorker) => ({
        ...currentWorker,
        available:
          response.data.available,
      }));

    } catch (error) {
      console.error(
        "Availability error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to update availability"
      );
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // ==========================================
  // ACCEPT JOB
  // ==========================================

  const acceptJob = async (jobId) => {
    try {
      await API.put(
        `/worker/jobs/${jobId}/accept`,
        {},
        authConfig
      );

      alert(
        "Job accepted successfully!"
      );

      await loadWorkerData();
    } catch (error) {
      console.error(
        "Accept job error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to accept job"
      );
    }
  };

  // ==========================================
  // REJECT JOB
  // ==========================================

  const rejectJob = async (jobId) => {
    try {
      await API.put(
        `/worker/jobs/${jobId}/reject`,
        {},
        authConfig
      );

      alert(
        "Job rejected successfully!"
      );

      await loadWorkerData();
    } catch (error) {
      console.error(
        "Reject job error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to reject job"
      );
    }
  };

  // ==========================================
  // START JOB
  // ==========================================

  const startJob = async (jobId) => {
    try {
      await API.put(
        `/worker/jobs/${jobId}/start`,
        {},
        authConfig
      );

      alert(
        "Job started successfully!"
      );

      await loadWorkerData();
    } catch (error) {
      console.error(
        "Start job error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to start job"
      );
    }
  };

  // ==========================================
  // COMPLETE JOB
  // ==========================================

  const completeJob = async (jobId) => {
    try {
      await API.put(
        `/worker/jobs/${jobId}/complete`,
        {},
        authConfig
      );

      alert(
        "Job completed successfully!"
      );

      await loadWorkerData();
    } catch (error) {
      console.error(
        "Complete job error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to complete job"
      );
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    setMobileMenuOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="worker-loading-page">
        <div className="worker-loading-card">
          <div className="loading-worker-icon">
            👷
          </div>

          <h2>
            Loading JeevanSetu...
          </h2>

          <p>
            Preparing your worker dashboard
          </p>

          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="worker-dashboard">

      {/* ========================================
          SIDEBAR
      ======================================== */}

      <button
        type="button"
        className="worker-mobile-menu-button"
        aria-label="Open navigation menu"
        aria-expanded={mobileMenuOpen}
        onClick={() => setMobileMenuOpen(true)}
      >
        ☰
      </button>

      {mobileMenuOpen && (
        <button
          type="button"
          className="worker-mobile-overlay"
          aria-label="Close navigation menu"
          onClick={closeMobileMenu}
        />
      )}

      <aside className={mobileMenuOpen ? "worker-sidebar mobile-open" : "worker-sidebar"}>

        <button
          type="button"
          className="worker-mobile-close"
          aria-label="Close navigation menu"
          onClick={closeMobileMenu}
        >
          ×
        </button>

        <div className="sidebar-brand">
          <div className="brand-symbol">
            JS
          </div>

          <div>
            <h2>
              Jeevan<span>Setu</span>
            </h2>

            <small>
              WORKER PORTAL
            </small>
          </div>
        </div>

        {/* SIDEBAR PROFILE */}

        <div className="sidebar-worker-profile">

          <div className="sidebar-worker-avatar">
            👷
          </div>

          <div className="sidebar-worker-info">
            <strong>
              {worker?.name || "Worker"}
            </strong>

            <span>
              {worker?.skill || "Skilled Worker"}
            </span>
          </div>

        </div>

        {/* NAVIGATION */}

        <nav className="worker-nav">

          <a
            href="#dashboard"
            className="worker-nav-item active"
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">
              🏠
            </span>

            Dashboard
          </a>

          <a
            href="#requests"
            className="worker-nav-item"
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">
              📩
            </span>

            Job Requests

            {requests.length > 0 && (
              <span className="nav-count">
                {requests.length}
              </span>
            )}
          </a>

          <a
            href="#active"
            className="worker-nav-item"
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">
              🔧
            </span>

            Active Jobs

            {activeJobs.length > 0 && (
              <span className="nav-count blue">
                {activeJobs.length}
              </span>
            )}
          </a>

          <a
            href="#completed"
            className="worker-nav-item"
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">
              ✅
            </span>

            Completed

            {completedJobs.length > 0 && (
              <span className="nav-count green">
                {completedJobs.length}
              </span>
            )}
          </a>

          <a
            href="#profile"
            className="worker-nav-item"
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">
              👤
            </span>

            My Profile
          </a>

        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          <div className="sidebar-current-status">

            <span>
              CURRENT STATUS
            </span>

            <div
              className={
                worker?.available
                  ? "current-status available"
                  : "current-status busy"
              }
            >
              <i></i>

              {worker?.available
                ? "Available for Work"
                : "Currently Busy"}
            </div>

          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={logout}
          >
            <span>🚪</span>
            Logout
          </button>

        </div>

      </aside>


      {/* ========================================
          MAIN CONTENT
      ======================================== */}

      <main
        className="worker-main"
        id="dashboard"
      >

        {/* ======================================
            TOP HEADER
        ====================================== */}

        <header className="worker-topbar">

          <div>

            <span className="topbar-label">
              WORKER DASHBOARD
            </span>

            <h1>
              Welcome back,{" "}
              {worker?.name || "Worker"} 👋
            </h1>

            <p>
              Manage your service requests
              and jobs with JeevanSetu.
            </p>

          </div>

          <div className="topbar-right">

            <div className="topbar-status">

              <span
                className={
                  worker?.available
                    ? "top-status-dot green"
                    : "top-status-dot red"
                }
              ></span>

              {worker?.available
                ? "Available"
                : "Busy"}

            </div>

            <button
              type="button"
              className="topbar-logout"
              onClick={logout}
            >
              Logout
            </button>

          </div>

        </header>


        {/* ======================================
            PROFILE CARD
        ====================================== */}

        <section
          className="worker-profile-card"
          id="profile"
        >

          <div className="worker-profile-main">

            <div className="worker-big-avatar">
              👷
            </div>

            <div className="worker-profile-details">

              <div className="worker-name-line">

                <h2>
                  {worker?.name || "Worker"}
                </h2>

                {worker?.verified && (
                  <span className="verified-badge">
                    ✓ Government Verified
                  </span>
                )}

              </div>

              <div className="worker-skill-line">
                🔧 {worker?.skill || "Skilled Worker"}
              </div>

              <div className="worker-location-line">
                📍 {worker?.location || "Location not available"}
              </div>

            </div>

          </div>


          <div className="profile-stats">

            <div className="profile-stat">

              <span className="profile-stat-icon">
                ⭐
              </span>

              <div>
                <strong>
                  {worker?.rating
                    ? Number(worker.rating).toFixed(1)
                    : "New"}
                </strong>

                <small>
                  Rating
                </small>
              </div>

            </div>


            <div className="profile-stat">

              <span className="profile-stat-icon">
                💼
              </span>

              <div>
                <strong>
                  {worker?.experience || 0}
                </strong>

                <small>
                  Years Experience
                </small>
              </div>

            </div>


            <div className="profile-stat">

              <span className="profile-stat-icon">
                🏅
              </span>

              <div>
                <strong>
                  {worker?.verified
                    ? "Verified"
                    : "Pending"}
                </strong>

                <small>
                  Verification
                </small>
              </div>

            </div>

          </div>

        </section>


        {/* ======================================
            AVAILABILITY CARD
        ====================================== */}

        <section className="availability-card">

          <div className="availability-left">

            <div className="availability-icon">
              {worker?.available
                ? "🟢"
                : "🔴"}
            </div>

            <div>

              <h2>
                Availability
              </h2>

              <p>
                Choose whether you are currently
                accepting new service requests.
              </p>

            </div>

          </div>


          <div className="availability-controls">

            <button
              type="button"
              className={
                worker?.available
                  ? "availability-option available active"
                  : "availability-option available"
              }
              disabled={availabilityLoading}
              onClick={() =>
                updateAvailability(true)
              }
            >
              <span className="availability-dot green"></span>

              Available

              {worker?.available && (
                <span className="check-mark">
                  ✓
                </span>
              )}
            </button>


            <button
              type="button"
              className={
                !worker?.available
                  ? "availability-option busy active"
                  : "availability-option busy"
              }
              disabled={availabilityLoading}
              onClick={() =>
                updateAvailability(false)
              }
            >
              <span className="availability-dot red"></span>

              Busy

              {!worker?.available && (
                <span className="check-mark">
                  ✓
                </span>
              )}
            </button>

          </div>

        </section>


        {/* ======================================
            SKILLS & CERTIFICATIONS
        ====================================== */}

        <section className="skills-card">

          <div className="content-heading">

            <div className="heading-icon pink">
              🏆
            </div>

            <div>
              <h2>
                Skills & Certifications
              </h2>

              <p>
                Your verified professional details
              </p>
            </div>

          </div>


          <div className="skills-grid">

            <div className="skill-box">

              <div className="skill-box-icon">
                🔧
              </div>

              <div>
                <span>
                  PRIMARY SKILL
                </span>

                <strong>
                  {worker?.skill ||
                    "Not specified"}
                </strong>
              </div>

            </div>


            <div className="skill-box">

              <div className="skill-box-icon">
                🎓
              </div>

              <div>
                <span>
                  CERTIFICATION
                </span>

                <strong>
                  {worker?.certifications ||
                    "Government Skill Certification"}
                </strong>
              </div>

            </div>


            <div className="skill-box">

              <div className="skill-box-icon">
                📍
              </div>

              <div>
                <span>
                  SERVICE AREA
                </span>

                <strong>
                  {worker?.location ||
                    "Not specified"}
                </strong>
              </div>

            </div>

          </div>

        </section>


        {/* ======================================
            JOB REQUESTS
        ====================================== */}

        <section
          className="jobs-section"
          id="requests"
        >

          <div className="section-top">

            <div className="section-heading">

              <div className="section-heading-icon pink">
                📩
              </div>

              <div>

                <h2>
                  New Job Requests
                </h2>

                <p>
                  Service requests from citizens
                </p>

              </div>

            </div>

            <span className="section-count pink">
              {requests.length}
            </span>

          </div>


          {requests.length === 0 ? (

            <div className="empty-state">

              <div className="empty-state-icon">
                📭
              </div>

              <h3>
                No new requests
              </h3>

              <p>
                New citizen service requests
                will appear here.
              </p>

            </div>

          ) : (

            <div className="jobs-grid">

              {requests.map((job) => (

                <div
                  className="job-card"
                  key={job.id}
                >

                  <div className="job-card-top">

                    <div className="job-service-icon pink">
                      🔧
                    </div>

                    <span className="job-status request">
                      New Request
                    </span>

                  </div>

                  <h3>
                    {job.service}
                  </h3>

                  <p className="job-description">
                    {job.description ||
                      "No description provided."}
                  </p>

                  <div className="job-meta">

                    <div>
                      <span>👤</span>
                      {job.citizen_name ||
                        "Citizen"}
                    </div>

                    <div>
                      <span>📍</span>
                      {job.location ||
                        "Location not provided"}
                    </div>

                  </div>

                  <div className="job-actions">

                    <button
                      type="button"
                      className="job-accept"
                      onClick={() =>
                        acceptJob(job.id)
                      }
                    >
                      ✓ Accept
                    </button>

                    <button
                      type="button"
                      className="job-reject"
                      onClick={() =>
                        rejectJob(job.id)
                      }
                    >
                      ✕ Reject
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* ======================================
            ACTIVE JOBS
        ====================================== */}

        <section
          className="jobs-section"
          id="active"
        >

          <div className="section-top">

            <div className="section-heading">

              <div className="section-heading-icon blue">
                🔧
              </div>

              <div>

                <h2>
                  Active Jobs
                </h2>

                <p>
                  Jobs currently assigned to you
                </p>

              </div>

            </div>

            <span className="section-count blue">
              {activeJobs.length}
            </span>

          </div>


          {activeJobs.length === 0 ? (

            <div className="empty-state">

              <div className="empty-state-icon">
                🔧
              </div>

              <h3>
                No active jobs
              </h3>

              <p>
                Accepted jobs will appear here.
              </p>

            </div>

          ) : (

            <div className="jobs-grid">

              {activeJobs.map((job) => (

                <div
                  className="job-card active-card"
                  key={job.id}
                >

                  <div className="job-card-top">

                    <div className="job-service-icon blue">
                      🔧
                    </div>

                    <span
                      className={
                        job.status ===
                        "in_progress"
                          ? "job-status progress"
                          : "job-status accepted"
                      }
                    >
                      {job.status ===
                      "in_progress"
                        ? "In Progress"
                        : "Accepted"}
                    </span>

                  </div>

                  <h3>
                    {job.service}
                  </h3>

                  <p className="job-description">
                    {job.description ||
                      "No description provided."}
                  </p>

                  <div className="job-meta">

                    <div>
                      <span>👤</span>
                      {job.citizen_name ||
                        "Citizen"}
                    </div>

                    <div>
                      <span>📍</span>
                      {job.location ||
                        "Location not provided"}
                    </div>

                  </div>


                  {job.status ===
                    "accepted" && (

                    <button
                      type="button"
                      className="job-start"
                      onClick={() =>
                        startJob(job.id)
                      }
                    >
                      ▶ Start Job
                    </button>

                  )}


                  {job.status ===
                    "in_progress" && (

                    <button
                      type="button"
                      className="job-complete"
                      onClick={() =>
                        completeJob(job.id)
                      }
                    >
                      ✓ Mark as Completed
                    </button>

                  )}

                </div>

              ))}

            </div>

          )}

        </section>


        {/* ======================================
            COMPLETED JOBS
        ====================================== */}

        <section
          className="jobs-section"
          id="completed"
        >

          <div className="section-top">

            <div className="section-heading">

              <div className="section-heading-icon green">
                ✅
              </div>

              <div>

                <h2>
                  Completed Jobs
                </h2>

                <p>
                  Your completed service history
                </p>

              </div>

            </div>

            <span className="section-count green">
              {completedJobs.length}
            </span>

          </div>


          {completedJobs.length === 0 ? (

            <div className="empty-state">

              <div className="empty-state-icon">
                ✅
              </div>

              <h3>
                No completed jobs yet
              </h3>

              <p>
                Completed services will appear
                here after you finish a job.
              </p>

            </div>

          ) : (

            <div className="jobs-grid">

              {completedJobs.map((job) => (

                <div
                  className="job-card completed-card"
                  key={job.id}
                >

                  <div className="job-card-top">

                    <div className="job-service-icon green">
                      ✓
                    </div>

                    <span className="job-status completed">
                      Completed
                    </span>

                  </div>

                  <h3>
                    {job.service}
                  </h3>

                  <p className="job-description">
                    {job.description ||
                      "Service completed successfully."}
                  </p>

                  <div className="job-meta">

                    <div>
                      <span>📍</span>
                      {job.location ||
                        "Location not provided"}
                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* ======================================
            FOOTER
        ====================================== */}

        <footer className="worker-footer">

          <div>
            <strong>
              Jeevan<span>Setu</span>
            </strong>

            <p>
              Trusted Services • Skilled Hands •
              Connected by AI
            </p>
          </div>

          <span>
            Worker Portal
          </span>

        </footer>

      </main>

    </div>
  );
}

export default WorkerDashboard;