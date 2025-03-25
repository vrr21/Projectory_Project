import { Request, Response, NextFunction } from 'express';
import poolPromise from '../config/db';
import { Task } from '../types';

export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT te.TaskExecutionID AS id, te.OrderID AS orderId, e.FullName AS assignee, s.Name AS stage, te.ExecutionDate AS createdAt, te.HoursSpent, st.Name AS status
      FROM TaskExecution te
      JOIN Employee e ON te.EmployeeID = e.EmployeeID
      JOIN Stage s ON te.StageID = s.StageID
      JOIN Status st ON te.StatusID = st.StatusID
    `);
    const tasks: Task[] = result.recordset.map((row: any) => ({
      id: row.id,
      title: row.stage,
      description: `Task for order ${row.orderId}`,
      status: row.status,
      assignee: row.assignee,
      createdAt: row.createdAt,
      orderId: row.orderId,
      comments: [], // Комментарии пока не реализованы
    }));
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { orderId, employeeId, stageId, executionDate, hoursSpent, statusId } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('orderId', orderId)
      .input('employeeId', employeeId)
      .input('stageId', stageId)
      .input('executionDate', executionDate)
      .input('hoursSpent', hoursSpent)
      .input('statusId', statusId)
      .query('INSERT INTO TaskExecution (OrderID, EmployeeID, StageID, ExecutionDate, HoursSpent, StatusID) VALUES (@orderId, @employeeId, @stageId, @executionDate, @hoursSpent, @statusId)');
    res.status(201).json({ message: 'Task created' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { orderId, employeeId, stageId, executionDate, hoursSpent, statusId } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', id)
      .input('orderId', orderId)
      .input('employeeId', employeeId)
      .input('stageId', stageId)
      .input('executionDate', executionDate)
      .input('hoursSpent', hoursSpent)
      .input('statusId', statusId)
      .query('UPDATE TaskExecution SET OrderID = @orderId, EmployeeID = @employeeId, StageID = @stageId, ExecutionDate = @executionDate, HoursSpent = @hoursSpent, StatusID = @statusId WHERE TaskExecutionID = @id');
    res.json({ message: 'Task updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', id)
      .query('DELETE FROM TaskExecution WHERE TaskExecutionID = @id');
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};