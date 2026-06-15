import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarMenu from "../components/ui/SidebarMenu";
import "../styles/dashboard.css";
import "../styles/goals.css";
import * as goalService from "../services/goalService";
import { translate } from "../utils/dictionary";
import getApiBaseUrl from "../config/api.js";
import { useLanguage } from "../context/LanguageContext";
import {
  PaperAirplaneIcon,
  DevicePhoneMobileIcon,
  GiftIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  TruckIcon,
  HeartIcon,
  BookOpenIcon,
  SunIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const categoryGroups = {
  "Short-Term Goals (0-12 months)": [
    {
      name: "Vacation",
      icon: PaperAirplaneIcon,
      iconName: "AirplaneIcon",
      color: "#3498db",
    },
    {
      name: "Gadgets / Electronics",
      icon: DevicePhoneMobileIcon,
      iconName: "DevicePhoneMobileIcon",
      color: "#9b59b6",
    },
    {
      name: "Holiday Shopping",
      icon: GiftIcon,
      iconName: "GiftIcon",
      color: "#e74c3c",
    },
    {
      name: "Emergency Buffer",
      icon: ExclamationTriangleIcon,
      iconName: "ExclamationTriangleIcon",
      color: "#e67e22",
    },
  ],
  "Mid-Term Goals (1-5 years)": [
    {
      name: "Home Renovation",
      icon: HomeIcon,
      iconName: "HomeIcon",
      color: "#16a085",
    },
    {
      name: "Car Purchase",
      icon: TruckIcon,
      iconName: "TruckIcon",
      color: "#2980b9",
    },
    {
      name: "Wedding / Big Event",
      icon: HeartIcon,
      iconName: "HeartIcon",
      color: "#f39c12",
    },
    {
      name: "Education Fund",
      icon: BookOpenIcon,
      iconName: "BookOpenIcon",
      color: "#8e44ad",
    },
  ],
  "Long-Term Goals (5+ years)": [
    {
      name: "Retirement",
      icon: SunIcon,
      iconName: "SunIcon",
      color: "#27ae60",
    },
    {
      name: "Real Estate Down Payment",
      icon: BuildingOffice2Icon,
      iconName: "BuildingOffice2Icon",
      color: "#2c3e50",
    },
    {
      name: "Investment Fund",
      icon: ChartBarIcon,
      iconName: "ChartBarIcon",
      color: "#16a085",
    },
  ],
};

const allCategories = Object.values(categoryGroups).flat();
const statusOptions = ["active", "achieved", "cancelled"];

// Function to get icon component from icon name
const getIconComponent = (iconName) => {
  console.log("getIconComponent called with:", iconName);
  
  // Handle emoji shortcuts
  if (iconName === 'car_emoji') return null; // Will fallback to emoji display
  
  const iconMap = {
    AirplaneIcon: PaperAirplaneIcon,
    DevicePhoneMobileIcon,
    GiftIcon,
    ExclamationTriangleIcon,
    HomeIcon,
    TruckIcon,
    HeartIcon,
    BookOpenIcon,
    SunIcon,
    BuildingOffice2Icon,
    ChartBarIcon,
  };
  const result = iconMap[iconName];
  console.log("iconMap result:", result);
  return result;
};

// Function to translate category names
const translateCategoryName = (categoryName, language) => {
  const categoryTranslations = {
    Vacation: "vacation",
    "Gadgets / Electronics": "gadgetsElectronics",
    "Holiday Shopping": "holidayShopping",
    "Emergency Buffer": "emergencyBuffer",
    "Home Renovation": "homeRenovation",
    "Car Purchase": "carPurchase",
    "Wedding / Big Event": "weddingBigEvent",
    "Education Fund": "educationFund",
    Retirement: "retirement",
    "Real Estate Down Payment": "realEstateDownPayment",
    "Investment Fund": "investmentFund",
  };

  const translationKey = categoryTranslations[categoryName];
  return translationKey ? translate(language, translationKey) : categoryName;
};

const GoalsPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    target: "",
    targetDate: "",
    category: allCategories[0],
    status: "active",
    isCustomCategory: false,
    customCategoryName: "",
    customIcon: "",
    customColor: "#a682ff",
  });

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const goalsData = await goalService.getGoals();
        setGoals(goalsData);
      } catch (error) {
        console.error("Error fetching goals:", error);
        if (error.status === 401) {
          navigate("/");
        }
      }
    };
    fetchGoals();

    // Refresh session periodically to prevent timeout
    const sessionRefresh = setInterval(
      async () => {
        try {
          const API_URL = getApiBaseUrl();
          await fetch(`${API_URL}/api/health`, {
            credentials: "include",
          });
        } catch (error) {
          console.error("Session refresh failed:", error);
        }
      },
      10 * 60 * 1000,
    ); // Refresh every 10 minutes

    return () => clearInterval(sessionRefresh);
  }, [navigate]);

  const handleAddGoal = () => {
    setForm({
      name: "",
      description: "",
      target: "",
      targetDate: "",
      category: allCategories[0],
      status: "active",
      isCustomCategory: false,
      customCategoryName: "",
      customIcon: "",
      customColor: "#a682ff",
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.target || isNaN(form.target)) return;

    // Validate custom category fields
    if (form.isCustomCategory) {
      if (!form.customCategoryName || !form.customIcon) {
        alert("Please fill in custom category name and icon");
        return;
      }
    }

    const goalData = {
      name: form.name,
      description: form.description,
      target: parseFloat(form.target),
      targetDate: form.targetDate,
      icon: form.isCustomCategory
        ? form.customIcon
        : form.category?.iconName,
      color: form.isCustomCategory ? form.customColor : form.category?.color,
      categoryName: form.isCustomCategory
        ? form.customCategoryName
        : form.category?.name,
      status: form.status,
    };

    try {
      const newGoal = await goalService.createGoal(goalData);
      setGoals([...goals, newGoal]);
      setForm({
        name: "",
        description: "",
        target: "",
        targetDate: "",
        category: allCategories[0],
        status: "active",
        isCustomCategory: false,
        customCategoryName: "",
        customIcon: "",
        customColor: "#a682ff",
      });
      setShowModal(false);
    } catch (error) {
      console.error("Error creating goal:", error);
      alert("Failed to create goal. Please try again.");
    }
  };

  const handleDeleteGoal = (goalIndex, e) => {
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();

    const goal = goals[goalIndex];
    if (!goal || !goal.id) return;

    setGoalToDelete({ goal, index: goalIndex });
    setShowDeleteModal(true);
  };

  const confirmDeleteGoal = async () => {
    if (!goalToDelete) return;

    try {
      await goalService.deleteGoal(goalToDelete.goal.id);
      const updated = goals.filter((_, index) => index !== goalToDelete.index);
      setGoals(updated);
      setShowDeleteModal(false);
      setGoalToDelete(null);
    } catch (error) {
      console.error("Error deleting goal:", error);
      alert("Failed to delete goal. Please try again.");
    }
  };

  const cancelDeleteGoal = () => {
    setShowDeleteModal(false);
    setGoalToDelete(null);
  };

  return (
    <div className="dashboard-gradient-bg">
      <button className="back-btn" onClick={() => navigate("/app/dashboard")}>
        ←
      </button>
      <button className="burger-btn" onClick={() => setShowMenu(true)}>
        ☰
      </button>
      <SidebarMenu open={showMenu} onClose={() => setShowMenu(false)} />

      <div className="dashboard-center-wrap">
        <h1 className="dashboard-title">
          {translate(language, "savingGoals")}
        </h1>

        <div className="goals-list">
          {goals.map((goal, idx) => {
            const percentage = goal.target
              ? Math.min(100, (goal.current / goal.target) * 100)
              : 0;

            const statusBadgeClass =
              goal.status === "achieved"
                ? "status-achieved"
                : goal.status === "cancelled"
                  ? "status-cancelled"
                  : "status-active";

            return (
              <div
                className="goal-card"
                key={goal.id || goal.name + idx}
                onClick={() => navigate(`/app/goal/${goal.id}`)}
                style={{ cursor: "pointer" }}
              >
                <div
                  className="goal-icon"
                  style={{
                    backgroundColor: goal.color,
                    boxShadow: `0 0 0 3px ${goal.color}30`,
                  }}
                >
                  {(() => {
                    console.log("Rendering icon for goal:", goal.icon);
                    const IconComponent = getIconComponent(goal.icon);
                    console.log("IconComponent:", IconComponent);
                    return IconComponent ? (
                      <IconComponent
                        style={{
                          width: "24px",
                          height: "24px",
                          color: "white",
                        }}
                      />
                    ) : (
                      <span role="img" aria-label="goal" style={{ fontSize: "24px" }}>
                        {goal.icon === 'car_emoji' ? '🚗' : goal.icon}
                      </span>
                    );
                  })()}
                </div>
                <div className="goal-info">
                  <button
                    type="button"
                    className="goal-delete-btn"
                    onClick={(e) => handleDeleteGoal(idx, e)}
                  ></button>
                  <div className="goal-title">{goal.name}</div>
                  <div className="goal-progress-bar">
                    <div
                      className="goal-progress"
                      data-progress={percentage}
                      style={{
                        width: `${percentage}%`,
                        background: "#a682ff",
                      }}
                    ></div>
                  </div>
                  <div className="goal-amounts">
                    <span>{goal.current || 0} zł</span>
                    <span>{goal.target} zł</span>
                  </div>
                  <div className="goal-bottom-info">
                    {goal.categoryName && (
                      <div className="goal-category">
                        {translateCategoryName(goal.categoryName, language)}
                      </div>
                    )}
                    {goal.targetDate && (
                      <div className="goal-target-date">
                        📅 {new Date(goal.targetDate).toLocaleDateString()}
                      </div>
                    )}
                    <div className={`goal-status-badge ${statusBadgeClass}`}>
                      {translate(language, goal.status || "active")}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button className="add-goal-btn" onClick={handleAddGoal}>
          {translate(language, "addNewGoal")}
        </button>

        {showModal && (
          <div className="transaction-modal">
            <form
              className="transaction-modal-content"
              onSubmit={handleFormSubmit}
            >
              <h2>{translate(language, "addGoal")}</h2>

              <label>
                {translate(language, "name")}
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </label>

              <label>
                {translate(language, "description")}
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows="3"
                  placeholder={translate(
                    language,
                    "goalDescriptionPlaceholder",
                  )}
                />
              </label>

              <label>
                {translate(language, "targetAmount")}
                <input
                  type="number"
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value })}
                  required
                />
              </label>

              <label>
                {translate(language, "targetDate")}
                <input
                  type="date"
                  value={form.targetDate}
                  onChange={(e) =>
                    setForm({ ...form, targetDate: e.target.value })
                  }
                />
              </label>

              <label>
                {translate(language, "category")}
                <select
                  value={form.isCustomCategory ? "custom" : form.category.name}
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setForm({
                        ...form,
                        isCustomCategory: true,
                      });
                    } else {
                      setForm({
                        ...form,
                        isCustomCategory: false,
                        category: allCategories.find(
                          (opt) => opt.name === e.target.value,
                        ),
                      });
                    }
                  }}
                >
                  {Object.entries(categoryGroups).map(
                    ([groupName, categories]) => (
                      <optgroup key={groupName} label={groupName}>
                        {categories.map((opt) => (
                          <option key={opt.name} value={opt.name}>
                            {translateCategoryName(opt.name, language)}
                          </option>
                        ))}
                      </optgroup>
                    ),
                  )}
                  <option value="custom">
                    {translate(language, "customCategory")}
                  </option>
                </select>
              </label>

              {form.isCustomCategory && (
                <>
                  <label>
                    {translate(language, "customCategoryName")}
                    <input
                      type="text"
                      value={form.customCategoryName}
                      onChange={(e) =>
                        setForm({ ...form, customCategoryName: e.target.value })
                      }
                      placeholder={translate(language, "categoryPlaceholder")}
                      required
                    />
                  </label>

                  <label>
                    {translate(language, "customIcon")}
                    <input
                      type="text"
                      value={form.customIcon}
                      onChange={(e) =>
                        setForm({ ...form, customIcon: e.target.value })
                      }
                      placeholder={translate(language, "iconPlaceholder")}
                      maxLength="2"
                      required
                    />
                  </label>

                  <label>
                    {translate(language, "customColor")}
                    <input
                      type="color"
                      value={form.customColor}
                      onChange={(e) =>
                        setForm({ ...form, customColor: e.target.value })
                      }
                    />
                  </label>
                </>
              )}

              <label>
                {translate(language, "status")}
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {translate(language, status)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="transaction-modal-buttons">
                <button type="submit" className="primary-btn">
                  Save
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {showDeleteModal && goalToDelete && (
          <div className="transaction-modal">
            <div className="delete-modal-content">
              <h2>{translate(language, "deleteGoal")}</h2>
              <p>
                {translate(language, "confirmDeleteGoal", {
                  name: goalToDelete.goal.name,
                })}
              </p>
              <div className="transaction-modal-buttons">
                <button
                  type="button"
                  className="delete-confirm-btn"
                  onClick={confirmDeleteGoal}
                >
                  {translate(language, "delete")}
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={cancelDeleteGoal}
                >
                  {translate(language, "cancel")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsPage;
