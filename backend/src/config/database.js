const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.DB_HOST || "fintrack-mysql",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "fintrack_user",
  password: process.env.DB_PASSWORD || "userpassword",
  database: process.env.DB_NAME || "fintrack_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000,
};

if (process.env.DB_SSL === "true" || process.env.DB_SSL_CA) {
  dbConfig.ssl = process.env.DB_SSL_CA
    ? { ca: process.env.DB_SSL_CA.replace(/\\n/g, "\n") }
    : { rejectUnauthorized: true };
}

let pool;
let initPromise;

const logDbDiagnostics = (phase, error = null) => {
  const payload = {
    sessionId: "a11bbb",
    runId: "pre-fix",
    hypothesisId: error ? "C" : "A",
    location: "database.js:diagnostics",
    message: phase,
    data: {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      hasSsl: Boolean(dbConfig.ssl),
      isVercel: Boolean(process.env.VERCEL),
      isDockerDefaultHost: dbConfig.host === "fintrack-mysql",
      errorCode: error?.code ?? null,
    },
    timestamp: Date.now(),
  };
  // #region agent log
  console.log("[DEBUG-a11bbb]", JSON.stringify(payload));
  fetch("http://127.0.0.1:7576/ingest/3b1a907b-1e04-4691-a7d8-b3a7596bda96", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "a11bbb",
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
  // #endregion
};

const ensureSchema = async (connection) => {
  const dbName = dbConfig.database;

  const [tables] = await connection.query(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'",
    [dbName],
  );

  if (tables.length > 0) {
    return;
  }

  const initSqlPath = path.join(__dirname, "../../database/init.sql");
  const initSql = fs.readFileSync(initSqlPath, "utf8");

  const statements = initSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .filter((s) => !/^CREATE DATABASE/i.test(s))
    .filter((s) => !/^USE /i.test(s));

  for (const statement of statements) {
    await connection.query(statement);
  }

  console.log("Database schema initialized successfully");
};

const initializeDatabase = async () => {
  if (pool) {
    return pool;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    logDbDiagnostics("database connect attempt");

    if (process.env.VERCEL && dbConfig.host === "fintrack-mysql") {
      const configError = new Error(
        "DB_HOST is not set for Vercel. Use your hosted MySQL hostname, not fintrack-mysql.",
      );
      configError.code = "DB_CONFIG_MISSING";
      throw configError;
    }

    try {
      pool = mysql.createPool(dbConfig);

      const connection = await pool.getConnection();
      console.log("Database connected successfully!");

      await ensureSchema(connection);

      connection.release();

      // #region agent log
      logDbDiagnostics("database connect success");
      // #endregion

      return pool;
    } catch (error) {
      pool = null;
      // #region agent log
      logDbDiagnostics("database connect failed", error);
      // #endregion
      console.error("Database connection failed:", error);
      throw error;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
};

const getPool = () => {
  if (!pool) {
    throw new Error("Database not initialized. Call initializeDatabase first.");
  }
  return pool;
};

module.exports = {
  initializeDatabase,
  getPool,
};
