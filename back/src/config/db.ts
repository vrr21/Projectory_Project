import dotenv from 'dotenv';
import { config } from 'mssql';

// Загружаем переменные окружения
dotenv.config();

// Проверяем, что все переменные окружения определены
const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_NAME', 'DB_PORT'];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const dbConfig: config = {
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  server: process.env.DB_HOST!,
  database: process.env.DB_NAME!,
  port: parseInt(process.env.DB_PORT!, 10),
  options: {
    encrypt: false, // Для локального сервера
    trustServerCertificate: true, // Для локального сервера
  },
};

export default dbConfig;