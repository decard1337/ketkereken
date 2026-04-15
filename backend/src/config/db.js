import mysql from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
<<<<<<< HEAD
  password: process.env.DB_PASS,
=======
  password: process.env.DB_PASSWORD || "",
>>>>>>> d3fda18727ce8b2d98d799fc65d84bbb28bad97f
  database: process.env.DB_NAME || "ketkereken",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})
