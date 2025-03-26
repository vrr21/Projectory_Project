// backend/src/controllers/taskController.ts
import { Request, Response, NextFunction } from 'express';
import poolPromise from '../config/db';

// Интерфейс для задачи (на основе структуры базы данных)
interface Task {
  TaskExecutionID: number;
  OrderID: number;
  UserID: number;
  StageID: number;
  ExecutionDate: Date;
  Deadline: Date;
  HoursSpent: number;
  StatusID: number;
  Description: string;
}

// Интерфейс для ответа в `getUserTasks`, который используется в `EmployeeDashboard.tsx`
interface TaskResponseForUser {
  key: string;
  task: string;
  status: string;
  deadline: string;
  hours: number;
  type: string;
}

// Интерфейс для тела запроса на создание задачи
interface CreateTaskRequestBody {
  orderId: number;
  userId: number;
  stageId: number;
  deadline: string;
  hoursSpent: number;
  description: string;
}

// Интерфейс для тела запроса на обновление задачи
interface UpdateTaskRequestBody {
  stageId?: number;
  deadline?: string;
  hoursSpent?: number;
  statusId?: number;
  description?: string;
}

// Типы для ответов
type TaskResponse = Task | { message: string };
type TasksResponse = Task[] | { message: string };
type UserTasksResponse = TaskResponseForUser[] | { message: string };

// Метод для создания задачи
export const createTask = async (req: Request<{}, TaskResponse, CreateTaskRequestBody>, res: Response, next: NextFunction): Promise<void> => {
  const { orderId, userId, stageId, deadline, hoursSpent, description } = req.body;

  if (!orderId || !userId || !stageId || !deadline || !hoursSpent || !description) {
    console.log('Ошибка: не все поля заполнены', req.body);
    res.status(400).json({ message: 'Все поля обязательны' });
    return;
  }

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('orderId', orderId)
      .input('userId', userId)
      .input('stageId', stageId)
      .input('executionDate', new Date())
      .input('deadline', new Date(deadline))
      .input('hoursSpent', hoursSpent)
      .input('statusId', 1) // To Do (предполагается, что StatusID = 1 соответствует статусу "To Do")
      .input('description', description)
      .query(
        'INSERT INTO TaskExecution (OrderID, UserID, StageID, ExecutionDate, Deadline, HoursSpent, StatusID, Description) VALUES (@orderId, @userId, @stageId, @executionDate, @deadline, @hoursSpent, @statusId, @description)'
      );

    const result = await pool
      .request()
      .query('SELECT TOP 1 * FROM TaskExecution ORDER BY TaskExecutionID DESC');

    console.log('Задача успешно создана:', result.recordset[0]);
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Ошибка создания задачи:', error);
    res.status(500).json({ message: 'Ошибка сервера при создании задачи' });
    next(error);
  }
};

// Метод для получения всех задач
export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM TaskExecution');
    console.log('Все задачи успешно получены:', result.recordset);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Ошибка получения задач:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении задач' });
    next(error);
  }
};

// Метод для получения задач пользователя (по UserID)
export const getTasksByUser = async (req: Request<{ userId: string }>, res: Response, next: NextFunction): Promise<void> => {
  const { userId } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('userId', parseInt(userId))
      .query('SELECT * FROM TaskExecution WHERE UserID = @userId');

    console.log(`Задачи для пользователя ${userId} успешно получены:`, result.recordset);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Ошибка получения задач пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении задач пользователя' });
    next(error);
  }
};

// Метод для получения задач пользователя (форматированный ответ для фронтенда)
export const getUserTasks = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id;
    const pool = await poolPromise;

    console.log(`Запрос задач для пользователя с ID: ${userId}`);

    const result = await pool
      .request()
      .input('userId', parseInt(userId))
      .query(`
        SELECT 
          TaskExecution.TaskExecutionID AS key,
          Tasks.Name AS task,
          Status.Name AS status,
          TaskExecution.Deadline AS deadline,
          TaskExecution.HoursSpent AS hours,
          TaskTypes.Name AS type
        FROM TaskExecution
        JOIN Tasks ON TaskExecution.TaskID = Tasks.TaskID
        JOIN Status ON TaskExecution.StatusID = Status.StatusID
        JOIN TaskTypes ON Tasks.TaskTypeID = TaskTypes.TaskTypeID
        WHERE TaskExecution.UserID = @userId
      `);

    console.log('Задачи успешно получены:', result.recordset);
    res.json(result.recordset);
  } catch (error) {
    console.error('Ошибка получения задач:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении задач' });
    next(error);
  }
};

// Метод для обновления задачи
export const updateTask = async (req: Request<{ id: string }, TaskResponse, UpdateTaskRequestBody>, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { stageId, deadline, hoursSpent, statusId, description } = req.body;

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('id', parseInt(id))
      .input('stageId', stageId)
      .input('deadline', deadline ? new Date(deadline) : null)
      .input('hoursSpent', hoursSpent)
      .input('statusId', statusId)
      .input('description', description)
      .query(
        'UPDATE TaskExecution SET StageID = COALESCE(@stageId, StageID), Deadline = COALESCE(@deadline, Deadline), HoursSpent = COALESCE(@hoursSpent, HoursSpent), StatusID = COALESCE(@statusId, StatusID), Description = COALESCE(@description, Description) WHERE TaskExecutionID = @id'
      );

    const result = await pool
      .request()
      .input('id', parseInt(id))
      .query('SELECT * FROM TaskExecution WHERE TaskExecutionID = @id');

    if (result.recordset.length === 0) {
      console.log(`Задача с ID ${id} не найдена`);
      res.status(404).json({ message: 'Задача не найдена' });
      return;
    }

    console.log('Задача успешно обновлена:', result.recordset[0]);
    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Ошибка обновления задачи:', error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении задачи' });
    next(error);
  }
};

// Метод для удаления задачи
export const deleteTask = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', parseInt(id))
      .query('DELETE FROM TaskExecution WHERE TaskExecutionID = @id');

    if (result.rowsAffected[0] === 0) {
      console.log(`Задача с ID ${id} не найдена`);
      res.status(404).json({ message: 'Задача не найдена' });
      return;
    }

    console.log(`Задача с ID ${id} успешно удалена`);
    res.status(200).json({ message: 'Задача удалена' });
  } catch (error) {
    console.error('Ошибка удаления задачи:', error);
    res.status(500).json({ message: 'Ошибка сервера при удалении задачи' });
    next(error);
  }
};