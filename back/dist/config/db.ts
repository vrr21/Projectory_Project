import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const dbConfig: sql.config = {
  user: process.env.DB_USER,          // ProssLibrann
  password: process.env.DB_PASSWORD,  // 123456789
  server: process.env.DB_HOST || "localhost", // localhost
  port: parseInt(process.env.DB_PORT || "1433"), // 1433
  database: process.env.DB_NAME,      // KURSACHBD
  options: {
    encrypt: false,                   // Для локального сервера
    trustServerCertificate: true,     // Для обхода проверки сертификата
  },
};

export const connectDB = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    console.log("Connected to SQL Server");
    return pool;
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

export default sql;