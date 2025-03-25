import { Request, Response, NextFunction } from 'express';
import poolPromise from '../config/db';

export const getEmployeeTaskReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM EmployeeTaskReport');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getEmployeeTaskByPeriod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { startDate, endDate } = req.query;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('startDate', startDate as string)
      .input('endDate', endDate as string)
      .query('SELECT * FROM EmployeeTaskByPeriod WHERE ExecutionDate BETWEEN @startDate AND @endDate');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getTaskListByOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM TaskListByOrder');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};