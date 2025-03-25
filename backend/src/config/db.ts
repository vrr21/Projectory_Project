import { ConnectionPool, config as MSSQLConfig } from 'mssql';
import dotenv from 'dotenv';

// Загружаем переменные окружения из файла .env
dotenv.config();

// Расширяем тип process.env, чтобы TypeScript знал о наших переменных
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_USER: string;
      DB_PASSWORD: string;
      DB_HOST: string;
      DB_PORT: string;
      DB_NAME: string;
      JWT_SECRET: string;
      PORT?: string;
    }
  }
}

// Проверяем, что все необходимые переменные окружения определены
const requiredEnvVars: (keyof NodeJS.ProcessEnv)[] = [
  'DB_USER',
  'DB_PASSWORD',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'JWT_SECRET',
];

// Функция для проверки переменных окружения
const checkEnvVars = (vars: (keyof NodeJS.ProcessEnv)[]): void => {
  for (const envVar of vars) {
    if (!process.env[envVar]) {
      throw new Error(`Environment variable ${String(envVar)} is not defined`);
    }
  }
};

// Вызываем проверку
checkEnvVars(requiredEnvVars);

// Формируем конфигурацию для подключения к базе данных
const dbConfig: MSSQLConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10), // Убедимся, что порт - число
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Создаём пул подключений
const poolPromise = new ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL');
    return pool;
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

export default poolPromise;