// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import reportsRoutes from './routes/reports';
import tasksRoutes from './routes/tasks';
import ordersRoutes from './routes/orders';
import commentsRoutes from './routes/comments';
import poolPromise from './config/db';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/comments', commentsRoutes);

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