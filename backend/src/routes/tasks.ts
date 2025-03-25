import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware(), getTasks);
router.post('/', authMiddleware('Администратор'), createTask);
router.put('/:id', authMiddleware('Администратор'), updateTask);
router.delete('/:id', authMiddleware('Администратор'), deleteTask);

export default router;