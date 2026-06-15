import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SidebarMenu from "../components/ui/SidebarMenu";
import { getExpenses } from "../services/expenseService";
import getApiBaseUrl from "../config/api.js";
import "../styles/transactions.css";

const CategoryTransactionsPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch expenses filtered by category
        const expenses = await getExpenses({ category });
        setTransactions(expenses);
      } catch (err) {
        console.error("Error loading category transactions:", err);

        // Redirect to login if not authenticated
        if (err.status === 401) {
          navigate("/");
          return;
        }

        setError("Failed to load transactions. Please try again.");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryTransactions();

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
  }, [category, navigate]);

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getCategoryIcon = (categoryName) => {
    const icons = {
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
    return icons[categoryName?.toLowerCase()] || "💡";
  };

  return (
    <div className="dashboard-gradient-bg">
      <button className="back-btn" onClick={() => navigate("/app/expenses")}>
        ←
      </button>
      <SidebarMenu />
      <div className="dashboard-center-wrap">
        <h1 className="dashboard-title">
          {category}
          <span className="category-title-count">
            {transactions.length} transaction
            {transactions.length !== 1 ? "s" : ""}
          </span>
        </h1>

        {loading ? (
          <div className="transactions-empty">Loading...</div>
        ) : error ? (
          <div className="transactions-empty" style={{ color: "#FF5E5E" }}>
            {error}
          </div>
        ) : (
          <div className="transactions-list">
            {sortedTransactions.length === 0 ? (
              <div className="transactions-empty">No transactions</div>
            ) : (
              sortedTransactions.map((t, i) => (
                <div className="transaction-card" key={t.id || i}>
                  <span className="category-transaction-icon">
                    {getCategoryIcon(t.category)}
                  </span>
                  <div className="transaction-info">
                    <span className="transaction-name">{t.name}</span>
                    <span className="transaction-date">
                      {formatDate(t.date)}
                    </span>
                  </div>
                  <span className="transaction-amount expense">
                    -{Math.abs(t.amount).toFixed(2)} zł
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryTransactionsPage;
