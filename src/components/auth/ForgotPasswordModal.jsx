import { useState } from "react";
import { translate } from "../../utils/dictionary";
import { useLanguage } from "../../context/LanguageContext";
import getApiBaseUrl from "../../config/api.js";
import "../../styles/auth.css";

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage("");

    try {
      const API_URL = getApiBaseUrl();
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        setMessage(data.message);
      } else {
        setMessage(data.error || "Failed to send reset link");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setMessage("");
    setEmailSent(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>
          ×
        </button>

        <h2>{translate(language, "forgotPassword")}</h2>

        {!emailSent ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{translate(language, "email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={translate(language, "email")}
                required
                disabled={loading}
              />
            </div>
            <div className="reset-password-button">
              <button
                type="submit"
                className="primary-btn"
                disabled={loading || !email}
              >
                {loading ? "..." : translate(language, "sendResetLink")}
              </button>

              {message && <div className="error-message">{message}</div>}
            </div>
          </form>
        ) : (
          <div className="email-sent-container">
            <div className="success-icon">✅</div>
            <p className="success-message">{message}</p>
            <div className="email-instructions">
              <p>{translate(language, "checkEmailInstructions")}</p>
              <p className="mailhog-info">
                📧 <strong>Development:</strong> Check emails at{" "}
                <a
                  href="http://localhost:8025"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  http://localhost:8025
                </a>
              </p>
            </div>
            <button className="secondary-btn" onClick={handleClose}>
              {translate(language, "close")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
