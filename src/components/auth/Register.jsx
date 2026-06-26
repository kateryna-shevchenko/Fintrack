import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/auth.css";
import authService from "../../services/authService";
import { translate } from "../../utils/dictionary";
import { useLanguage } from "../../context/LanguageContext";
import AppHeader from "../ui/AppHeader";

const Register = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      newErrors.email = "Incorrect email!";
    }

    // Password strength validation
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long!";
    } else {
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
        password,
      );

      if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
        newErrors.password =
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&* etc.)";
      }
    }

    if (password !== repeatPassword) {
      newErrors.repeatPassword = "Passwords do not match!";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await authService.register({
        name: fullName,
        email: email,
        password: password,
      });

      // Registration successful, navigate to login
      navigate("/login", {
        state: {
          message:
            "Registration successful! Please login with your credentials.",
        },
      });
    } catch (error) {
      setErrors({
        submit: error.message || "Registration failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="intro-gradient-bg">
      <button className="back-btn" onClick={() => navigate("/login")}>
        &#8592;
      </button>
      <AppHeader showLanguageSwitcher />
      <div className="login-center">
        <h1 className="login-title">{translate("signUp")}</h1>
        <p className="register-subtitle">
          Join FinTrack to manage your finances
        </p>
        <form className="login-form" onSubmit={handleRegister}>
          <label>{translate("name")}</label>
          <input
            type="text"
            placeholder={translate("name")}
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <label>{translate("email")}</label>
          <input
            type="email"
            placeholder={translate("email")}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="error">{errors.email}</p>}
          <label>{translate("password")}</label>
          <input
            type="password"
            placeholder={translate("password")}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="password-requirements">
            Must contain: uppercase letter, lowercase letter, number, and
            special character (!@#$%^&* etc.)
          </p>
          {errors.password && <p className="error">{errors.password}</p>}
          <label>Repeat password</label>
          <input
            type="password"
            placeholder="Repeat password"
            required
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
          {errors.repeatPassword && (
            <p className="error">{errors.repeatPassword}</p>
          )}
          {errors.submit && <p className="error">{errors.submit}</p>}
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? translate("signingUp") : translate("signUp")}
          </button>
        </form>
        <div className="login-bottom-link">
          <span>{translate("alreadyHaveAccount")}</span>
          <button className="link-btn" onClick={() => navigate("/login")}>
            {translate("signIn")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
