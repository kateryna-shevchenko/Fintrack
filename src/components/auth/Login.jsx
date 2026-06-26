import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/introStart.css";
import authService from "../../services/authService";
import { translate } from "../../utils/dictionary";
import { useLanguage } from "../../context/LanguageContext";
import AppHeader from "../ui/AppHeader";
import ForgotPasswordModal from "./ForgotPasswordModal";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {

    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.login({ email, password });

      // Store user info and navigate to dashboard
      localStorage.setItem("userFullName", response.user.name);
      navigate("/app/dashboard");
    } catch (error) {
      setError(error.message || translate("loginFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="intro-gradient-bg">
      <AppHeader showLanguageSwitcher />
      <div className="login-center">
        <h1 className="login-title">{translate("welcomeBack")}</h1>
        {successMessage && <p className="success-message">{successMessage}</p>}
        {error && <p className="error">{error}</p>}
        <form className="login-form" onSubmit={handleSubmit}>
          <label>{translate("email")}</label>
          <input
            type="email"
            placeholder={translate("email")}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>{translate("password")}</label>
          <input
            type="password"
            placeholder={translate("password")}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading
              ? translate(language, "signingIn")
              : translate(language, "signIn")}
          </button>
        </form>

        <div className="auth-links">
          <button
            type="button"
            className="link-btn forgot-password-btn"
            onClick={() => setShowForgotPassword(true)}
          >
            {translate(language, "forgotPassword")}
          </button>
        </div>

        <div className="login-bottom-link">
          <span>{translate(language, "dontHaveAccount")}</span>
          <button className="link-btn" onClick={() => navigate("/register")}>
            {translate(language, "signUp")}
          </button>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default Login;
