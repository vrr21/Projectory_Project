// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import ordersRoutes from './routes/orders';
import tasksRoutes from './routes/tasks';
import commentsRoutes from './routes/comments';
import reportsRoutes from './routes/reports';
import poolPromise from './config/db';

const app = express();

app.use(cors());
app.use(express.json());

// Подключение маршрутов
app.use('/auth', authRoutes);
app.use('/orders', ordersRoutes);
app.use('/tasks', tasksRoutes);
app.use('/comments', commentsRoutes);
app.use('/reports', reportsRoutes);

// Тест подключения к базе данных
poolPromise
  .then(pool => {
    console.log('Connected to SQL Server');
    return pool.request().query('SELECT 1 as test');
  })
  .then(result => {
    console.log('Database connection test successful:', result);
  })
  .catch(err => {
    console.error('Database connection test failed:', err);
  });

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});