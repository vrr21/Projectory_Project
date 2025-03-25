// backend/src/routes/tasks.ts
import { Router } from 'express';
import { createTask, getTasks, getTasksByUser, updateTask, deleteTask } from '../controllers/taskController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

const router = Router();

router.post('/', authMiddleware, roleMiddleware('Администратор'), createTask);
router.get('/', authMiddleware, getTasks);
router.get('/user/:userId', authMiddleware, getTasksByUser);
router.put('/:id', authMiddleware, updateTask);
router.delete('/:id', authMiddleware, roleMiddleware('Администратор'), deleteTask);

export default router;