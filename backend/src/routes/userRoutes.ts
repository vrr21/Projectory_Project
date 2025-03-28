import { Request, Response } from 'express';
import poolPromise from '../config/db';

// Расширяем тип Request для добавления user
declare module 'express-serve-static-core' {
  interface Request {
    user?: { userId: string; role: string };
  }
}

interface Employee {
  UserID: number;
  FullName: string;
  Email: string;
  Phone: string;
  PositionName: string;
}

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        u.UserID,
        u.FullName,
        u.Email,
        u.Phone,
        p.Name AS PositionName
      FROM Users u
      JOIN Position p ON u.PositionID = p.PositionID
      WHERE u.Role = 'Сотрудник';
    `);

    const employees: Employee[] = result.recordset;
    console.log('userController.ts: Сотрудники:', employees);

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Сотрудники не найдены' });
    }

    res.json(employees);
  } catch (error) {
    console.error('userController.ts: Ошибка при получении сотрудников:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении сотрудников' });
  }
};