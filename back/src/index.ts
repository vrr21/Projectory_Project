import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import reportRoutes from './routes/reports';
import { poolPromise } from './config/db';
import { authenticateToken } from './routes/auth';

// Загружаем переменные окружения из .env
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // URL фронтенда
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/reports', reportRoutes);

// Базовый маршрут
app.get('/', (req, res) => {
  res.send('Hello from Projectory backend!');
});

// Маршрут для получения заказов
app.get('/orders', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        co.OrderID,
        co.Description,
        co.OrderDate,
        co.DueDate,
        c.Name AS Customer,
        ot.Name AS OrderType,
        s.Name AS Status
      FROM CustomerOrder co
      JOIN Customer c ON co.CustomerID = c.CustomerID
      JOIN OrderType ot ON co.OrderTypeID = ot.OrderTypeID
      JOIN Status s ON co.StatusID = s.StatusID
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});