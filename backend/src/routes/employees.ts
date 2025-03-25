import { Router } from 'express';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../controllers/employeeController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware('Администратор'), getEmployees);
router.post('/', authMiddleware('Администратор'), createEmployee);
router.put('/:id', authMiddleware('Администратор'), updateEmployee);
router.delete('/:id', authMiddleware('Администратор'), deleteEmployee);

export default router;