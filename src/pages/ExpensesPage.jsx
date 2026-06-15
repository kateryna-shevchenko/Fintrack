import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SidebarMenu from "../components/ui/SidebarMenu";
import DonutChart from "../components/ui/DonutChart1";
import { getExpenses } from "../services/expenseService";
import "../styles/expenses.css";
import { translate } from "../utils/dictionary";
import getApiBaseUrl from "../config/api.js";
import { useLanguage } from "../context/LanguageContext";

const CATEGORY_COLORS = {
  "📄": "#4b7be3", // utilities - blue
  "🎓": "#ff8c00", // education - orange
  "🎬": "#ff00c3", // entertainment - magenta
  "🍴": "#16a085", // food - green
  "❤️": "#ffb3d9", // health - light pink
  "💡": "#9ca3af", // other - gray
  "🛒": "#ffd600", // shopping - yellow
  "🚗": "#00cfff", // transport - cyan
  "✈️": "#a682ff", // travel - purple
};
const CATEGORY_LABEL_KEYS = {
  "📄": "billsAndUtilities",
  "🎓": "education",
  "🎬": "entertainment",
  "🍴": "foodAndDining",
  "❤️": "healthcare",
  "💡": "other",
  "🛒": "shopping",
  "🚗": "transportation",
  "✈️": "travel",
};
const CATEGORY_ICONS = {
  utilities: "📄",
  education: "🎓",
  entertainment: "🎬",
  food: "🍴",
  health: "❤️",
  other: "💡",
  shopping: "🛒",
  transport: "🚗",
  travel: "✈️",
};

const ExpensesPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [viewMode, setViewMode] = useState("month");

  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);
  const [isYearMenuOpen, setIsYearMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const monthNames = [
    translate(language, "january"),
    translate(language, "february"),
    translate(language, "march"),
    translate(language, "april"),
    translate(language, "may"),
    translate(language, "june"),
    translate(language, "july"),
    translate(language, "august"),
    translate(language, "september"),
    translate(language, "october"),
    translate(language, "november"),
    translate(language, "december"),
  ];

  const formatMonthYear = (year, monthIndex) =>
    `${monthNames[monthIndex]} ${year}`;

  const sameMonth = (d, year, monthIndex) =>
    d.getFullYear() === year && d.getMonth() === monthIndex;

  const sameYear = (d, year) => d.getFullYear() === year;

  // Fetch all expenses on mount
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        setError(null);

        const expenses = await getExpenses();
        setTransactions(expenses);
      } catch (err) {
        console.error("Error loading expenses:", err);

        // Redirect to login if not authenticated
        if (err.status === 401) {
          navigate("/");
          return;
        }

        setError(translate(language, "failedToLoadExpenses"));
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();

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

  const availableMonths = useMemo(() => {
    const setKey = new Set();
    const list = [];

    transactions.forEach((t) => {
      const d = new Date(t.date);
      const y = d.getFullYear();
      const m = d.getMonth();
      const key = `${y}-${m}`;
      if (!setKey.has(key)) {
        setKey.add(key);
        list.push({
          year: y,
          month: m,
          label: formatMonthYear(y, m),
          sortKey: new Date(y, m, 1).getTime(),
        });
      }
    });

    list.sort((a, b) => b.sortKey - a.sortKey);
    return list;
  }, [transactions]);

  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    transactions.forEach((t) => {
      const d = new Date(t.date);
      yearsSet.add(d.getFullYear());
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [transactions]);

  useEffect(() => {
    if (!selectedMonth || !selectedYear) {
      if (availableMonths.length > 0) {
        setSelectedMonth(availableMonths[0].month);
        setSelectedYear(availableMonths[0].year);
      } else {
        const now = new Date();
        setSelectedMonth(now.getMonth());
        setSelectedYear(now.getFullYear());
      }
    }
  }, [availableMonths]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMonthMenuOpen(false);
        setIsYearMenuOpen(false);
      }
    };
    if (isMonthMenuOpen || isYearMenuOpen) {
      document.addEventListener("mousedown", onDocClick);
    }
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isMonthMenuOpen, isYearMenuOpen]);

  const filteredTransactions = useMemo(() => {
    if (!selectedYear || selectedMonth === null) return [];
    if (viewMode === "month") {
      return transactions.filter((t) => {
        const d = new Date(t.date);
        return sameMonth(d, selectedYear, selectedMonth);
      });
    } else {
      return transactions.filter((t) => {
        const d = new Date(t.date);
        return sameYear(d, selectedYear);
      });
    }
  }, [transactions, viewMode, selectedMonth, selectedYear]);

  const categoriesMap = useMemo(() => {
    const map = {};
    filteredTransactions.forEach((tx) => {
      const icon = CATEGORY_ICONS[tx.category] || "⋯";
      if (!map[icon]) {
        const labelKey = CATEGORY_LABEL_KEYS[icon] || "other";
        map[icon] = {
          sum: 0,
          count: 0,
          label: translate(language, labelKey),
          color: CATEGORY_COLORS[icon] || "#18181b",
        };
      }
      map[icon].sum += Math.abs(tx.amount);
      map[icon].count += 1;
    });
    return map;
  }, [filteredTransactions, language]);

  const chartData = useMemo(
    () =>
      Object.entries(categoriesMap)
        .map(([icon, data]) => ({ icon, ...data }))
        .sort((a, b) => b.sum - a.sum),
    [categoriesMap],
  );

  const total = useMemo(
    () => chartData.reduce((a, c) => a + c.sum, 0),
    [chartData],
  );

  const title = useMemo(() => {
    if (!selectedYear || selectedMonth === null) return "";
    return viewMode === "month"
      ? formatMonthYear(selectedYear, selectedMonth)
      : String(selectedYear);
  }, [viewMode, selectedYear, selectedMonth]);

  const headerTotalValue = useMemo(() => {
    return filteredTransactions.reduce((a, t) => a + Math.abs(t.amount), 0);
  }, [filteredTransactions]);
  const headerTotal = headerTotalValue.toFixed(2);

  const handlePickMonth = (year, month) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setIsMonthMenuOpen(false);
  };

  const handlePickYear = (year) => {
    setSelectedYear(year);
    setIsYearMenuOpen(false);
  };

  const handleToggleView = (mode) => setViewMode(mode);

  if (loading) {
    return (
      <div className="dashboard-gradient-bg">
        <button className="burger-btn" onClick={() => setShowMenu(true)}>
          ☰
        </button>
        <button onClick={() => navigate("/app/dashboard")} className="back-btn">
          ←
        </button>
        <SidebarMenu open={showMenu} onClose={() => setShowMenu(false)} />
        <div className="dashboard-center-wrap">
          <div className="expenses-no-data">
            {translate(language, "loadingExpenses")}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-gradient-bg">
        <button className="burger-btn" onClick={() => setShowMenu(true)}>
          ☰
        </button>
        <button onClick={() => navigate("/app/dashboard")} className="back-btn">
          ←
        </button>
        <SidebarMenu open={showMenu} onClose={() => setShowMenu(false)} />
        <div className="dashboard-center-wrap">
          <div className="expenses-no-data" style={{ color: "#FF5E5E" }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-gradient-bg">
      <button className="burger-btn" onClick={() => setShowMenu(true)}>
        ☰
      </button>
      <button onClick={() => navigate("/app/dashboard")} className="back-btn">
        ←
      </button>
      <SidebarMenu open={showMenu} onClose={() => setShowMenu(false)} />

      <div className="dashboard-center-wrap">
        <div className="expenses-header">
          <div className="month-menu-wrap" ref={menuRef}>
            <button
              className="expenses-title"
              onClick={() => {
                if (viewMode === "month") {
                  setIsMonthMenuOpen((v) => !v);
                  setIsYearMenuOpen(false);
                } else {
                  setIsYearMenuOpen((v) => !v);
                  setIsMonthMenuOpen(false);
                }
              }}
              aria-haspopup="listbox"
              aria-expanded={isMonthMenuOpen || isYearMenuOpen}
              title={translate(
                language,
                viewMode === "month" ? "chooseMonth" : "chooseYear",
              )}
            >
              {title}
              <span className="expenses-title-caret">▾</span>
            </button>

            {isMonthMenuOpen && viewMode === "month" && (
              <div role="listbox" className="month-dropdown">
                {availableMonths.length === 0 && (
                  <div className="month-empty">
                    {translate(language, "noMonths")}
                  </div>
                )}
                {availableMonths.map((m) => {
                  const isActive =
                    m.year === selectedYear && m.month === selectedMonth;
                  return (
                    <button
                      key={`${m.year}-${m.month}`}
                      onClick={() => handlePickMonth(m.year, m.month)}
                      className={`month-dropdown-item ${
                        isActive ? "active" : ""
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            )}

            {isYearMenuOpen && viewMode === "year" && (
              <div role="listbox" className="month-dropdown">
                {availableYears.length === 0 && (
                  <div className="month-empty">
                    {translate(language, "noMonths")}
                  </div>
                )}
                {availableYears.map((year) => {
                  const isActive = year === selectedYear;
                  return (
                    <button
                      key={year}
                      onClick={() => handlePickYear(year)}
                      className={`month-dropdown-item ${
                        isActive ? "active" : ""
                      }`}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <span className="expenses-total">
            {headerTotalValue === 0
              ? `${headerTotal} zł`
              : `-${headerTotal} zł`}
          </span>

          <div className="view-toggle-wrap">
            <button
              onClick={() => handleToggleView("month")}
              aria-pressed={viewMode === "month"}
              className={`view-toggle-btn ${
                viewMode === "month" ? "active" : ""
              }`}
              title={translate(language, "showMonthlyChart")}
            >
              {translate(language, "month")}
            </button>
            <button
              onClick={() => handleToggleView("year")}
              aria-pressed={viewMode === "year"}
              className={`view-toggle-btn ${
                viewMode === "year" ? "active" : ""
              }`}
              title={translate(language, "showYearlyChart")}
            >
              {translate(language, "year")}
            </button>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="expenses-chart-wrap">
            <DonutChart data={chartData} total={total} mode={viewMode} />
          </div>
        ) : (
          <div className="expenses-no-data">
            {translate(language, "noDataForPeriod")}
          </div>
        )}

        {chartData.length > 0 && (
          <>
            <div className="expenses-transactions-title">
              {translate(language, "transactions")}
            </div>
            <div className="expenses-transactions-list">
              {chartData.map((cat) => (
                <div className="expenses-transaction-row" key={cat.icon}>
                  <span
                    className="expenses-transaction-icon"
                    style={{ background: cat.color }}
                  >
                    {cat.icon}
                  </span>
                  <div className="expenses-transaction-info">
                    <div className="expenses-transaction-label">
                      {cat.label}
                    </div>
                    <div className="expenses-transaction-count">
                      {cat.count}{" "}
                      {cat.count === 1
                        ? translate(language, "transaction")
                        : translate(language, "transactions").toLowerCase()}
                    </div>
                  </div>
                  <div className="expenses-transaction-amount">
                    -{cat.sum.toFixed(2)} zł
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExpensesPage;
