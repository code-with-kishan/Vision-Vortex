// This file just creates one connection pool to MySQL and shares it
// with the rest of the app. Using a "pool" instead of a single
// connection means multiple requests can use the database at the
// same time without waiting for each other.

const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "vision_vortex_farm",
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
