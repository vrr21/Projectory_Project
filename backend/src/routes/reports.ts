// backend/src/routes/reports.ts
import { Router, Request, Response, NextFunction } from 'express';
import { getAdminStats, getUserTaskReport, getUserTaskByPeriod } from '../controllers/reportController';
import { authMiddleware } from '../middleware/authMiddleware';

// Явно определяем тип обработчика маршрутов
type ExpressHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const router = Router();

// Приводим функции к типу ExpressHandler
const getAdminStatsHandler: ExpressHandler = getAdminStats;
const getUserTaskReportHandler: ExpressHandler = getUserTaskReport;
const getUserTaskByPeriodHandler: ExpressHandler = getUserTaskByPeriod;

// Маршруты для отчётов
router.get('/admin-stats', authMiddleware, getAdminStatsHandler);
router.get('/user-task-report', authMiddleware, getUserTaskReportHandler);
router.get('/user-task-by-period', authMiddleware, getUserTaskByPeriodHandler);

export default router;