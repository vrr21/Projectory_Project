// backend/src/routes/reports.ts
import { Router } from 'express';
import { getAdminStats, getUserTaskReport, getUserTaskByPeriod } from '../controllers/reportController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Маршрут для получения статистики администратора
router.get('/admin-stats', authMiddleware, getAdminStats);

// Другие маршруты для отчётов (предполагаемые, если они есть в вашем проекте)
router.get('/user-task-report', authMiddleware, getUserTaskReport);
router.get('/user-task-by-period', authMiddleware, getUserTaskByPeriod);

export default router;