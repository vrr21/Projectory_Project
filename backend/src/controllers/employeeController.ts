import { Request, Response, NextFunction } from 'express';
import poolPromise from '../config/db';

export const getEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Employee');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { fullName, email, phone, positionId } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('fullName', fullName)
      .input('email', email)
      .input('phone', phone)
      .input('positionId', positionId)
      .query('INSERT INTO Employee (FullName, Email, Phone, PositionID) VALUES (@fullName, @email, @phone, @positionId)');
    res.status(201).json({ message: 'Employee created' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { fullName, email, phone, positionId } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', id)
      .input('fullName', fullName)
      .input('email', email)
      .input('phone', phone)
      .input('positionId', positionId)
      .query('UPDATE Employee SET FullName = @fullName, Email = @email, Phone = @phone, PositionID = @positionId WHERE EmployeeID = @id');
    res.json({ message: 'Employee updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', id)
      .query('DELETE FROM Employee WHERE EmployeeID = @id');
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};