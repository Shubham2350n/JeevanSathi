import { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend
} from "recharts";

import API from "../../services/api";
import "./GovernmentDashboard.css";


function GovernmentDashboard() {

  // =========================================================
  // STATES
  // =========================================================

  const [dashboard, setDashboard] = useState(null);

  const [workers, setWorkers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [complaints, setComplaints] = useState([]);

  const [complaintStats, setComplaintStats] = useState({
    total: 0,
    pending: 0,
    investigating: 0,
    resolved: 0,
    high_priority: 0
  });

  const [skillData, setSkillData] = useState([]);
  const [locationData, setLocationData] = useState([]);

  const [reviewData, setReviewData] = useState({
    rating_distribution: [],
    recent_reviews: []
  });

  const [topWorkers, setTopWorkers] = useState([]);

  // Filters
  const [workerSearch, setWorkerSearch] = useState("");
  const [workerVerification, setWorkerVerification] = useState("all");

  const [jobSearch, setJobSearch] = useState("");
  const [jobStatus, setJobStatus] = useState("all");

  const [complaintSearch, setComplaintSearch] = useState("");
  const [complaintStatus, setComplaintStatus] = useState("all");
  const [complaintPriority, setComplaintPriority] = useState("all");

  // Modals
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [complaintNote, setComplaintNote] = useState("");
  const [complaintActionLoading, setComplaintActionLoading] =
    useState(false);

  const [activeSection, setActiveSection] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);


  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  const loadDashboard = async () => {
    try {
      const response = await API.get("/government/dashboard");
      setDashboard(response.data);
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };


  // =========================================================
  // LOAD WORKERS
  // =========================================================

  const loadWorkers = async () => {
    try {

      const params = {};

      if (workerSearch.trim()) {
        params.search = workerSearch.trim();
      }

      if (workerVerification !== "all") {
        params.verified = workerVerification;
      }

      const response = await API.get(
        "/government/workers",
        { params }
      );

      setWorkers(response.data);

    } catch (error) {
      console.error("Workers error:", error);
    }
  };


  // =========================================================
  // LOAD JOBS
  // =========================================================

  const loadJobs = async () => {
    try {

      const params = {};

      if (jobSearch.trim()) {
        params.search = jobSearch.trim();
      }

      if (jobStatus !== "all") {
        params.status = jobStatus;
      }

      const response = await API.get(
        "/government/jobs",
        { params }
      );

      setJobs(response.data);

    } catch (error) {
      console.error("Jobs error:", error);
    }
  };


  // =========================================================
  // LOAD COMPLAINTS
  // =========================================================

  const loadComplaints = async () => {
    try {

      const params = {};

      if (complaintSearch.trim()) {
        params.search = complaintSearch.trim();
      }

      if (complaintStatus !== "all") {
        params.status = complaintStatus;
      }

      if (complaintPriority !== "all") {
        params.priority = complaintPriority;
      }

      const response = await API.get(
        "/government/complaints",
        { params }
      );

      setComplaints(response.data);

    } catch (error) {
      console.error("Complaints error:", error);
    }
  };


  // =========================================================
  // LOAD COMPLAINT STATS
  // =========================================================

  const loadComplaintStats = async () => {
    try {

      const response = await API.get(
        "/government/analytics/complaints"
      );

      setComplaintStats(response.data);

    } catch (error) {
      console.error("Complaint stats error:", error);
    }
  };


  // =========================================================
  // LOAD ANALYTICS
  // =========================================================

  const loadAnalytics = async () => {
    try {

      const [
        skills,
        locations,
        reviews,
        top
      ] = await Promise.all([

        API.get("/government/analytics/skills"),

        API.get("/government/analytics/locations"),

        API.get("/government/analytics/reviews"),

        API.get("/government/analytics/top-workers")

      ]);

      setSkillData(skills.data);
      setLocationData(locations.data);
      setReviewData(reviews.data);
      setTopWorkers(top.data);

    } catch (error) {
      console.error("Analytics error:", error);
    }
  };


  // =========================================================
  // LOAD EVERYTHING
  // =========================================================

  const loadAllData = async () => {

    setLoading(true);

    await Promise.all([
      loadDashboard(),
      loadWorkers(),
      loadJobs(),
      loadComplaints(),
      loadComplaintStats(),
      loadAnalytics()
    ]);

    setLoading(false);
  };


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadAllData();
  }, []);


  // =========================================================
  // FILTER EFFECTS
  // =========================================================

  useEffect(() => {

    if (!loading) {
      loadWorkers();
    }

  }, [workerSearch, workerVerification]);


  useEffect(() => {

    if (!loading) {
      loadJobs();
    }

  }, [jobSearch, jobStatus]);


  useEffect(() => {

    if (!loading) {
      loadComplaints();
    }

  }, [
    complaintSearch,
    complaintStatus,
    complaintPriority
  ]);


  const goToSection = (section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };


  // =========================================================
  // WORKER MANAGEMENT
  // =========================================================

  const openWorker = (worker) => {
    setSelectedWorker(worker);
  };


  const closeWorker = () => {
    setSelectedWorker(null);
  };


  const verifyWorker = async (workerId) => {

    try {

      await API.put(
        `/government/workers/${workerId}`,
        {
          verified: true
        }
      );

      alert("Worker verified successfully");

      setSelectedWorker(null);

      await loadWorkers();
      await loadDashboard();

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Unable to verify worker"
      );
    }
  };


  const unverifyWorker = async (workerId) => {

    try {

      await API.put(
        `/government/workers/${workerId}`,
        {
          verified: false
        }
      );

      alert("Worker verification removed");

      setSelectedWorker(null);

      await loadWorkers();
      await loadDashboard();

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Unable to update worker"
      );
    }
  };


  // =========================================================
  // COMPLAINT MANAGEMENT
  // =========================================================

  const openComplaint = (complaint) => {

    setSelectedComplaint(complaint);

    setComplaintNote(
      complaint.resolution_note || ""
    );
  };


  const closeComplaint = () => {

    if (complaintActionLoading) {
      return;
    }

    setSelectedComplaint(null);
    setComplaintNote("");
  };


  const updateComplaintStatus = async (status) => {

    if (!selectedComplaint) {
      return;
    }

    if (
      status === "resolved" &&
      !complaintNote.trim()
    ) {

      alert(
        "Please enter a resolution note."
      );

      return;
    }

    try {

      setComplaintActionLoading(true);

      await API.put(
        `/government/complaints/${selectedComplaint.id}/status`,
        {
          status,
          resolution_note:
            complaintNote.trim()
        }
      );

      alert(
        "Complaint updated successfully"
      );

      setSelectedComplaint(null);
      setComplaintNote("");

      await loadComplaints();
      await loadComplaintStats();
      await loadDashboard();

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Unable to update complaint"
      );

    } finally {

      setComplaintActionLoading(false);
    }
  };


  // =========================================================
  // HELPERS
  // =========================================================

  const formatDate = (date) => {

    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString();
  };


  const formatStatus = (status) => {

    if (!status) {
      return "Unknown";
    }

    return status
      .replace("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };


  const getStatusClass = (status) => {

    if (
      status === "completed" ||
      status === "resolved"
    ) {
      return "status-success";
    }

    if (
      status === "accepted"
    ) {
      return "status-info";
    }

    if (
      status === "in_progress" ||
      status === "investigating"
    ) {
      return "status-warning";
    }

    if (
      status === "rejected"
    ) {
      return "status-danger";
    }

    return "status-pending";
  };


  const getPriorityClass = (priority) => {

    if (priority === "high") {
      return "status-danger";
    }

    if (priority === "medium") {
      return "status-warning";
    }

    return "status-info";
  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="loading-page">

        <div className="loading-box">

          <div className="loading-spinner"></div>

          <h3>
            Loading JeevanSetu
          </h3>

          <p>
            Preparing government dashboard...
          </p>

        </div>

      </div>
    );
  }


  // =========================================================
  // MAIN UI
  // =========================================================

  return (

    <div className="app">


      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <button
        type="button"
        className="government-mobile-menu-button"
        aria-label="Open navigation menu"
        aria-expanded={mobileMenuOpen}
        onClick={() => setMobileMenuOpen(true)}
      >
        ☰
      </button>

      {mobileMenuOpen && (
        <button
          type="button"
          className="government-mobile-overlay"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={mobileMenuOpen ? "sidebar mobile-open" : "sidebar"}>


        <button
          type="button"
          className="government-mobile-close"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
        >
          ×
        </button>

        {/* BRAND */}

        <div className="sidebar-brand">

          <div className="brand-icon">
            JS
          </div>

          <div>

            <h2>
              JeevanSetu
            </h2>

            <span>
              Government Portal
            </span>

          </div>

        </div>


        {/* MENU */}

        <div className="sidebar-menu">

          <p className="menu-title">
            MAIN MENU
          </p>


          <button
            className={
              activeSection === "dashboard"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              goToSection("dashboard")
            }
          >
            <span>📊</span>
            Dashboard
          </button>


          <button
            className={
              activeSection === "workers"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              goToSection("workers")
            }
          >
            <span>👷</span>
            Workers
          </button>


          <button
            className={
              activeSection === "jobs"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              goToSection("jobs")
            }
          >
            <span>📋</span>
            Service Requests
          </button>


          <button
            className={
              activeSection === "complaints"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              goToSection("complaints")
            }
          >
            <span>🛠️</span>
            Complaints & Support
          </button>


          <button
            className={
              activeSection === "feedback"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              goToSection("feedback")
            }
          >
            <span>⭐</span>
            Feedback
          </button>

        </div>


        {/* SIDEBAR STATS */}

        <div className="sidebar-mini-stats">

          <div className="sidebar-stat">

            <span>
              Workers
            </span>

            <strong>
              {workers.length}
            </strong>

          </div>


          <div className="sidebar-stat">

            <span>
              Requests
            </span>

            <strong>
              {jobs.length}
            </strong>

          </div>


          <div className="sidebar-stat">

            <span>
              Complaints
            </span>

            <strong>
              {complaintStats.total}
            </strong>

          </div>

        </div>


        {/* FOOTER */}

        <div className="sidebar-footer">

          <div className="profile-avatar">
            A
          </div>

          <div className="profile-info">

            <strong>
              Government Admin
            </strong>

            <small>
              Administrator
            </small>

          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
          >
            🚪
          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="app-content">


        {/* NAVBAR */}

        <header className="navbar">

          <div>

            <h2>
              Government Dashboard
            </h2>

            <span>
              Monitor services, workers and citizen support
            </span>

          </div>


          <button
            className="secondary-button"
            onClick={loadAllData}
          >
            🔄 Refresh
          </button>

        </header>


        <div className="main-content">


          {/* =================================================
              DASHBOARD
          ================================================== */}

          {activeSection === "dashboard" && (

            <section>

              <div className="page-header">

                <div>

                  <h1>
                    Government Dashboard
                  </h1>

                  <p>
                    Overview of JeevanSetu platform activity.
                  </p>

                </div>

              </div>


              {/* STATS */}

              <div className="stats-grid">


                <div className="stat-card">

                  <span>
                    👷
                  </span>

                  <div>

                    <small>
                      Total Workers
                    </small>

                    <strong>
                      {
                        dashboard?.total_workers ??
                        dashboard?.workers ??
                        0
                      }
                    </strong>

                  </div>

                </div>


                <div className="stat-card">

                  <span>
                    🛡️
                  </span>

                  <div>

                    <small>
                      Verified Workers
                    </small>

                    <strong>
                      {
                        dashboard?.verified_workers ??
                        0
                      }
                    </strong>

                  </div>

                </div>


                <div className="stat-card">

                  <span>
                    📋
                  </span>

                  <div>

                    <small>
                      Total Requests
                    </small>

                    <strong>
                      {
                        dashboard?.total_jobs ??
                        dashboard?.jobs ??
                        0
                      }
                    </strong>

                  </div>

                </div>


                <div className="stat-card">

                  <span>
                    🔄
                  </span>

                  <div>

                    <small>
                      Active Jobs
                    </small>

                    <strong>
                      {
                        dashboard?.active_jobs ??
                        0
                      }
                    </strong>

                  </div>

                </div>


                <div className="stat-card">

                  <span>
                    ✅
                  </span>

                  <div>

                    <small>
                      Completed Jobs
                    </small>

                    <strong>
                      {
                        dashboard?.completed_jobs ??
                        0
                      }
                    </strong>

                  </div>

                </div>


                <div className="stat-card">

                  <span>
                    🛠️
                  </span>

                  <div>

                    <small>
                      Complaints
                    </small>

                    <strong>
                      {
                        complaintStats.total
                      }
                    </strong>

                  </div>

                </div>

              </div>


              {/* CHARTS */}

              <div className="dashboard-grid">


                <div className="chart-card">

                  <div className="card-heading">

                    <div>

                      <h3>
                        Service Demand
                      </h3>

                      <p>
                        Requests by worker skill
                      </p>

                    </div>

                  </div>


                  <div className="chart-area">

                    <ResponsiveContainer>

                      <BarChart
                        data={skillData}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#27324a"
                        />

                        <XAxis
                          dataKey="skill"
                          stroke="#8993aa"
                        />

                        <YAxis
                          stroke="#8993aa"
                        />

                        <Tooltip />

                        <Bar
                          dataKey="count"
                          fill="#3b82f6"
                          radius={[5, 5, 0, 0]}
                        />

                      </BarChart>

                    </ResponsiveContainer>

                  </div>

                </div>


                <div className="chart-card">

                  <div className="card-heading">

                    <div>

                      <h3>
                        Jobs by Location
                      </h3>

                      <p>
                        Geographic service demand
                      </p>

                    </div>

                  </div>


                  <div className="chart-area">

                    <ResponsiveContainer>

                      <BarChart
                        data={locationData}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#27324a"
                        />

                        <XAxis
                          dataKey="location"
                          stroke="#8993aa"
                        />

                        <YAxis
                          stroke="#8993aa"
                        />

                        <Tooltip />

                        <Bar
                          dataKey="count"
                          fill="#8b5cf6"
                          radius={[5, 5, 0, 0]}
                        />

                      </BarChart>

                    </ResponsiveContainer>

                  </div>

                </div>

              </div>


              {/* TOP WORKERS */}

              <div className="table-card">

                <div className="table-heading">

                  <div>

                    <h3>
                      ⭐ Top Performing Workers
                    </h3>

                    <p>
                      Highest rated service workers
                    </p>

                  </div>

                </div>


                <div className="table-wrapper">

                  <table>

                    <thead>

                      <tr>

                        <th>
                          Worker
                        </th>

                        <th>
                          Skill
                        </th>

                        <th>
                          Rating
                        </th>

                        <th>
                          Experience
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {topWorkers.length === 0 ? (

                        <tr>

                          <td
                            colSpan="4"
                            className="empty-cell"
                          >
                            No worker data available.
                          </td>

                        </tr>

                      ) : (

                        topWorkers.map(
                          (worker, index) => (

                            <tr
                              key={
                                worker.id ||
                                index
                              }
                            >

                              <td>
                                <strong>
                                  {
                                    worker.name ||
                                    worker.worker_name ||
                                    "Unknown"
                                  }
                                </strong>
                              </td>

                              <td>
                                {
                                  worker.skill ||
                                  "N/A"
                                }
                              </td>

                              <td>
                                ⭐ {
                                  worker.rating ??
                                  0
                                }
                              </td>

                              <td>
                                {
                                  worker.experience ??
                                  0
                                } years
                              </td>

                            </tr>

                          )
                        )

                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </section>

          )}


          {/* =================================================
              WORKERS
          ================================================== */}

          {activeSection === "workers" && (

            <section>

              <div className="page-header">

                <div>

                  <h1>
                    👷 Worker Management
                  </h1>

                  <p>
                    Verify and manage registered workers.
                  </p>

                </div>

                <div className="section-count">
                  {workers.length} workers
                </div>

              </div>


              <div className="filter-card">

                <div className="filter-group">

                  <label>
                    Search
                  </label>

                  <input
                    type="text"
                    placeholder="Search worker..."
                    value={workerSearch}
                    onChange={(e) =>
                      setWorkerSearch(
                        e.target.value
                      )
                    }
                  />

                </div>


                <div className="filter-group">

                  <label>
                    Verification
                  </label>

                  <select
                    value={
                      workerVerification
                    }
                    onChange={(e) =>
                      setWorkerVerification(
                        e.target.value
                      )
                    }
                  >

                    <option value="all">
                      All Workers
                    </option>

                    <option value="true">
                      Verified
                    </option>

                    <option value="false">
                      Pending Verification
                    </option>

                  </select>

                </div>

              </div>


              <div className="table-card">

                <div className="table-wrapper">

                  <table>

                    <thead>

                      <tr>

                        <th>
                          Worker
                        </th>

                        <th>
                          Skill
                        </th>

                        <th>
                          Location
                        </th>

                        <th>
                          Experience
                        </th>

                        <th>
                          Rating
                        </th>

                        <th>
                          Verification
                        </th>

                        <th>
                          Availability
                        </th>

                        <th>
                          Action
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {workers.length === 0 ? (

                        <tr>

                          <td
                            colSpan="8"
                            className="empty-cell"
                          >
                            No workers found.
                          </td>

                        </tr>

                      ) : (

                        workers.map(
                          (worker) => (

                            <tr
                              key={
                                worker.id
                              }
                            >

                              <td>

                                <strong>
                                  {
                                    worker.name ||
                                    "Unknown"
                                  }
                                </strong>

                                <small>
                                  {
                                    worker.email ||
                                    ""
                                  }
                                </small>

                              </td>


                              <td>
                                {
                                  worker.skill ||
                                  "N/A"
                                }
                              </td>


                              <td>
                                {
                                  worker.location ||
                                  "N/A"
                                }
                              </td>


                              <td>
                                {
                                  worker.experience ??
                                  0
                                } years
                              </td>


                              <td>
                                ⭐ {
                                  worker.rating ??
                                  0
                                }
                              </td>


                              <td>

                                <span
                                  className={
                                    worker.verified
                                      ? "status-success"
                                      : "status-pending"
                                  }
                                >

                                  {
                                    worker.verified
                                      ? "Verified"
                                      : "Pending"
                                  }

                                </span>

                              </td>


                              <td>

                                <span
                                  className={
                                    worker.available
                                      ? "status-success"
                                      : "status-danger"
                                  }
                                >

                                  {
                                    worker.available
                                      ? "Available"
                                      : "Busy"
                                  }

                                </span>

                              </td>


                              <td>

                                <button
                                  className="primary-button small-button"
                                  onClick={() =>
                                    openWorker(
                                      worker
                                    )
                                  }
                                >
                                  Manage
                                </button>

                              </td>

                            </tr>

                          )
                        )

                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </section>

          )}


          {/* =================================================
              SERVICE REQUESTS
          ================================================== */}

          {activeSection === "jobs" && (

            <section>

              <div className="page-header">

                <div>

                  <h1>
                    📋 Service Requests
                  </h1>

                  <p>
                    Monitor citizen service requests.
                  </p>

                </div>

                <div className="section-count">
                  {jobs.length} requests
                </div>

              </div>


              <div className="filter-card">

                <div className="filter-group">

                  <label>
                    Search
                  </label>

                  <input
                    type="text"
                    placeholder="Search service, citizen or worker..."
                    value={jobSearch}
                    onChange={(e) =>
                      setJobSearch(
                        e.target.value
                      )
                    }
                  />

                </div>


                <div className="filter-group">

                  <label>
                    Status
                  </label>

                  <select
                    value={jobStatus}
                    onChange={(e) =>
                      setJobStatus(
                        e.target.value
                      )
                    }
                  >

                    <option value="all">
                      All Status
                    </option>

                    <option value="requested">
                      Requested
                    </option>

                    <option value="accepted">
                      Accepted
                    </option>

                    <option value="in_progress">
                      In Progress
                    </option>

                    <option value="completed">
                      Completed
                    </option>

                    <option value="rejected">
                      Rejected
                    </option>

                  </select>

                </div>

              </div>


              <div className="table-card">

                <div className="table-wrapper">

                  <table>

                    <thead>

                      <tr>

                        <th>
                          ID
                        </th>

                        <th>
                          Citizen
                        </th>

                        <th>
                          Service
                        </th>

                        <th>
                          Worker
                        </th>

                        <th>
                          Location
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Date
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {jobs.length === 0 ? (

                        <tr>

                          <td
                            colSpan="7"
                            className="empty-cell"
                          >
                            No service requests found.
                          </td>

                        </tr>

                      ) : (

                        jobs.map(
                          (job) => (

                            <tr
                              key={
                                job.id
                              }
                            >

                              <td>
                                <strong>
                                  #{job.id}
                                </strong>
                              </td>

                              <td>
                                {
                                  job.citizen ||
                                  job.citizen_name ||
                                  "N/A"
                                }
                              </td>

                              <td>
                                {
                                  job.service ||
                                  "N/A"
                                }
                              </td>

                              <td>
                                {
                                  job.worker ||
                                  job.worker_name ||
                                  "Not assigned"
                                }
                              </td>

                              <td>
                                {
                                  job.location ||
                                  "N/A"
                                }
                              </td>

                              <td>

                                <span
                                  className={
                                    getStatusClass(
                                      job.status
                                    )
                                  }
                                >

                                  {
                                    formatStatus(
                                      job.status
                                    )
                                  }

                                </span>

                              </td>

                              <td>
                                {
                                  formatDate(
                                    job.created_at
                                  )
                                }
                              </td>

                            </tr>

                          )
                        )

                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </section>

          )}


          {/* =================================================
              COMPLAINTS
          ================================================== */}

          {activeSection === "complaints" && (

            <section>

              <div className="page-header">

                <div>

                  <h1>
                    🛠️ Complaints & Support
                  </h1>

                  <p>
                    Review, investigate and resolve citizen complaints.
                  </p>

                </div>

                <div className="section-count">
                  {complaints.length} complaints
                </div>

              </div>


              {/* COMPLAINT STATS */}

              <div className="stats-grid complaint-stats">


                <div className="stat-card">

                  <span>
                    🛠️
                  </span>

                  <div>

                    <small>
                      Total Complaints
                    </small>

                    <strong>
                      {
                        complaintStats.total
                      }
                    </strong>

                  </div>

                </div>


                <div className="stat-card">

                  <span>
                    ⏳
                  </span>

                  <div>

                    <small>
                      Pending
                    </small>

                    <strong>
                      {
                        complaintStats.pending
                      }
                    </strong>

                  </div>

                </div>


                <div className="stat-card">

                  <span>
                    🔍
                  </span>

                  <div>

                    <small>
                      Investigating
                    </small>

                    <strong>
                      {
                        complaintStats.investigating
                      }
                    </strong>

                  </div>

                </div>


                <div className="stat-card">

                  <span>
                    ✅
                  </span>

                  <div>

                    <small>
                      Resolved
                    </small>

                    <strong>
                      {
                        complaintStats.resolved
                      }
                    </strong>

                  </div>

                </div>


                <div className="stat-card">

                  <span>
                    🚨
                  </span>

                  <div>

                    <small>
                      High Priority
                    </small>

                    <strong>
                      {
                        complaintStats.high_priority
                      }
                    </strong>

                  </div>

                </div>

              </div>


              {/* FILTERS */}

              <div className="filter-card">

                <div className="filter-group">

                  <label>
                    Search
                  </label>

                  <input
                    type="text"
                    placeholder="Search complaint or citizen..."
                    value={
                      complaintSearch
                    }
                    onChange={(e) =>
                      setComplaintSearch(
                        e.target.value
                      )
                    }
                  />

                </div>


                <div className="filter-group">

                  <label>
                    Status
                  </label>

                  <select
                    value={
                      complaintStatus
                    }
                    onChange={(e) =>
                      setComplaintStatus(
                        e.target.value
                      )
                    }
                  >

                    <option value="all">
                      All Status
                    </option>

                    <option value="pending">
                      Pending
                    </option>

                    <option value="investigating">
                      Investigating
                    </option>

                    <option value="resolved">
                      Resolved
                    </option>

                  </select>

                </div>


                <div className="filter-group">

                  <label>
                    Priority
                  </label>

                  <select
                    value={
                      complaintPriority
                    }
                    onChange={(e) =>
                      setComplaintPriority(
                        e.target.value
                      )
                    }
                  >

                    <option value="all">
                      All Priority
                    </option>

                    <option value="high">
                      High
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="low">
                      Low
                    </option>

                  </select>

                </div>

              </div>


              {/* COMPLAINT TABLE */}

              <div className="table-card">

                <div className="table-heading">

                  <div>

                    <h3>
                      Complaint Management
                    </h3>

                    <p>
                      Government support and resolution center
                    </p>

                  </div>

                </div>


                <div className="table-wrapper">

                  <table>

                    <thead>

                      <tr>

                        <th>
                          Complaint
                        </th>

                        <th>
                          Citizen
                        </th>

                        <th>
                          Priority
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Date
                        </th>

                        <th>
                          Action
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {complaints.length === 0 ? (

                        <tr>

                          <td
                            colSpan="6"
                            className="empty-cell"
                          >

                            <div className="empty-icon">
                              🛠️
                            </div>

                            No complaints found.

                          </td>

                        </tr>

                      ) : (

                        complaints.map(
                          (complaint) => (

                            <tr
                              key={
                                complaint.id
                              }
                            >

                              <td>

                                <strong>
                                  #{complaint.id}
                                </strong>

                                <small>
                                  {
                                    complaint.subject
                                  }
                                </small>

                              </td>


                              <td>
                                {
                                  complaint.citizen ||
                                  "Unknown"
                                }
                              </td>


                              <td>

                                <span
                                  className={
                                    getPriorityClass(
                                      complaint.priority
                                    )
                                  }
                                >

                                  {
                                    complaint.priority
                                  }

                                </span>

                              </td>


                              <td>

                                <span
                                  className={
                                    getStatusClass(
                                      complaint.status
                                    )
                                  }
                                >

                                  {
                                    formatStatus(
                                      complaint.status
                                    )
                                  }

                                </span>

                              </td>


                              <td>
                                {
                                  formatDate(
                                    complaint.created_at
                                  )
                                }
                              </td>


                              <td>

                                <button
                                  className="primary-button small-button"
                                  onClick={() =>
                                    openComplaint(
                                      complaint
                                    )
                                  }
                                >
                                  Manage
                                </button>

                              </td>

                            </tr>

                          )
                        )

                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </section>

          )}


          {/* =================================================
              FEEDBACK
          ================================================== */}

          {activeSection === "feedback" && (

            <section>

              <div className="page-header">

                <div>

                  <h1>
                    ⭐ Citizen Feedback
                  </h1>

                  <p>
                    Monitor ratings and service feedback.
                  </p>

                </div>

              </div>


              <div className="dashboard-grid">


                {/* RATING CHART */}

                <div className="chart-card">

                  <div className="card-heading">

                    <div>

                      <h3>
                        Rating Distribution
                      </h3>

                      <p>
                        Citizen ratings across workers
                      </p>

                    </div>

                  </div>


                  <div className="chart-area">

                    <ResponsiveContainer>

                      <PieChart>

                        <Pie
                          data={
                            reviewData.rating_distribution ||
                            []
                          }
                          dataKey="count"
                          nameKey="rating"
                          cx="50%"
                          cy="50%"
                          outerRadius={105}
                          label
                        />

                        <Tooltip />

                        <Legend />

                      </PieChart>

                    </ResponsiveContainer>

                  </div>

                </div>


                {/* RECENT FEEDBACK */}

                <div className="table-card">

                  <div className="table-heading">

                    <div>

                      <h3>
                        Recent Feedback
                      </h3>

                      <p>
                        Latest citizen reviews
                      </p>

                    </div>

                  </div>


                  <div className="table-wrapper">

                    <table>

                      <thead>

                        <tr>

                          <th>
                            Citizen
                          </th>

                          <th>
                            Worker
                          </th>

                          <th>
                            Rating
                          </th>

                          <th>
                            Feedback
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {
                          (
                            reviewData.recent_reviews ||
                            []
                          ).length === 0 ? (

                            <tr>

                              <td
                                colSpan="4"
                                className="empty-cell"
                              >
                                No feedback available.
                              </td>

                            </tr>

                          ) : (

                            (
                              reviewData.recent_reviews ||
                              []
                            ).map(
                              (
                                review,
                                index
                              ) => (

                                <tr
                                  key={
                                    review.id ||
                                    index
                                  }
                                >

                                  <td>
                                    {
                                      review.citizen ||
                                      review.citizen_name ||
                                      "N/A"
                                    }
                                  </td>

                                  <td>
                                    {
                                      review.worker ||
                                      review.worker_name ||
                                      "N/A"
                                    }
                                  </td>

                                  <td>
                                    ⭐ {
                                      review.rating ??
                                      0
                                    }
                                  </td>

                                  <td>
                                    {
                                      review.feedback ||
                                      "No feedback"
                                    }
                                  </td>

                                </tr>

                              )
                            )

                          )
                        }

                      </tbody>

                    </table>

                  </div>

                </div>

              </div>

            </section>

          )}

        </div>

      </main>


      {/* =====================================================
          WORKER MODAL
      ====================================================== */}

      {selectedWorker && (

        <div
          className="modal-overlay"
          onClick={closeWorker}
        >

          <div
            className="modal-card"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <h2>
                  👷 Worker Details
                </h2>

                <p>
                  Review worker verification information.
                </p>

              </div>

              <button
                className="modal-close"
                onClick={closeWorker}
              >
                ✕
              </button>

            </div>


            <div className="modal-body">

              <div className="detail-grid">


                <div className="detail-item">

                  <small>
                    Name
                  </small>

                  <strong>
                    {
                      selectedWorker.name ||
                      "N/A"
                    }
                  </strong>

                </div>


                <div className="detail-item">

                  <small>
                    Email
                  </small>

                  <strong>
                    {
                      selectedWorker.email ||
                      "N/A"
                    }
                  </strong>

                </div>


                <div className="detail-item">

                  <small>
                    Skill
                  </small>

                  <strong>
                    {
                      selectedWorker.skill ||
                      "N/A"
                    }
                  </strong>

                </div>


                <div className="detail-item">

                  <small>
                    Location
                  </small>

                  <strong>
                    {
                      selectedWorker.location ||
                      "N/A"
                    }
                  </strong>

                </div>


                <div className="detail-item">

                  <small>
                    Experience
                  </small>

                  <strong>
                    {
                      selectedWorker.experience ??
                      0
                    } years
                  </strong>

                </div>


                <div className="detail-item">

                  <small>
                    Rating
                  </small>

                  <strong>
                    ⭐ {
                      selectedWorker.rating ??
                      0
                    }
                  </strong>

                </div>


                <div className="detail-item">

                  <small>
                    Availability
                  </small>

                  <strong>
                    {
                      selectedWorker.available
                        ? "Available"
                        : "Busy"
                    }
                  </strong>

                </div>


                <div className="detail-item">

                  <small>
                    Verification
                  </small>

                  <strong>
                    {
                      selectedWorker.verified
                        ? "✅ Verified"
                        : "⏳ Pending"
                    }
                  </strong>

                </div>

              </div>


              <div className="certification-box">

                <small>
                  Certifications
                </small>

                <p>
                  {
                    selectedWorker.certifications ||
                    "No certifications added."
                  }
                </p>

              </div>


              <div className="modal-actions">

                {selectedWorker.verified ? (

                  <button
                    className="secondary-button"
                    onClick={() =>
                      unverifyWorker(
                        selectedWorker.id
                      )
                    }
                  >
                    Remove Verification
                  </button>

                ) : (

                  <button
                    className="primary-button"
                    onClick={() =>
                      verifyWorker(
                        selectedWorker.id
                      )
                    }
                  >
                    ✅ Verify Worker
                  </button>

                )}


                <button
                  className="secondary-button"
                  onClick={closeWorker}
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          COMPLAINT MODAL
      ====================================================== */}

      {selectedComplaint && (

        <div
          className="modal-overlay"
          onClick={closeComplaint}
        >

          <div
            className="modal-card complaint-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            <div className="modal-header">

              <div>

                <h2>
                  🛠️ Complaint Details
                </h2>

                <p>
                  Manage citizen complaint and government response.
                </p>

              </div>


              <button
                className="modal-close"
                onClick={closeComplaint}
              >
                ✕
              </button>

            </div>


            <div className="modal-body">


              <div className="complaint-id-box">

                <span>
                  Complaint ID
                </span>

                <strong>
                  #{selectedComplaint.id}
                </strong>

              </div>


              <div className="complaint-subject">

                <small>
                  Subject
                </small>

                <h3>
                  {
                    selectedComplaint.subject
                  }
                </h3>

              </div>


              <div className="description-box">

                <small>
                  Complaint Description
                </small>

                <p>
                  {
                    selectedComplaint.description
                  }
                </p>

              </div>


              <div className="detail-grid">


                <div className="detail-item">

                  <small>
                    Citizen
                  </small>

                  <strong>
                    {
                      selectedComplaint.citizen ||
                      "Unknown"
                    }
                  </strong>

                </div>


                <div className="detail-item">

                  <small>
                    Related Job
                  </small>

                  <strong>
                    {
                      selectedComplaint.job_id
                        ? `#${selectedComplaint.job_id}`
                        : "Not linked"
                    }
                  </strong>

                </div>


                <div className="detail-item">

                  <small>
                    Priority
                  </small>

                  <strong
                    className={
                      getPriorityClass(
                        selectedComplaint.priority
                      )
                    }
                  >
                    {
                      selectedComplaint.priority
                    }
                  </strong>

                </div>


                <div className="detail-item">

                  <small>
                    Current Status
                  </small>

                  <strong
                    className={
                      getStatusClass(
                        selectedComplaint.status
                      )
                    }
                  >
                    {
                      formatStatus(
                        selectedComplaint.status
                      )
                    }
                  </strong>

                </div>

              </div>


              <div className="response-box">

                <label>
                  Government Response / Resolution Note
                </label>

                <textarea
                  rows="5"
                  placeholder="Enter government response..."
                  value={complaintNote}
                  onChange={(e) =>
                    setComplaintNote(
                      e.target.value
                    )
                  }
                  disabled={
                    complaintActionLoading
                  }
                />

              </div>


              <div className="modal-actions">


                <button
                  className="status-action pending-action"
                  disabled={
                    complaintActionLoading
                  }
                  onClick={() =>
                    updateComplaintStatus(
                      "pending"
                    )
                  }
                >
                  ⏳ Pending
                </button>


                <button
                  className="status-action investigate-action"
                  disabled={
                    complaintActionLoading
                  }
                  onClick={() =>
                    updateComplaintStatus(
                      "investigating"
                    )
                  }
                >
                  🔍 Investigate
                </button>


                <button
                  className="status-action resolve-action"
                  disabled={
                    complaintActionLoading
                  }
                  onClick={() =>
                    updateComplaintStatus(
                      "resolved"
                    )
                  }
                >
                  {
                    complaintActionLoading
                      ? "Updating..."
                      : "✅ Resolve"
                  }
                </button>


                <button
                  className="secondary-button"
                  disabled={
                    complaintActionLoading
                  }
                  onClick={closeComplaint}
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


export default GovernmentDashboard;