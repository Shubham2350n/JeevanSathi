import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/api";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
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
      const data = await loginUser(form);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "worker") {
        navigate("/worker");
      } else if (data.user.role === "government") {
        navigate("/government");
      } else {
        navigate("/citizen");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed"
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
        <div className="auth-card-premium">
          <div className="auth-card-glow"></div>

          <div className="auth-card-content">
            <div className="auth-welcome-icon">👋</div>

            <div className="auth-heading">
              <span className="auth-eyebrow">
                WELCOME BACK
              </span>

              <h1>Login to JeevanSetu</h1>

              <p>
                Connect with trusted services and
                empower your community.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Email */}
              <div className="auth-field">
                <label htmlFor="login-email">
                  Email Address
                </label>

                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">✉</span>

                  <input
                    id="login-email"
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
                <label htmlFor="login-password">
                  Password
                </label>

                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🔒</span>

                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Error */}
              {message && (
                <div className="auth-message auth-error">
                  <span>⚠</span>
                  <p>{message}</p>
                </div>
              )}

              {/* Login button */}
              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner"></span>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <span className="auth-button-arrow">
                      →
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Register */}
            <div className="auth-switch">
              <span>Don't have an account?</span>

              <button
                type="button"
                onClick={() => navigate("/register")}
              >
                Create Account
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

export default Login;