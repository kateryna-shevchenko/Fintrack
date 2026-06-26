import LanguageSwitcher from "./LanguageSwitcher";
import "../../styles/header.css";

const GITHUB_URL = "https://github.com/kateryna-shevchenko/Fintrack";

const AppHeader = ({
  showLanguageSwitcher = false,
  showLogo = true,
  reserveBurgerSpace = false,
}) => {
  return (
    <header
      className={`app-header${reserveBurgerSpace ? " app-header--app" : ""}${!showLogo ? " app-header--no-logo" : ""}`}
    >
      {showLogo && <span className="app-header-logo">FinTrack</span>}
      <div className="app-header-actions">
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="app-header-github"
        >
          GitHub
        </a>
        {showLanguageSwitcher && <LanguageSwitcher />}
      </div>
    </header>
  );
};

export default AppHeader;
