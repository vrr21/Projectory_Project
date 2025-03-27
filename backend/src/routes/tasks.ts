import { Router, Request, Response, NextFunction } from 'express';
import poolPromise from '../config/db';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

interface Task {
  TaskExecutionID: number;
  TaskDescription: string;
  UserName: string;
  Stage: string;
  ExecutionDate: string;
  Deadline: string;
  HoursSpent: number;
  Status: string;
  OrderTitle: string;
}

interface User {
  UserID: number;
  FullName: string;
}

const router = Router();

// Получение всех задач (для администратора)
router.get('/', authMiddleware, roleMiddleware('Администратор'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        TaskExecutionID,
        TaskDescription,
        UserName,
        Stage,
        ExecutionDate,
        Deadline,
        HoursSpent,
        Status,
        OrderTitle
      FROM TaskList
    `);

    const tasks: Task[] = result.recordset;
    res.json(tasks);
  } catch (error) {
    console.error('Ошибка получения задач:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении задач' });
    next(error);
  }
});

// Получение задач для конкретного пользователя
router.get('/user-tasks', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.query.userId as string;

  if (!userId) {
    res.status(400).json({ message: 'Не указан userId' });
    return;
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('userId', parseInt(userId))
      .query(`
        SELECT 
          TaskExecutionID,
          TaskDescription,
          UserName,
          Stage,
          ExecutionDate,
          Deadline,
          HoursSpent,
          Status,
          OrderTitle
        FROM TaskList
        WHERE UserName = (
          SELECT FullName 
          FROM Users 
          WHERE UserID = @userId
        )
      `);

    const tasks: Task[] = result.recordset;
    res.json(tasks);
  } catch (error) {
    console.error('Ошибка получения задач пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении задач пользователя' });
    next(error);
  }
});

// Получение задачи по ID
router.get('/:id', authMiddleware, roleMiddleware('Администратор'), async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
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
        SELECT 
          TaskExecutionID,
          TaskDescription,
          UserName,
          Stage,
          ExecutionDate,
          Deadline,
          HoursSpent,
          Status,
          OrderTitle
        FROM TaskList
        WHERE TaskExecutionID = @taskId
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
router.post('/', authMiddleware, roleMiddleware('Администратор'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { orderId, userId, stageId, executionDate, deadline, hoursSpent, statusId, description } = req.body;

  if (!orderId || !userId || !stageId || !statusId || !description) {
    res.status(400).json({ message: 'Все обязательные поля должны быть заполнены' });
    return;
  }

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('orderId', orderId)
      .input('userId', userId)
      .input('stageId', stageId)
      .input('executionDate', executionDate || null)
      .input('deadline', deadline || null)
      .input('hoursSpent', hoursSpent || 0)
      .input('statusId', statusId)
      .input('description', description)
      .query(`
        INSERT INTO TaskExecution (OrderID, UserID, StageID, ExecutionDate, Deadline, HoursSpent, StatusID, Description)
        VALUES (@orderId, @userId, @stageId, @executionDate, @deadline, @hoursSpent, @statusId, @description)
      `);

    res.status(201).json({ message: 'Задача успешно создана' });
  } catch (error) {
    console.error('Ошибка создания задачи:', error);
    res.status(500).json({ message: 'Ошибка сервера при создании задачи' });
    next(error);
  }
});

// Обновление задачи
router.put('/:id', authMiddleware, roleMiddleware('Администратор'), async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  const taskId = parseInt(req.params.id);
  const { orderId, userId, stageId, executionDate, deadline, hoursSpent, statusId, description } = req.body;

  if (isNaN(taskId)) {
    res.status(400).json({ message: 'Неверный ID задачи' });
    return;
  }

  if (!orderId || !userId || !stageId || !statusId || !description) {
    res.status(400).json({ message: 'Все обязательные поля должны быть заполнены' });
    return;
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('taskId', taskId)
      .query('SELECT * FROM TaskExecution WHERE TaskExecutionID = @taskId');

    const task = result.recordset[0];
    if (!task) {
      res.status(404).json({ message: 'Задача не найдена' });
      return;
    }

    await pool
      .request()
      .input('taskId', taskId)
      .input('orderId', orderId)
      .input('userId', userId)
      .input('stageId', stageId)
      .input('executionDate', executionDate || null)
      .input('deadline', deadline || null)
      .input('hoursSpent', hoursSpent || 0)
      .input('statusId', statusId)
      .input('description', description)
      .query(`
        UPDATE TaskExecution
        SET OrderID = @orderId, UserID = @userId, StageID = @stageId, ExecutionDate = @executionDate, 
            Deadline = @deadline, HoursSpent = @hoursSpent, StatusID = @statusId, Description = @description
        WHERE TaskExecutionID = @taskId
      `);

    res.json({ message: 'Задача успешно обновлена' });
  } catch (error) {
    console.error('Ошибка обновления задачи:', error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении задачи' });
    next(error);
  }
});

// Удаление задачи
router.delete('/:id', authMiddleware, roleMiddleware('Администратор'), async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
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
      .query('SELECT * FROM TaskExecution WHERE TaskExecutionID = @taskId');

    const task = result.recordset[0];
    if (!task) {
      res.status(404).json({ message: 'Задача не найдена' });
      return;
    }

    await pool
      .request()
      .input('taskId', taskId)
      .query('DELETE FROM TaskExecution WHERE TaskExecutionID = @taskId');

    res.json({ message: 'Задача успешно удалена' });
  } catch (error) {
    console.error('Ошибка удаления задачи:', error);
    res.status(500).json({ message: 'Ошибка сервера при удалении задачи' });
    next(error);
  }
});

// Получение списка пользователей для назначения задач
router.get('/users', authMiddleware, roleMiddleware('Администратор'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

// Получение списка заказов для создания задач
router.get('/orders', authMiddleware, roleMiddleware('Администратор'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT OrderID, Title FROM Orders');

    const orders = result.recordset;
    res.json(orders);
  } catch (error) {
    console.error('Ошибка получения списка заказов:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении списка заказов' });
    next(error);
  }
});

// Получение списка этапов для создания задач
router.get('/stages', authMiddleware, roleMiddleware('Администратор'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT StageID, Name FROM Stage');

    const stages = result.recordset;
    res.json(stages);
  } catch (error) {
    console.error('Ошибка получения списка этапов:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении списка этапов' });
    next(error);
  }
});

// Получение списка статусов для создания задач
router.get('/statuses', authMiddleware, roleMiddleware('Администратор'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT StatusID, Name FROM Status');

    const statuses = result.recordset;
    res.json(statuses);
  } catch (error) {
    console.error('Ошибка получения списка статусов:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении списка статусов' });
    next(error);
  }
});

export default router;