import sql from 'mssql';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

// Проверяем, что все необходимые переменные окружения заданы
const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

const dbConfig: sql.config = {
  user: process.env.DB_USER || 'ProssLibrann',
  password: process.env.DB_PASSWORD || '123456789',
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_NAME || 'DB_PROJECTORY',
  options: {
    encrypt: false, // Для локального SQL Server обычно не требуется шифрование
    trustServerCertificate: true, // Для локального сервера
  },
};

// Логируем конфигурацию для отладки
console.log('Database configuration:', {
  user: dbConfig.user,
  server: dbConfig.server,
  port: dbConfig.port,
  database: dbConfig.database,
});

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('Successfully connected to the database:', dbConfig.database);
    return pool;
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
    console.error('Error details:', err);
    throw err;
  });

export default poolPromise;