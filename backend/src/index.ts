// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import reportsRoutes from './routes/reports'; // Заменили statsRoutes на reportsRoutes
import poolPromise from './config/db';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Подключаем маршруты
app.use('/auth', authRoutes);
app.use('/reports', reportsRoutes); // Используем reportsRoutes

app.listen(PORT, async () => {
  try {
    const pool = await poolPromise;
    console.log(`Server running on port ${PORT}`);
    console.log('Connected to SQL Server');

    const result = await pool.request().query('SELECT 1 AS test');
    console.log('Database connection test successful:', result);
  } catch (err) {
    console.error('Database connection failed:', err);
  }
});