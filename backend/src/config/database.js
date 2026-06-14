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

const initializeDatabase = async () => {
  try {
    pool = mysql.createPool(dbConfig);

    // Test connection
    const connection = await pool.getConnection();
    console.log("Database connected successfully!");
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
