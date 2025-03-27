import { Request, Response, NextFunction } from 'express';
import poolPromise from '../config/db';

export const getAdminStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;

    const stats = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM TaskExecution) AS TotalTasks,
        (SELECT COUNT(*) FROM Users WHERE Role = 'Сотрудник') AS TotalEmployees,
        (SELECT COUNT(*) FROM Orders) AS TotalOrders,
        (SELECT COUNT(*) FROM TaskExecution WHERE Deadline < GETDATE() AND StatusID != (SELECT StatusID FROM Status WHERE Name = 'Завершено')) AS OverdueTasks
    `);

    res.json(stats.recordset[0]);
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении статистики' });
    next(error);
  }
};

export const getUserTaskReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        UserID,
        FullName,
        CompletedTasks,
        TotalHours
      FROM UserTaskReport
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Ошибка получения отчёта по задачам:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении отчёта по задачам' });
    next(error);
  }
};

export const getUserTaskByPeriod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        UserID,
        FullName,
        ExecutionDate,
        Stage,
        TaskDescription,
        HoursSpent
      FROM UserTaskByPeriod
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Ошибка получения отчёта по периоду:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении отчёта по периоду' });
    next(error);
  }
};