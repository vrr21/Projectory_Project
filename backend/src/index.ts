import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import employeeRoutes from './routes/employees';
import orderRoutes from './routes/orders';
import reportRoutes from './routes/reports';
import stageRoutes from './routes/stages';
import statusRoutes from './routes/statuses';
import taskRoutes from './routes/tasks';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/stages', stageRoutes);
app.use('/api/statuses', statusRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});