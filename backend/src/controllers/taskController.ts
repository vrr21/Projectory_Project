// backend/src/controllers/taskController.ts
import { RequestHandler } from 'express';
import { IResult } from 'mssql';
import poolPromise from '../config/db';

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

interface CreateTaskRequestBody {
  orderId: number;
  userId: number;
  stageId: number;
  deadline: string;
  hoursSpent: number;
  description: string;
}

interface UpdateTaskRequestBody {
  stageId?: number;
  deadline?: string;
  hoursSpent?: number;
  statusId?: number;
  description?: string;
}

type TaskResponse = Task | { message: string };
type TasksResponse = Task[] | { message: string };

export const createTask: RequestHandler<{}, TaskResponse, CreateTaskRequestBody> = async (req, res) => {
  const { orderId, userId, stageId, deadline, hoursSpent, description } = req.body;

  if (!orderId || !userId || !stageId || !deadline || !hoursSpent || !description) {
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
      .input('statusId', 1) // To Do
      .input('description', description)
      .query(
        'INSERT INTO TaskExecution (OrderID, UserID, StageID, ExecutionDate, Deadline, HoursSpent, StatusID, Description) VALUES (@orderId, @userId, @stageId, @executionDate, @deadline, @hoursSpent, @statusId, @description)'
      );

    const result: IResult<Task> = await pool
      .request()
      .query('SELECT TOP 1 * FROM TaskExecution ORDER BY TaskExecutionID DESC');

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Ошибка создания задачи:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const getTasks: RequestHandler = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result: IResult<Task> = await pool.request().query('SELECT * FROM TaskExecution');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Ошибка получения задач:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const getTasksByUser: RequestHandler<{ userId: string }> = async (req, res) => {
  const { userId } = req.params;

  try {
    const pool = await poolPromise;
    const result: IResult<Task> = await pool
      .request()
      .input('userId', parseInt(userId))
      .query('SELECT * FROM TaskExecution WHERE UserID = @userId');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Ошибка получения задач пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const updateTask: RequestHandler<{ id: string }, TaskResponse, UpdateTaskRequestBody> = async (req, res) => {
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

    const result: IResult<Task> = await pool
      .request()
      .input('id', parseInt(id))
      .query('SELECT * FROM TaskExecution WHERE TaskExecutionID = @id');

    if (result.recordset.length === 0) {
      res.status(404).json({ message: 'Задача не найдена' });
      return;
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Ошибка обновления задачи:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const deleteTask: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', parseInt(id))
      .query('DELETE FROM TaskExecution WHERE TaskExecutionID = @id');

    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: 'Задача не найдена' });
      return;
    }

    res.status(200).json({ message: 'Задача удалена' });
  } catch (error) {
    console.error('Ошибка удаления задачи:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};