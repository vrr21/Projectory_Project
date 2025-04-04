// backend/src/controllers/statsController.ts
import { Request, Response } from 'express';
import poolPromise from '../config/db';

export const getAdminStats = async (req: Request, res: Response) => {
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
  }
};