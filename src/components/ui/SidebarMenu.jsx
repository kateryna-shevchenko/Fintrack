import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import "../../styles/sidebarMenu.css";
import { logoutAction } from "../../actions/logout";
import { translate } from "../../utils/dictionary";
import LanguageSwitcher from "./LanguageSwitcher";

const SidebarMenu = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
  }, [open]);

  const handlePanelTransitionEnd = (event) => {
    if (event.propertyName !== "transform" || visible) {
      return;
    }
    setMounted(false);
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <>
      <button
        type="button"
        className={`sidebar-backdrop${visible ? " open" : ""}`}
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        className={`sidebar-menu${visible ? " open" : ""}`}
        onTransitionEnd={handlePanelTransitionEnd}
      >
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
