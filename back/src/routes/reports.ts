import { Router } from 'express';
import { getEmployeeTaskReport, getEmployeeTaskByPeriod, getTaskListByOrder } from '../controllers/reportController';

const router = Router();

// Маршруты для отчётов
router.get('/employee-tasks', getEmployeeTaskReport);
router.get('/employee-tasks-period', getEmployeeTaskByPeriod);
router.get('/task-list/:orderId', getTaskListByOrder);

export default router;