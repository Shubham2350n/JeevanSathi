import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      await registerUser({
        ...form,
        role: "citizen",
      });

      setMessage(
        "Registration successful! Redirecting..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background effects */}
      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>
      <div className="auth-grid"></div>

      <div className="auth-particles">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="auth-content">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-logo">
            <div className="auth-brand-logo-inner">JS</div>
          </div>

          <div className="auth-brand-name">
            JEEVAN<span>SETU</span>
          </div>

          <div className="auth-brand-line">
            <span></span>
            <p>SMART COMMUNITY PLATFORM</p>
            <span></span>
          </div>
        </div>

        {/* Card */}
        <div className="auth-card-premium register-card">
          <div className="auth-card-glow"></div>

          <div className="auth-card-content">
            <div className="auth-welcome-icon">
              ✨
            </div>

            <div className="auth-heading">
              <span className="auth-eyebrow">
                JOIN THE COMMUNITY
              </span>

              <h1>Create Your Account</h1>

              <p>
                Become a part of JeevanSetu and
                connect with your community.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="auth-form"
            >
              {/* Name */}
              <div className="auth-field">
                <label htmlFor="register-name">
                  Full Name
                </label>

                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    👤
                  </span>

                  <input
                    id="register-name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="auth-field">
                <label htmlFor="register-email">
                  Email Address
                </label>

                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    ✉
                  </span>

                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-field">
                <label htmlFor="register-password">
                  Password
                </label>

                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    🔒
                  </span>

                  <input
                    id="register-password"
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                <small className="auth-helper">
                  Password must contain at least 6
                  characters.
                </small>
              </div>

              {/* Message */}
              {message && (
                <div
                  className={
                    message.includes("successful")
                      ? "auth-message auth-success"
                      : "auth-message auth-error"
                  }
                >
                  <span>
                    {message.includes("successful")
                      ? "✓"
                      : "⚠"}
                  </span>

                  <p>{message}</p>
                </div>
              )}

              {/* Register button */}
              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner"></span>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <span className="auth-button-arrow">
                      →
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Login */}
            <div className="auth-switch">
              <span>Already have an account?</span>

              <button
                type="button"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            </div>

            <div className="auth-bottom-line">
              <span></span>
              <small>CONNECT • SERVE • EMPOWER</small>
              <span></span>
            </div>
          </div>
        </div>

        <p className="auth-footer">
          © 2026 JeevanSetu • Building a better tomorrow
        </p>
      </div>
    </div>
  );
}

export default Register;