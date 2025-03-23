import { ConnectionPool } from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  user: process.env.DB_USER || 'ProssLibrann',
  password: process.env.DB_PASSWORD || '123456789',
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME || 'KURSACHBD',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export const poolPromise = new ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL database: KURSACHBD');
    return pool;
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    throw err;
  });