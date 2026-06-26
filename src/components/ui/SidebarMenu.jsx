import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import "../../styles/sidebarMenu.css";
import { logoutAction } from "../../actions/logout";
import { translate } from "../../utils/dictionary";
import LanguageSwitcher from "./LanguageSwitcher";

const SidebarMenu = ({ open, onClose }) => {
  const navigate = useNavigate();

  if (!open) {
    return null;
  }

  return createPortal(
    <>
      <button
        type="button"
        className="sidebar-backdrop"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div className="sidebar-menu open">
        <button type="button" className="sidebar-close" onClick={onClose}>
          ×
        </button>
        <div className="sidebar-lang-switcher">
          <LanguageSwitcher />
        </div>
        <button
          type="button"
          onClick={() => {
            navigate("/app/dashboard");
            onClose();
          }}
        >
          {translate("dashboard")}
        </button>
        <button
          type="button"
          onClick={() => {
            navigate("/app/goals");
            onClose();
          }}
        >
          {translate("goals")}
        </button>
        <button
          type="button"
          onClick={() => {
            navigate("/app/transactions");
            onClose();
          }}
        >
          {translate("transactions")}
        </button>
        <button
          type="button"
          onClick={() => {
            navigate("/app/expenses");
            onClose();
          }}
        >
          {translate("expenses")}
        </button>
        <button
          type="button"
          onClick={() => {
            logoutAction();
            onClose();
          }}
        >
          {translate("logout")}
        </button>
      </div>
    </>,
    document.body,
  );
};

export default SidebarMenu;
