import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import employeeRoutes from './routes/employees';
import orderRoutes from './routes/orders';
import reportRoutes from './routes/reports';
import stageRoutes from './routes/stages';
import statusRoutes from './routes/statuses';
import taskRoutes from './routes/tasks';
import { closeDbPool } from './config/dbPool';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Подключаем маршруты
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/stages', stageRoutes);
app.use('/api/statuses', statusRoutes);
app.use('/api/tasks', taskRoutes);

const server = app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

// Обработка завершения процесса
process.on('SIGINT', async () => {
  console.log('Завершение работы сервера...');
  await closeDbPool();
  server.close(() => {
    console.log('Сервер остановлен');
    process.exit(0);
  });
});