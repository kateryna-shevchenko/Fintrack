import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { translate } from "../utils/dictionary";
import { useLanguage } from "../context/LanguageContext";
import getApiBaseUrl from "../config/api.js";
import "../styles/auth.css";
import AppHeader from "../components/ui/AppHeader";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(translate(language, "passwordsMustMatch"));
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const API_URL = getApiBaseUrl();
      const response = await fetch(
        `${API_URL}/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: formData.password,
            confirmPassword: formData.confirmPassword,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setError(data.error || translate(language, "invalidResetToken"));
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <AppHeader showLanguageSwitcher />
        <div className="auth-form">
          <h1>✅ {translate(language, "passwordResetSuccess")}</h1>
          <p>Redirecting to login...</p>
          <Link to="/" className="primary-btn">
            {translate(language, "signIn")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <AppHeader showLanguageSwitcher />
      <div className="auth-form">
        <h1>{translate(language, "resetPassword")}</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{translate(language, "newPassword")}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={translate(language, "newPassword")}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>{translate(language, "confirmPassword")}</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={translate(language, "confirmPassword")}
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "..." : translate(language, "resetPassword")}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/">← {translate(language, "signIn")}</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
