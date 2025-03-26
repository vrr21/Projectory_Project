// backend/src/config/db.ts
import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig: sql.config = {
  user: process.env.DB_USER || 'ProssLibrann',
  password: process.env.DB_PASSWORD || '123456789',
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_NAME || 'DB_PROJECTORY',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('Successfully connected to the database:', dbConfig.database);
    return pool;
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    throw err;
  });

export default poolPromise;