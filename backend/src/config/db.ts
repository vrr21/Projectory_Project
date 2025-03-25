// backend/src/config/db.ts
import { ConnectionPool } from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

// Отладка: выведем значения переменных окружения
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);

const dbConfig = {
  user: process.env.DB_USER ?? 'default_user',
  password: process.env.DB_PASSWORD ?? 'default_password',
  server: process.env.DB_HOST ?? 'localhost',
  database: process.env.DB_NAME ?? 'default_database',
  port: parseInt(process.env.DB_PORT ?? '1433'),
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const poolPromise = new ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    throw err;
  });

export default poolPromise;