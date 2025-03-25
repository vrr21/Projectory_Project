import sql, { ConnectionPool } from 'mssql';
import dbConfig from './db';

let pool: ConnectionPool | null = null;

export const connectToDb = async (): Promise<ConnectionPool> => {
  if (pool && pool.connected) {
    return pool;
  }

  try {
    pool = await sql.connect(dbConfig);
    console.log('Подключение к базе данных успешно установлено');
    return pool;
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error);
    throw error;
  }
};

export const closeDbPool = async () => {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('Пул соединений закрыт');
  }
};