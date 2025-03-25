import { Request, Response, NextFunction } from 'express';
import poolPromise from '../config/db';

export const getStatuses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Status');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};