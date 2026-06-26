const express = require("express");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const { initializeDatabase } = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const transactionsRoutes = require("./routes/transactionsRoutes");
const expensesRoutes = require("./routes/expensesRoutes");
const goalsRoutes = require("./routes/goalsRoutes");
const balanceRoutes = require("./routes/balanceRoutes");
const categoriesRoutes = require("./routes/categoriesRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key-here",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);


const API_PREFIX = process.env.VERCEL ? "" : "/api";


const healthHandler = (req, res) => {
  res.json({ status: "OK", message: "Fintrack Backend is running" });
};
app.get("/health", healthHandler);
if (API_PREFIX) {
  app.get(`${API_PREFIX}/health`, healthHandler);
}


app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    console.error("Database initialization failed:", error);
    res.status(503).json({
      error: "Database unavailable",
      details: error.message,
    });
  }
});

// Routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/transactions`, transactionsRoutes);
app.use(`${API_PREFIX}/expenses`, expensesRoutes);
app.use(`${API_PREFIX}/goals`, goalsRoutes);
app.use(`${API_PREFIX}/balance`, balanceRoutes);
app.use(`${API_PREFIX}/categories`, categoriesRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log("Database initialized successfully");

    if (process.env.VERCEL) {
      return;
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

startServer();

module.exports = app;
