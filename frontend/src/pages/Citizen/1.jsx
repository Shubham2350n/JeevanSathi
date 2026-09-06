import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import API, {
  getWorkers
} from "../../services/api";

import JeevanSathi from "./JeevanSathi";

import "./CitizenDashboard.css";
import LocationTracker from "../../components/LocationTracker";

function CitizenDashboard() {

  // =====================================================
  // DATA STATES
  // =====================================================

  const [workers, setWorkers] = useState([]);

  const [jobs, setJobs] = useState([]);

  const [complaints, setComplaints] = useState([]);


  // =====================================================
  // LOADING STATES
  // =====================================================

  const [loading, setLoading] = useState(true);

  const [jobsLoading, setJobsLoading] = useState(true);

  const [complaintsLoading, setComplaintsLoading] =
    useState(true);const [darkMode, setDarkMode] = useState(
  localStorage.getItem("theme") !== "light"
);

useEffect(() => {
  document.documentElement.setAttribute(
    "data-theme",
    darkMode ? "dark" : "light"
  );

  localStorage.setItem(
    "theme",
    darkMode ? "dark" : "light"
  );
}, [darkMode]);

const toggleTheme = () => {
  setDarkMode((prev) => !prev);
};



  // =====================================================
  // JEEVAN SATHI PROBLEM
  // =====================================================

  const [problem, setProblem] = useState("");


  // =====================================================
  // REVIEW STATES
  // =====================================================

  const [reviewJob, setReviewJob] = useState(null);

  const [rating, setRating] = useState(0);

  const [feedback, setFeedback] = useState("");

  const [reviewLoading, setReviewLoading] = useState(false);


  // =====================================================
  // COMPLAINT STATES
  // =====================================================

  const [showComplaintForm, setShowComplaintForm] =
    useState(false);

  const [complaintSubject, setComplaintSubject] =
    useState("");

  const [complaintDescription, setComplaintDescription] =
    useState("");

  const [complaintPriority, setComplaintPriority] =
    useState("medium");

  const [complaintJobId, setComplaintJobId] =
    useState("");

  const [complaintSubmitting, setComplaintSubmitting] =
    useState(false);


  // =====================================================
  // ACTIVE SECTION
  // =====================================================

  const [activeSection, setActiveSection] =
    useState("dashboard");


  // =====================================================
  // MOBILE SIDEBAR
  // =====================================================

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);


  // =====================================================
  // USER
  // =====================================================

  const user = JSON.parse(
    localStorage.getItem("user")
  );


  // =====================================================
  // LOAD WORKERS
  // =====================================================

  const loadWorkers = async () => {

    try {

      setLoading(true);

      const data = await getWorkers();

      setWorkers(
        data.workers || []
      );

    } catch (error) {

      console.error(
        "Worker loading error:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // LOAD JOBS
  // =====================================================

  const loadJobs = async () => {

    try {

      setJobsLoading(true);

      const response = await API.get(
        "/citizen/jobs"
      );

      setJobs(
        response.data.jobs || []
      );

    } catch (error) {

      console.error(
        "Job loading error:",
        error
      );

    } finally {

      setJobsLoading(false);

    }

  };


  // =====================================================
  // LOAD COMPLAINTS
  // =====================================================

  const loadComplaints = async () => {

    try {

      setComplaintsLoading(true);

      const response = await API.get(
        "/citizen/complaints"
      );

      setComplaints(
        response.data.complaints || []
      );

    } catch (error) {

      console.error(
        "Complaint loading error:",
        error
      );

    } finally {

      setComplaintsLoading(false);

    }

  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadWorkers();

    loadJobs();

    loadComplaints();

  }, []);


  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    window.location.href =
      "/login";

  };


  // =====================================================
  // SIDEBAR NAVIGATION
  // =====================================================

  const goToSection = (section) => {

    setActiveSection(section);

    setMobileMenuOpen(false);

    window.scrollTo({

      top: 0,

      behavior: "smooth"

    });

  };


  // =====================================================
  // OPEN JEEVAN SATHI
  // =====================================================

  const openJeevanSathi = (newProblem = "") => {

    if (newProblem) {

      setProblem(newProblem);

    }

    setActiveSection(
      "jeevan-sathi"
    );

    setMobileMenuOpen(false);

    window.scrollTo({

      top: 0,

      behavior: "smooth"

    });

  };


  // =====================================================
  // FIND HELP
  // =====================================================

  const handleProblem = () => {

    if (!problem.trim()) {

      alert(
        "Please describe your problem first."
      );

      return;

    }

    openJeevanSathi(problem);

  };


  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {

    if (status === "completed") {

      return "job-status completed";

    }

    if (status === "accepted") {

      return "job-status accepted";

    }

    if (status === "rejected") {

      return "job-status rejected";

    }

    if (status === "in_progress") {

      return "job-status progress";

    }

    return "job-status requested";

  };


  // =====================================================
  // COMPLAINT STATUS CLASS
  // =====================================================

  const getComplaintStatusClass = (status) => {

    if (status === "resolved") {

      return "job-status completed";

    }

    if (status === "investigating") {

      return "job-status progress";

    }

    return "job-status requested";

  };


  // =====================================================
  // COMPLAINT PRIORITY CLASS
  // =====================================================

  const getComplaintPriorityClass = (priority) => {

    if (priority === "high") {

      return "job-status rejected";

    }

    if (priority === "medium") {

      return "job-status progress";

    }

    return "job-status requested";

  };


  // =====================================================
  // OPEN COMPLAINT FORM
  // =====================================================

  const openComplaintForm = () => {

    setComplaintSubject("");

    setComplaintDescription("");

    setComplaintPriority("medium");

    setComplaintJobId("");

    setShowComplaintForm(true);

  };


  // =====================================================
  // CLOSE COMPLAINT FORM
  // =====================================================

  const closeComplaintForm = () => {

    if (complaintSubmitting) {

      return;

    }

    setShowComplaintForm(false);

    setComplaintSubject("");

    setComplaintDescription("");

    setComplaintPriority("medium");

    setComplaintJobId("");

  };


  // =====================================================
  // SUBMIT COMPLAINT
  // =====================================================

  const submitComplaint = async () => {

    if (!complaintSubject.trim()) {

      alert(
        "Please enter complaint subject."
      );

      return;

    }


    if (!complaintDescription.trim()) {

      alert(
        "Please describe your complaint."
      );

      return;

    }


    setComplaintSubmitting(true);


    try {

      const payload = {

        subject:
          complaintSubject.trim(),

        description:
          complaintDescription.trim(),

        priority:
          complaintPriority

      };


      if (complaintJobId) {

        payload.job_id =
          Number(complaintJobId);

      }


      const response = await API.post(

        "/citizen/complaints",

        payload

      );


      alert(

        response.data.message ||

        "Complaint submitted successfully"

      );


      closeComplaintForm();

      await loadComplaints();


    } catch (error) {

      console.error(

        "Complaint submission error:",

        error

      );


      alert(

        error.response?.data?.message ||

        "Unable to submit complaint"

      );


    } finally {

      setComplaintSubmitting(false);

    }

  };


  // =====================================================
  // OPEN REVIEW
  // =====================================================

  const openReview = (job) => {

    setReviewJob(job);

    setRating(0);

    setFeedback("");

  };


  // =====================================================
  // CLOSE REVIEW
  // =====================================================

  const closeReview = () => {

    setReviewJob(null);

    setRating(0);

    setFeedback("");

  };


  // =====================================================
  // SUBMIT REVIEW
  // =====================================================

  const submitReview = async () => {

    if (!reviewJob) {

      return;

    }


    if (rating === 0) {

      alert(
        "Please select a rating."
      );

      return;

    }


    setReviewLoading(true);


    try {

      const response = await API.post(

        "/citizen/reviews",

        {

          job_id:
            reviewJob.id,

          rating:
            rating,

          feedback:
            feedback.trim()

        }

      );


      alert(

        response.data.message ||

        "Thank you for your feedback!"

      );


      closeReview();

      await loadJobs();

      await loadWorkers();


    } catch (error) {

      console.error(

        "Review error:",

        error

      );


      alert(

        error.response?.data?.message ||

        "Unable to submit feedback"

      );


    } finally {

      setReviewLoading(false);

    }

  };


  // =====================================================
  // VERIFIED + AVAILABLE WORKERS
  // =====================================================

  const availableWorkers =

    workers.filter(

      (worker) =>

        worker.verified &&

        worker.available

    );


  // =====================================================
  // COMPLETED JOBS
  // =====================================================

  const completedJobs =

    jobs.filter(

      (job) =>

        job.status === "completed"

    );


  // =====================================================
  // MAIN UI
  // =====================================================

  return (

    <div className="citizen-dashboard">

      {/* MOBILE MENU BUTTON */}

      <button

        className="citizen-mobile-menu-button"

        onClick={() =>
          setMobileMenuOpen(
            !mobileMenuOpen
          )
        }

        aria-label="Toggle menu"

        aria-expanded={
          mobileMenuOpen
        }

      >

        <span></span>

        <span></span>

        <span></span>

      </button>


      {/* SIDEBAR */}

      <aside

        className={

          mobileMenuOpen

            ? "citizen-sidebar mobile-open"

            : "citizen-sidebar"

        }

      >

        <div className="citizen-brand">

          <div className="citizen-brand-icon">

            JS

          </div>


          <div>

            <h2>

              Jeevan<span>Setu</span>

            </h2>

            <small>

              Citizen Portal

            </small>

          </div>

        </div>


        <div className="citizen-menu">

          <p className="citizen-menu-title">

            MAIN MENU

          </p>


          <button

            className={

              activeSection === "dashboard"

                ? "citizen-menu-item active"

                : "citizen-menu-item"

            }

            onClick={() =>
              goToSection("dashboard")
            }

          >

            <span>🏠</span>

            Dashboard

          </button>


          <button

            className={

              activeSection === "jeevan-sathi"

                ? "citizen-menu-item active"

                : "citizen-menu-item"

            }

            onClick={() =>
              goToSection("jeevan-sathi")
            }

          >

            <span>🤖</span>

            Jeevan Sathi

          </button>


          <button

            className={

              activeSection === "service-requests"

                ? "citizen-menu-item active"

                : "citizen-menu-item"

            }

            onClick={() =>
              goToSection("service-requests")
            }

          >

            <span>📋</span>

            My Service Requests

          </button>


          <button

            className={

              activeSection === "complaints-support"

                ? "citizen-menu-item active"

                : "citizen-menu-item"

            }

            onClick={() =>
              goToSection(
                "complaints-support"
              )
            }

          >

            <span>🛠️</span>

            Complaints & Support

          </button>


          <button

            className={

              activeSection === "feedback"

                ? "citizen-menu-item active"

                : "citizen-menu-item"

            }

            onClick={() =>
              goToSection("feedback")
            }

          >

            <span>⭐</span>

            Feedback

          </button>


          <button

            className={

              activeSection === "workers"

                ? "citizen-menu-item active"

                : "citizen-menu-item"

            }

            onClick={() =>
              goToSection("workers")
            }

          >

            <span>👷</span>

            Verified Workers

          </button>

        </div>


        <div className="citizen-help-card">

          <div className="help-card-icon">
            🆘
          </div>

          <strong>
            Need assistance?
          </strong>

          <p>
            Tell Jeevan Sathi your problem.
          </p>

          <button
            onClick={() =>
              goToSection("jeevan-sathi")
            }
          >
            Get Help →
          </button>

        </div>


        <div className="citizen-sidebar-user">

          <div className="citizen-user-avatar">

            {user?.name
              ?.charAt(0)
              ?.toUpperCase() || "C"}

          </div>


          <div className="citizen-user-info">

            <strong>
              {user?.name || "Citizen"}
            </strong>

            <small>
              Citizen Account
            </small>

          </div>


          <button
            className="sidebar-logout"
            onClick={logout}
            title="Logout"
          >
            ↪
          </button>

        </div>

      </aside>


      {/* MOBILE OVERLAY */}

      {mobileMenuOpen && (

        <div
          className="citizen-mobile-overlay"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        />

      )}


      {/* MAIN */}

      <main className="citizen-main">

        <header className="citizen-topbar">

          <div>

            <span className="topbar-label">
              CITIZEN PORTAL
            </span>

            <h3>
              Good day, {user?.name || "Citizen"} 👋
            </h3>

            <p>
              Manage your services and get trusted
              help from JeevanSetu.
            </p>

          </div>


          <div className="topbar-actions">

            <button
              className="top-refresh"
              onClick={() => {
                loadWorkers();
                loadJobs();
                loadComplaints();
              }}
            >
              ↻ Refresh
            </button>


            <button
              className="top-logout"
              onClick={logout}
            >
              Logout
            </button>

          </div>

        </header>


        {/* DASHBOARD */}

        {activeSection === "dashboard" && (

          <>

            <section
              id="dashboard"
              className="citizen-overview"
            >

              <div className="overview-card">

                <div className="overview-icon blue">
                  📋
                </div>

                <div>

                  <small>
                    Service Requests
                  </small>

                  <strong>
                    {jobs.length}
                  </strong>

                  <span>
                    Total requests
                  </span>

                </div>

              </div>


              <div className="overview-card">

                <div className="overview-icon orange">
                  🛠️
                </div>

                <div>

                  <small>
                    Complaints
                  </small>

                  <strong>
                    {complaints.length}
                  </strong>

                  <span>
                    Submitted by you
                  </span>

                </div>

              </div>


              <div className="overview-card">

                <div className="overview-icon green">
                  👷
                </div>

                <div>

                  <small>
                    Verified Workers
                  </small>

                  <strong>
                    {availableWorkers.length}
                  </strong>

                  <span>
                    Currently available
                  </span>

                </div>

              </div>


              <div className="overview-card">

                <div className="overview-icon purple">
                  ⭐
                </div>

                <div>

                  <small>
                    Completed
                  </small>

                  <strong>
                    {completedJobs.length}
                  </strong>

                  <span>
                    Services completed
                  </span>

                </div>

              </div>

            </section>


            <section className="citizen-ai-section">

              <div className="citizen-ai-icon">
                🤖
              </div>


              <div className="citizen-ai-content">

                <div className="ai-badge">
                  AI POWERED
                </div>

                <h2>
                  Meet Jeevan Sathi
                </h2>

                <p>
                  Describe your problem in simple words.
                  Jeevan Sathi will help you find the right
                  service and a verified worker.
                </p>


                <div className="citizen-problem-box">

                  <input
                    type="text"
                    placeholder="Example: My AC is running but cooling is not working..."
                    value={problem}
                    onChange={(e) =>
                      setProblem(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleProblem();
                      }
                    }}
                  />


                  <button
                    onClick={handleProblem}
                  >
                    Find Help →
                  </button>

                </div>

              </div>


              <div className="ai-decoration">
                ✨
              </div>

            </section>


            <section className="citizen-section">

              <div className="citizen-section-heading">

                <div>

                  <span>
                    QUICK ACCESS
                  </span>

                  <h2>
                    Popular Services
                  </h2>

                </div>

              </div>


              <div className="citizen-service-grid">

                <div
                  className="citizen-service-card"
                  onClick={() =>
                    openJeevanSathi(
                      "My AC is not cooling properly"
                    )
                  }
                >

                  <div className="service-icon">
                    ❄️
                  </div>

                  <div>

                    <strong>
                      AC Repair
                    </strong>

                    <small>
                      AC Technician
                    </small>

                  </div>

                  <span>
                    →
                  </span>

                </div>


                <div
                  className="citizen-service-card"
                  onClick={() =>
                    openJeevanSathi(
                      "I need an electrician"
                    )
                  }
                >

                  <div className="service-icon">
                    ⚡
                  </div>

                  <div>

                    <strong>
                      Electrician
                    </strong>

                    <small>
                      Electrical Services
                    </small>

                  </div>

                  <span>
                    →
                  </span>

                </div>


                <div
                  className="citizen-service-card"
                  onClick={() =>
                    openJeevanSathi(
                      "I need a plumber"
                    )
                  }
                >

                  <div className="service-icon">
                    🚰
                  </div>

                  <div>

                    <strong>
                      Plumber
                    </strong>

                    <small>
                      Plumbing Services
                    </small>

                  </div>

                  <span>
                    →
                  </span>

                </div>


                <div
                  className="citizen-service-card"
                  onClick={() =>
                    openJeevanSathi(
                      "I need a carpenter"
                    )
                  }
                >

                  <div className="service-icon">
                    🔨
                  </div>

                  <div>

                    <strong>
                      Carpenter
                    </strong>

                    <small>
                      Carpentry Services
                    </small>

                  </div>

                  <span>
                    →
                  </span>

                </div>

              </div>

            </section>

          </>

        )}


        {/* JEEVAN SATHI */}

        {activeSection === "jeevan-sathi" && (

          <section
            id="jeevan-sathi"
            className="citizen-section jeevan-sathi-wrapper"
          >

            <div className="citizen-section-heading">

              <div>

                <span>
                  AI SERVICE ASSISTANT
                </span>

                <h2>
                  🤖 Jeevan Sathi
                </h2>

                <p>
                  Find the right service and verified worker
                  for your problem.
                </p>

              </div>

            </div>


            <JeevanSathi />

          </section>

        )}


        {/* SERVICE REQUESTS */}

        {activeSection === "service-requests" && (

          <section
            className="citizen-section"
            id="service-requests"
          >

            <div className="citizen-section-heading">

              <div>

                <span>
                  SERVICE TRACKING
                </span>

                <h2>
                  My Service Requests
                </h2>

                <p>
                  Track all your requested services.
                </p>

              </div>


              <div className="section-count-badge">
                {jobs.length} Requests
              </div>

            </div>


            {jobsLoading ? (

              <div className="citizen-loading">

                <div className="loading-spinner"></div>

                Loading your requests...

              </div>

            ) : jobs.length === 0 ? (

              <div className="citizen-empty">

                <div className="empty-big-icon">
                  📋
                </div>

                <h3>
                  No service requests yet
                </h3>

                <p>
                  Use Jeevan Sathi to find a verified
                  service worker.
                </p>

                <button
                  className="citizen-primary-btn"
                  onClick={() =>
                    goToSection("jeevan-sathi")
                  }
                >
                  Find a Service →
                </button>

              </div>

            ) : (

              <div className="citizen-job-grid">

                {jobs.map((job) => (

                  <div
                    className="citizen-job-card-new"
                    key={job.id}
                  >

                    <div className="job-card-header">

                      <div>

                        <span className="job-number">
                          JOB #{job.id}
                        </span>

                        <h3>
                          {job.service}
                        </h3>

                      </div>


                      <span
                        className={
                          getStatusClass(
                            job.status
                          )
                        }
                      >

                        {job.status
                          .replace("_", " ")
                          .toUpperCase()}

                      </span>

                    </div>


                    <div className="job-description">

                      <span>
                        📝
                      </span>

                      <p>
                        {job.description}
                      </p>

                    </div>


                    <div className="job-details">

                      <div>

                        <small>
                          LOCATION
                        </small>

                        <strong>
                          📍 {job.location}
                        </strong>

                      </div>


                      <div>

                        <small>
                          WORKER
                        </small>

                        <strong>
                          👷 {job.worker_name || "Not assigned"}
                        </strong>

                      </div>

                    </div>


                    {job.worker_skill && (

                      <div className="job-skill-row">
                        🔧 {job.worker_skill}
                      </div>

                    )}


                    <div className="job-card-footer">

                      <small>
                        Requested:{" "}
                        {job.created_at}
                      </small>


                      {job.status === "completed" &&
                        !job.has_review && (

                          <button
                            className="rate-worker-btn"
                            onClick={() =>
                              openReview(job)
                            }
                          >
                            ⭐ Rate Worker
                          </button>

                        )}


                      {job.status === "completed" &&
                        job.has_review && (

                          <div className="review-completed">

                            ⭐ Rated{" "}

                            <strong>
                              {job.review_rating}/5
                            </strong>

                          </div>

                        )}

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

        )}


        {/* COMPLAINTS */}

        {activeSection === "complaints-support" && (

          <section
            className="citizen-section"
            id="complaints-support"
          >

            <div className="citizen-section-heading">

              <div>

                <span>
                  CITIZEN SUPPORT
                </span>

                <h2>
                  🛠️ Complaints & Support
                </h2>

                <p>
                  Raise an issue and track government
                  action.
                </p>

              </div>


              <div className="section-count-badge">
                {complaints.length} Complaints
              </div>

            </div>


            <div className="support-banner">

              <div className="support-icon">
                🆘
              </div>


              <div className="support-content">

                <h3>
                  Need help with a service?
                </h3>

                <p>
                  Report issues related to workers,
                  service quality, payments, or requests.
                </p>

              </div>


              <button
                className="citizen-primary-btn"
                onClick={openComplaintForm}
              >
                + Raise Complaint
              </button>

            </div>


            <div className="complaint-list-heading">

              <div>

                <h3>
                  📋 My Complaints
                </h3>

                <p>
                  Government responses will appear here.
                </p>

              </div>


              <button
                className="citizen-refresh-btn"
                onClick={loadComplaints}
                disabled={complaintsLoading}
              >

                {complaintsLoading
                  ? "Refreshing..."
                  : "↻ Refresh"}

              </button>

            </div>


            {complaintsLoading ? (

              <div className="citizen-loading">

                <div className="loading-spinner"></div>

                Loading your complaints...

              </div>

            ) : complaints.length === 0 ? (

              <div className="citizen-empty">

                <div className="empty-big-icon">
                  🛠️
                </div>

                <h3>
                  No complaints yet
                </h3>

                <p>
                  You can raise a complaint whenever
                  you need government support.
                </p>

                <button
                  className="citizen-primary-btn"
                  onClick={openComplaintForm}
                >
                  + Raise Your First Complaint
                </button>

              </div>

            ) : (

              <div className="citizen-job-grid">

                {complaints.map((complaint) => (

                  <div
                    className="citizen-job-card-new complaint-card"
                    key={complaint.id}
                  >

                    <div className="job-card-header">

                      <div>

                        <span className="job-number">
                          COMPLAINT #{complaint.id}
                        </span>

                        <h3>
                          {complaint.subject}
                        </h3>

                      </div>


                      <span
                        className={
                          getComplaintStatusClass(
                            complaint.status
                          )
                        }
                      >

                        {complaint.status
                          .replace("_", " ")
                          .toUpperCase()}

                      </span>

                    </div>


                    <div className="job-description">

                      <span>
                        📝
                      </span>

                      <p>
                        {complaint.description}
                      </p>

                    </div>


                    <div className="job-details">

                      <div>

                        <small>
                          PRIORITY
                        </small>

                        <strong>

                          <span
                            className={
                              getComplaintPriorityClass(
                                complaint.priority
                              )
                            }
                          >
                            {complaint.priority.toUpperCase()}
                          </span>

                        </strong>

                      </div>


                      {complaint.job_id && (

                        <div>

                          <small>
                            RELATED JOB
                          </small>

                          <strong>
                            📋 Job #{complaint.job_id}
                          </strong>

                        </div>

                      )}

                    </div>


                    {complaint.created_at && (

                      <div className="complaint-date">

                        Raised on{" "}

                        {new Date(
                          complaint.created_at
                        ).toLocaleString()}

                      </div>

                    )}


                    {complaint.resolution_note ? (

                      <div className="government-response">

                        <div className="response-icon">
                          🏛️
                        </div>

                        <div>

                          <strong>
                            Government Response
                          </strong>

                          <p>
                            {complaint.resolution_note}
                          </p>

                        </div>

                      </div>

                    ) : complaint.status === "pending" ? (

                      <div className="complaint-status-message">

                        ⏳ Your complaint is waiting for
                        government review.

                      </div>

                    ) : complaint.status === "investigating" ? (

                      <div className="complaint-status-message">

                        🔎 Government is currently
                        investigating your complaint.

                      </div>

                    ) : null}

                  </div>

                ))}

              </div>

            )}

          </section>

        )}


        {/* VERIFIED WORKERS */}

        {activeSection === "workers" && (

          <section
            className="citizen-section"
            id="workers"
          >

            <div className="citizen-section-heading">

              <div>

                <span>
                  TRUSTED PROFESSIONALS
                </span>

                <h2>
                  👷 Verified Workers
                </h2>

                <p>
                  Trusted professionals available on
                  JeevanSetu.
                </p>

              </div>


              <div className="section-count-badge">
                {availableWorkers.length} Available
              </div>

            </div>


            {loading ? (

              <div className="citizen-loading">

                <div className="loading-spinner"></div>

                Loading workers...

              </div>

            ) : availableWorkers.length === 0 ? (

              <div className="citizen-empty">

                <div className="empty-big-icon">
                  👷
                </div>

                <h3>
                  No workers available
                </h3>

                <p>
                  Please try again later.
                </p>

              </div>

            ) : (

              <div className="citizen-worker-grid">

                {availableWorkers.map((worker) => (

                  <div
                    className="citizen-worker-card"
                    key={worker.id}
                  >

                    <div className="worker-card-top">

                      <div className="citizen-worker-avatar">
                        👷
                      </div>


                      <span className="verified-badge-new">
                        ✓ Verified
                      </span>

                    </div>


                    <h3>
                      {worker.name}
                    </h3>


                    <p className="worker-main-skill">
                      {worker.skill}
                    </p>


                    <div className="worker-rating-row">

                      <span>
                        ⭐ {worker.rating}
                      </span>

                      <span>
                        {worker.experience} years
                      </span>

                    </div>


                    <div className="worker-location-new">
                      📍 {worker.location}
                    </div>


                    {worker.certifications && (

                      <div className="worker-certification-new">

                        🎓{" "}
                        {worker.certifications}

                      </div>

                    )}


                    <button
                      className="find-service-btn"
                      onClick={() =>
                        openJeevanSathi(
                          `I need a ${worker.skill}`
                        )
                      }
                    >
                      Find Service →
                    </button>

                  </div>

                ))}

              </div>

            )}

          </section>

        )}


        {/* FEEDBACK */}

        {activeSection === "feedback" && (

          <section
            className="citizen-section feedback-section"
            id="feedback"
          >

            <div className="citizen-section-heading">

              <div>

                <span>
                  CITIZEN VOICE
                </span>

                <h2>
                  ⭐ Feedback
                </h2>

                <p>
                  Your feedback helps improve JeevanSetu.
                </p>

              </div>

            </div>


            <div className="feedback-banner">

              <div className="feedback-banner-icon">
                ⭐
              </div>

              <div>

                <h2>
                  Your Feedback Matters
                </h2>

                <p>
                  Complete a service and rate your worker
                  to help improve JeevanSetu.
                </p>

              </div>

            </div>


            <div className="complaint-list-heading">

              <div>

                <h3>
                  📋 Completed Services
                </h3>

                <p>
                  You can rate completed services here.
                </p>

              </div>

            </div>


            {completedJobs.length === 0 ? (

              <div className="citizen-empty">

                <div className="empty-big-icon">
                  ⭐
                </div>

                <h3>
                  No completed services yet
                </h3>

                <p>
                  Complete a service to leave feedback
                  for your worker.
                </p>

              </div>

            ) : (

              <div className="citizen-job-grid">

                {completedJobs.map((job) => (

                  <div
                    className="citizen-job-card-new"
                    key={job.id}
                  >

                    <div className="job-card-header">

                      <div>

                        <span className="job-number">
                          JOB #{job.id}
                        </span>

                        <h3>
                          {job.service}
                        </h3>

                      </div>


                      <span className="job-status completed">
                        COMPLETED
                      </span>

                    </div>


                    <div className="job-details">

                      <div>

                        <small>
                          WORKER
                        </small>

                        <strong>
                          👷{" "}
                          {job.worker_name ||
                            "Worker"}
                        </strong>

                      </div>


                      <div>

                        <small>
                          LOCATION
                        </small>

                        <strong>
                          📍 {job.location}
                        </strong>

                      </div>

                    </div>


                    <div className="job-card-footer">

                      <small>
                        Completed service
                      </small>


                      {!job.has_review ? (

                        <button
                          className="rate-worker-btn"
                          onClick={() =>
                            openReview(job)
                          }
                        >
                          ⭐ Rate Worker
                        </button>

                      ) : (

                        <div className="review-completed">

                          ⭐ Rated{" "}

                          <strong>
                            {job.review_rating}/5
                          </strong>

                        </div>

                      )}

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

        )}

      </main>


      {/* COMPLAINT MODAL */}

      {showComplaintForm && (

        <div
          className="citizen-modal-overlay"
          onClick={closeComplaintForm}
        >

          <div
            className="citizen-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="citizen-modal-close"
              onClick={closeComplaintForm}
              disabled={complaintSubmitting}
            >
              ✕
            </button>


            <div className="modal-top-icon">
              🛠️
            </div>


            <h2>
              Raise a Complaint
            </h2>


            <p>
              Tell us about your issue. Government
              support will review your complaint.
            </p>


            <label>
              Complaint Subject
            </label>


            <input
              type="text"
              className="citizen-modal-input"
              placeholder="e.g. Worker did not arrive"
              value={complaintSubject}
              onChange={(e) =>
                setComplaintSubject(
                  e.target.value
                )
              }
              disabled={complaintSubmitting}
            />


            <label>
              Description
            </label>


            <textarea
              className="citizen-modal-input"
              placeholder="Describe your complaint in detail..."
              value={complaintDescription}
              onChange={(e) =>
                setComplaintDescription(
                  e.target.value
                )
              }
              rows="5"
              disabled={complaintSubmitting}
            />


            <label>
              Related Service Request
            </label>


            <select
              className="citizen-modal-input"
              value={complaintJobId}
              onChange={(e) =>
                setComplaintJobId(
                  e.target.value
                )
              }
              disabled={complaintSubmitting}
            >

              <option value="">
                Select service request (optional)
              </option>


              {jobs.map((job) => (

                <option
                  key={job.id}
                  value={job.id}
                >
                  Job #{job.id} - {job.service}
                </option>

              ))}

            </select>


            <label>
              Priority
            </label>


            <select
              className="citizen-modal-input"
              value={complaintPriority}
              onChange={(e) =>
                setComplaintPriority(
                  e.target.value
                )
              }
              disabled={complaintSubmitting}
            >

              <option value="low">
                Low Priority
              </option>

              <option value="medium">
                Medium Priority
              </option>

              <option value="high">
                High Priority
              </option>

            </select>


            <div className="citizen-modal-actions">

              <button
                className="modal-cancel-btn"
                onClick={closeComplaintForm}
                disabled={complaintSubmitting}
              >
                Cancel
              </button>


              <button
                className="modal-submit-btn"
                onClick={submitComplaint}
                disabled={
                  complaintSubmitting ||
                  !complaintSubject.trim() ||
                  !complaintDescription.trim()
                }
              >

                {complaintSubmitting
                  ? "Submitting..."
                  : "Submit Complaint"}

              </button>

            </div>

          </div>

        </div>

      )}


      {/* REVIEW MODAL */}

      {reviewJob && (

        <div
          className="citizen-modal-overlay"
          onClick={closeReview}
        >

          <div
            className="citizen-modal review-modal-new"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="citizen-modal-close"
              onClick={closeReview}
            >
              ✕
            </button>


            <div className="modal-top-icon">
              ⭐
            </div>


            <h2>
              Rate Your Service
            </h2>


            <p>
              How was your experience with{" "}

              <strong>
                {reviewJob.worker_name}
              </strong>
              ?
            </p>


            <div className="star-rating-new">

              {[1, 2, 3, 4, 5].map(
                (star) => (

                  <button
                    key={star}
                    type="button"
                    className={
                      star <= rating
                        ? "star-new selected"
                        : "star-new"
                    }
                    onClick={() =>
                      setRating(star)
                    }
                  >
                    ★
                  </button>

                )
              )}

            </div>


            <div className="rating-text-new">

              {rating === 0 &&
                "Select a rating"}

              {rating === 1 &&
                "Poor"}

              {rating === 2 &&
                "Below Average"}

              {rating === 3 &&
                "Average"}

              {rating === 4 &&
                "Good"}

              {rating === 5 &&
                "Excellent"}

            </div>


            <label>
              Your Feedback
            </label>


            <textarea
              className="citizen-modal-input"
              placeholder="Write your feedback (optional)..."
              value={feedback}
              onChange={(e) =>
                setFeedback(
                  e.target.value
                )
              }
              rows="4"
            />


            <div className="citizen-modal-actions">

              <button
                className="modal-cancel-btn"
                onClick={closeReview}
                disabled={reviewLoading}
              >
                Cancel
              </button>


              <button
                className="modal-submit-btn"
                onClick={submitReview}
                disabled={
                  reviewLoading ||
                  rating === 0
                }
              >

                {reviewLoading
                  ? "Submitting..."
                  : "Submit Rating"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


export default CitizenDashboard;