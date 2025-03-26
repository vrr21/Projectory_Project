// backend/src/routes/tasks.ts
import { Router, Request, Response, NextFunction } from 'express';
import { getUserTasks, createTask, getTasks, getTasksByUser, updateTask, deleteTask } from '../controllers/taskController';
import { authMiddleware } from '../middleware/authMiddleware';

// Обновляем тип ExpressHandler, чтобы он был более гибким
type ExpressHandler<Params = any, ResBody = any, ReqBody = any, ReqQuery = any> = (
  req: Request<Params, ResBody, ReqBody, ReqQuery>,
  res: Response,
  next: NextFunction
) => Promise<void>;

const router = Router();

// Приводим функции к типу ExpressHandler
const getUserTasksHandler: ExpressHandler<{ id: string }> = getUserTasks;
const createTaskHandler: ExpressHandler<{}, any, any> = createTask;
const getTasksHandler: ExpressHandler = getTasks;
const getTasksByUserHandler: ExpressHandler<{ userId: string }> = getTasksByUser;
const updateTaskHandler: ExpressHandler<{ id: string }> = updateTask;
const deleteTaskHandler: ExpressHandler<{ id: string }> = deleteTask;

// Маршруты для задач
router.get('/user/:id', authMiddleware, getUserTasksHandler); // Получение задач пользователя
router.post('/', authMiddleware, createTaskHandler); // Создание задачи
router.get('/', authMiddleware, getTasksHandler); // Получение всех задач
router.get('/user/:userId', authMiddleware, getTasksByUserHandler); // Получение задач по userId
router.put('/:id', authMiddleware, updateTaskHandler); // Обновление задачи
router.delete('/:id', authMiddleware, deleteTaskHandler); // Удаление задачи

export default router;