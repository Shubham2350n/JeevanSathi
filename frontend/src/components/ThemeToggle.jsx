import { useTheme } from "../context/ThemeContext";
import "./ThemeToggle.css";

export default function ThemeToggle() {
  const { darkMode, toggleTheme } = useTheme();
  const isLight = !darkMode;

  return (
    <div className="theme-toggle-wrap" aria-label="Theme selector">
      <span className="theme-toggle-label">
        {isLight ? "Light Mode" : "Dark Mode"}
      </span>

      <button
        type="button"
        className={`theme-toggle ${isLight ? "is-light" : "is-dark"}`}
        onClick={toggleTheme}
        aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
        title={`Switch to ${isLight ? "dark" : "light"} mode`}
      >
        <span className="theme-toggle-icon">
          {isLight ? "☀️" : "🌙"}
        </span>
        <span className="theme-toggle-track">
          <span className="theme-toggle-thumb" />
        </span>
      </button>
    </div>
  );
}
