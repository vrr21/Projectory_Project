// backend/src/routes/tasks.ts
import { Router, Request, Response, NextFunction } from 'express';
import poolPromise from '../config/db';
import { authMiddleware } from '../middleware/authMiddleware';

// Определяем интерфейсы для типизации данных
interface Task {
  TaskID: number;
  Title: string;
  Description: string;
  Status: string;
  Priority: string;
  CreatedBy: number;
  AssignedTo: number;
  CreatedAt: Date;
  UpdatedAt: Date;
  FullName?: string; // Для имени пользователя (при джойне)
}

interface User {
  UserID: number;
  FullName: string;
}

const router = Router();

// Получение всех задач
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT t.*, u.FullName 
      FROM Tasks t
      LEFT JOIN Users u ON t.AssignedTo = u.UserID
    `);

    const tasks: Task[] = result.recordset;
    res.json(tasks);
  } catch (error) {
    console.error('Ошибка получения задач:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении задач' });
    next(error);
  }
});

// Получение задачи по ID
router.get('/:id', authMiddleware, async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  const taskId = parseInt(req.params.id);

  if (isNaN(taskId)) {
    res.status(400).json({ message: 'Неверный ID задачи' });
    return;
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('taskId', taskId)
      .query(`
        SELECT t.*, u.FullName 
        FROM Tasks t
        LEFT JOIN Users u ON t.AssignedTo = u.UserID
        WHERE t.TaskID = @taskId
      `);

    const task: Task | undefined = result.recordset[0];
    if (!task) {
      res.status(404).json({ message: 'Задача не найдена' });
      return;
    }

    res.json(task);
  } catch (error) {
    console.error('Ошибка получения задачи:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении задачи' });
    next(error);
  }
});

// Создание новой задачи
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { title, description, status, priority, assignedTo } = req.body;
  const createdBy = req.user?.userId;

  if (!title || !description || !status || !priority || !createdBy) {
    res.status(400).json({ message: 'Все поля обязательны' });
    return;
  }

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('title', title)
      .input('description', description)
      .input('status', status)
      .input('priority', priority)
      .input('createdBy', createdBy)
      .input('assignedTo', assignedTo || null)
      .query(`
        INSERT INTO Tasks (Title, Description, Status, Priority, CreatedBy, AssignedTo, CreatedAt, UpdatedAt)
        VALUES (@title, @description, @status, @priority, @createdBy, @assignedTo, GETDATE(), GETDATE())
      `);

    res.status(201).json({ message: 'Задача успешно создана' });
  } catch (error) {
    console.error('Ошибка создания задачи:', error);
    res.status(500).json({ message: 'Ошибка сервера при создании задачи' });
    next(error);
  }
});

// Обновление задачи
router.put('/:id', authMiddleware, async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  const taskId = parseInt(req.params.id);
  const { title, description, status, priority, assignedTo } = req.body;

  if (isNaN(taskId)) {
    res.status(400).json({ message: 'Неверный ID задачи' });
    return;
  }

  if (!title || !description || !status || !priority) {
    res.status(400).json({ message: 'Все поля обязательны' });
    return;
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('taskId', taskId)
      .query('SELECT * FROM Tasks WHERE TaskID = @taskId');

    const task: Task | undefined = result.recordset[0];
    if (!task) {
      res.status(404).json({ message: 'Задача не найдена' });
      return;
    }

    await pool
      .request()
      .input('taskId', taskId)
      .input('title', title)
      .input('description', description)
      .input('status', status)
      .input('priority', priority)
      .input('assignedTo', assignedTo || null)
      .query(`
        UPDATE Tasks
        SET Title = @title, Description = @description, Status = @status, Priority = @priority, AssignedTo = @assignedTo, UpdatedAt = GETDATE()
        WHERE TaskID = @taskId
      `);

    res.json({ message: 'Задача успешно обновлена' });
  } catch (error) {
    console.error('Ошибка обновления задачи:', error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении задачи' });
    next(error);
  }
});

// Удаление задачи
router.delete('/:id', authMiddleware, async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  const taskId = parseInt(req.params.id);

  if (isNaN(taskId)) {
    res.status(400).json({ message: 'Неверный ID задачи' });
    return;
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('taskId', taskId)
      .query('SELECT * FROM Tasks WHERE TaskID = @taskId');

    const task: Task | undefined = result.recordset[0];
    if (!task) {
      res.status(404).json({ message: 'Задача не найдена' });
      return;
    }

    await pool
      .request()
      .input('taskId', taskId)
      .query('DELETE FROM Tasks WHERE TaskID = @taskId');

    res.json({ message: 'Задача успешно удалена' });
  } catch (error) {
    console.error('Ошибка удаления задачи:', error);
    res.status(500).json({ message: 'Ошибка сервера при удалении задачи' });
    next(error);
  }
});

// Получение списка пользователей для назначения задач
router.get('/users', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT UserID, FullName FROM Users');

    const users: User[] = result.recordset;
    res.json(users);
  } catch (error) {
    console.error('Ошибка получения списка пользователей:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении списка пользователей' });
    next(error);
  }
});

export default router;