import { Router, Request, Response, NextFunction } from 'express';
import poolPromise from '../config/db';
import { authMiddleware } from '../middleware/authMiddleware';

// Определяем интерфейсы для типизации данных
interface Task {
  TaskExecutionID: number;
  TaskDescription: string;
  UserName: string;
  Stage: string;
  ExecutionDate: string | null; // Изменено на string | null
  Deadline: string | null;      // Изменено на string | null
  HoursSpent: number;
  Status: string;
  OrderTitle: string;
}

interface User {
  UserID: number;
  FullName: string;
}

interface Status {
  StatusID: number;
  Name: string;
}

interface Order {
  OrderID: number;
  Title: string;
}

interface Stage {
  StageID: number;
  Name: string;
}

// Интерфейс для тела запроса на создание/обновление задачи
interface TaskUpdateRequest {
  orderId: number;
  userId: number;
  stageId: number;
  executionDate: string | null;
  deadline: string | null;
  hoursSpent: number;
  statusId: number;
  description: string;
}

const router = Router();

// Получение всех задач (для администратора)
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

// Получение StatusID по имени статуса
router.get('/status', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const statusName = req.query.name as string;

  if (!statusName) {
    res.status(400).json({ message: 'Не указано имя статуса' });
    return;
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('statusName', statusName)
      .query(`
        SELECT StatusID
        FROM Status
        WHERE Name = @statusName
      `);

    const status: Status | undefined = result.recordset[0];
    if (!status) {
      res.status(404).json({ message: 'Статус не найден' });
      return;
    }

    res.json({ statusId: status.StatusID });
  } catch (error) {
    console.error('Ошибка получения статуса:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении статуса' });
    next(error);
  }
});

// Получение OrderID по названию заказа
router.get('/orders/by-title', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const orderTitle = req.query.title as string;

  if (!orderTitle) {
    res.status(400).json({ message: 'Не указано название заказа' });
    return;
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('orderTitle', orderTitle)
      .query(`
        SELECT OrderID
        FROM Orders
        WHERE Title = @orderTitle
      `);

    const order: Order | undefined = result.recordset[0];
    if (!order) {
      res.status(404).json({ message: 'Заказ не найден' });
      return;
    }

    res.json({ orderId: order.OrderID });
  } catch (error) {
    console.error('Ошибка получения OrderID:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении OrderID' });
    next(error);
  }
});

// Получение StageID по имени этапа
router.get('/stage', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const stageName = req.query.name as string;

  if (!stageName) {
    res.status(400).json({ message: 'Не указано название этапа' });
    return;
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('stageName', stageName)
      .query(`
        SELECT StageID
        FROM Stage
        WHERE Name = @stageName
      `);

    const stage: Stage | undefined = result.recordset[0];
    if (!stage) {
      res.status(404).json({ message: 'Этап не найден' });
      return;
    }

    res.json({ stageId: stage.StageID });
  } catch (error) {
    console.error('Ошибка получения StageID:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении StageID' });
    next(error);
  }
});

// Создание новой задачи
router.post('/', authMiddleware, async (req: Request<{}, {}, TaskUpdateRequest>, res: Response, next: NextFunction): Promise<void> => {
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
router.put('/:id', authMiddleware, async (req: Request<{ id: string }, {}, TaskUpdateRequest>, res: Response, next: NextFunction): Promise<void> => {
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