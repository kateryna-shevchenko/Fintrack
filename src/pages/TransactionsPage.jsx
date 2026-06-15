import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarMenu from "../components/ui/SidebarMenu";
import CategoryIcon from "../components/ui/CategoryIcon";
import "../styles/dashboard.css";
import "../styles/transactions.css";
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
} from "../services/transactionService";
import { translate } from "../utils/dictionary";
import getApiBaseUrl from "../config/api.js";
import { useLanguage } from "../context/LanguageContext";

const categoryLabelKeys = {
  utilities: "billsAndUtilities",
  education: "education",
  entertainment: "entertainment",
  food: "foodAndDining",
  health: "healthcare",
  other: "other",
  shopping: "shopping",
  transport: "transportation",
  travel: "travel",
};

const iconToCategoryMap = {
  "📄": "utilities",
  "🎓": "education",
  "🎬": "entertainment",
  "🍴": "food",
  "❤️": "health",
  "💡": "other",
  "🛒": "shopping",
  "🚗": "transport",
  "✈️": "travel",
};

const TransactionsPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    category: "food",
    type: "expense",
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch transactions from backend
        const dbTransactions = await getTransactions();
        setTransactions(dbTransactions);
      } catch (err) {
        console.error("Error loading transactions:", err);

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

    fetchTransactions();

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

  const filtered = transactions.filter((t) => {
    if (filter === "all") return true;
    if (filter === "income") return t.amount > 0;
    if (filter === "expense") return t.amount < 0;
  });

  const handleAddTransaction = () => {
    setForm({
      name: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      category: "food",
      type: "expense",
    });
    setShowModal(true);
  };

  const handleDeleteTransaction = async (transactionId) => {
    setTransactionToDelete(transactionId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;

    try {
      await deleteTransaction(transactionToDelete);

      // Remove from local state
      setTransactions(transactions.filter((t) => t.id !== transactionToDelete));
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    } catch (err) {
      console.error("Error deleting transaction:", err);

      // Redirect to login if not authenticated
      if (err.status === 401) {
        navigate("/");
        return;
      }

      alert("Failed to delete transaction. Please try again.");
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTransactionToDelete(null);
  };

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.amount || isNaN(form.amount)) {
      alert("Fill all fields correctly");
      return;
    }

    const amount =
      form.type === "expense"
        ? -Math.abs(parseFloat(form.amount))
        : Math.abs(parseFloat(form.amount));

    const newTx = {
      name: form.name,
      category: form.category,
      type: form.type,
      amount,
      date: form.date || new Date().toISOString().slice(0, 10),
    };

    try {
      // Save to backend
      const createdTransaction = await createTransaction(newTx);

      // Update local state with the new transaction
      const updated = [createdTransaction, ...transactions];
      setTransactions(updated);

      setShowModal(false);
    } catch (err) {
      console.error("Error saving transaction:", err);

      // Redirect to login if not authenticated
      if (err.status === 401) {
        navigate("/");
        return;
      }

      alert("Failed to save transaction. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const date = new Date();
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
  const currentMonthYear = `${
    monthNames[date.getMonth()]
  } ${date.getFullYear()}`;

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
        <div className="transactions-header">
          <h1 className="dashboard-title">
            {translate(language, "transactions")}
          </h1>
          <button
            className="dashboard-add-transaction-btn"
            onClick={handleAddTransaction}
          >
            {translate(language, "add")}
          </button>
        </div>

        {error && (
          <div style={{ color: "red", padding: "10px", textAlign: "center" }}>
            {error}
          </div>
        )}

        <div className="transactions-filters">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            {translate(language, "all")}
          </button>
          <button
            className={filter === "income" ? "active" : ""}
            onClick={() => setFilter("income")}
          >
            {translate(language, "income")}
          </button>
          <button
            className={filter === "expense" ? "active" : ""}
            onClick={() => setFilter("expense")}
          >
            {translate(language, "expense")}
          </button>
        </div>

        <div className="transactions-date-header">{currentMonthYear}</div>

        <div className="transactions-list">
          {loading ? (
            <div className="transactions-empty">
              {translate(language, "loading")}
            </div>
          ) : filtered.length === 0 ? (
            <div className="transactions-empty">
              {translate(language, "noTransactions")}
            </div>
          ) : (
            filtered.map((t, i) => (
              <div className="transaction-card" key={t.id || i}>
                <CategoryIcon category={t.category} size={40} />
                <div className="transaction-info">
                  <span className="transaction-name">{t.name}</span>
                  <span className="transaction-date">{formatDate(t.date)}</span>
                </div>
                <span
                  className={`transaction-amount ${
                    t.amount > 0 ? "income" : "expense"
                  }`}
                >
                  {t.amount > 0 ? "+" : ""}
                  {t.amount < 0 ? "-" : ""}
                  {Math.abs(t.amount).toFixed(2)} zł
                </span>
                <button
                  className="transaction-delete-btn"
                  onClick={() => handleDeleteTransaction(t.id)}
                  title="Delete transaction"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="transaction-modal">
          <form
            className="transaction-modal-content"
            onSubmit={handleSaveTransaction}
          >
            <h2>{translate(language, "addTransaction")}</h2>

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
              {translate(language, "amount")}
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </label>

            <label>
              {translate(language, "date")}
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </label>

            <label>
              {translate(language, "category")}
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="food">{translate(language, "food")}</option>
                <option value="transport">
                  {translate(language, "transport")}
                </option>
                <option value="entertainment">
                  {translate(language, "entertainment")}
                </option>
                <option value="utilities">
                  {translate(language, "utilities")}
                </option>
                <option value="health">{translate(language, "health")}</option>
                <option value="shopping">
                  {translate(language, "shopping")}
                </option>
                <option value="other">{translate(language, "other")}</option>
              </select>
            </label>

            <label>
              {translate(language, "type")}
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="expense">
                  {translate(language, "expense")}
                </option>
                <option value="income">{translate(language, "income")}</option>
              </select>
            </label>

            <div className="transaction-modal-buttons">
              <button type="submit" className="primary-btn">
                {translate(language, "save")}
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowModal(false)}
              >
                {translate(language, "cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {showDeleteModal && (
        <div className="transaction-modal">
          <div className="delete-modal-content">
            <h2>{translate(language, "confirmDelete")}</h2>
            <div className="transaction-modal-buttons">
              <button
                type="button"
                className="delete-confirm-btn"
                onClick={confirmDelete}
              >
                {translate(language, "yes")}
              </button>
              <button
                type="button"
                className="delete-cancel-btn"
                onClick={cancelDelete}
              >
                {translate(language, "no")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
