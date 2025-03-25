// backend/src/routes/reports.ts
import { Router } from 'express';
import { getUserTaskReport, getUserTaskByPeriod, getTaskList, getOrderLifecycle } from '../controllers/reportController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

const router = Router();

router.get('/user-task-report', authMiddleware, roleMiddleware('Администратор'), getUserTaskReport);
router.get('/user-task-by-period', authMiddleware, roleMiddleware('Администратор'), getUserTaskByPeriod);
router.get('/task-list', authMiddleware, getTaskList);
router.get('/order-lifecycle', authMiddleware, getOrderLifecycle);

export default router;