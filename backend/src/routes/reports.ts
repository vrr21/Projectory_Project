import { Router } from 'express';
import { getEmployeeTaskReport, getEmployeeTaskByPeriod, getTaskListByOrder } from '../controllers/reportController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/employee-task-report', authMiddleware('Администратор'), getEmployeeTaskReport);
router.get('/employee-task-by-period', authMiddleware('Администратор'), getEmployeeTaskByPeriod);
router.get('/task-list-by-order', authMiddleware('Администратор'), getTaskListByOrder);

export default router;