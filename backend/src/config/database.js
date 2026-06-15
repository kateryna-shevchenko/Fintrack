const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.DB_HOST || "fintrack-mysql",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "fintrack_user",
  password: process.env.DB_PASSWORD || "userpassword",
  database: process.env.DB_NAME || "fintrack_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

if (process.env.DB_SSL_CA) {
  dbConfig.ssl = {
    ca: process.env.DB_SSL_CA.replace(/\\n/g, "\n"),
  };
}

let pool;

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
  try {
    pool = mysql.createPool(dbConfig);

    const connection = await pool.getConnection();
    console.log("Database connected successfully!");

    await ensureSchema(connection);

    connection.release();

    return pool;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
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
