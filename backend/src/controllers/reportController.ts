// backend/src/controllers/reportController.ts
import { Request, Response, NextFunction } from 'express';
import poolPromise from '../config/db';

// Расширяем тип Request, чтобы добавить свойство user
declare global {
  namespace Express {
    interface Request {
      user?: { userId: number; role: string };
    }
  }
}

export const getAdminStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;
    console.log('Запрос статистики для администратора:', req.user);

    // Получаем статистику для администратора
    const stats = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM Users WHERE IsAdmin = 1) AS adminCount,
        (SELECT COUNT(*) FROM Users WHERE IsAdmin = 0) AS employeeCount,
        (SELECT COUNT(*) FROM Orders) AS orderCount,
        (SELECT COUNT(*) FROM TaskExecution) AS taskCount,
        (SELECT COUNT(*) FROM TaskExecution WHERE StatusID = (SELECT StatusID FROM Status WHERE Name = 'Завершено')) AS completedTasks
    `);

    console.log('Статистика успешно получена:', stats.recordset[0]);
    res.json(stats.recordset[0]);
  } catch (error) {
    console.error('Ошибка загрузки статистики:', error);
    res.status(500).json({ message: 'Ошибка сервера при загрузке статистики' });
    next(error);
  }
};

// Другие методы контроллера
export const getUserTaskReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM UserTaskReport');
    res.json(result.recordset);
  } catch (error) {
    console.error('Ошибка получения отчёта:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
    next(error);
  }
};

export const getUserTaskByPeriod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM UserTaskByPeriod');
    res.json(result.recordset);
  } catch (error) {
    console.error('Ошибка получения отчёта по периоду:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
    next(error);
  }
};