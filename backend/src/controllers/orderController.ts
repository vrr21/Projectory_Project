import { Request, Response, NextFunction } from 'express';
import poolPromise from '../config/db';

export const getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM CustomerOrder');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { customerId, orderTypeId, orderDate, description, statusId } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('customerId', customerId)
      .input('orderTypeId', orderTypeId)
      .input('orderDate', orderDate)
      .input('description', description)
      .input('statusId', statusId)
      .query('INSERT INTO CustomerOrder (CustomerID, OrderTypeID, OrderDate, Description, StatusID) VALUES (@customerId, @orderTypeId, @orderDate, @description, @statusId)');
    res.status(201).json({ message: 'Order created' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { customerId, orderTypeId, orderDate, description, statusId } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', id)
      .input('customerId', customerId)
      .input('orderTypeId', orderTypeId)
      .input('orderDate', orderDate)
      .input('description', description)
      .input('statusId', statusId)
      .query('UPDATE CustomerOrder SET CustomerID = @customerId, OrderTypeID = @orderTypeId, OrderDate = @orderDate, Description = @description, StatusID = @statusId WHERE OrderID = @id');
    res.json({ message: 'Order updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', id)
      .query('DELETE FROM CustomerOrder WHERE OrderID = @id');
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};