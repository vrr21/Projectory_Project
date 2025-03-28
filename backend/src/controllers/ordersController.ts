import { Request, Response } from 'express';
import poolPromise from '../config/db';

// Расширяем тип Request для добавления user
declare module 'express-serve-static-core' {
  interface Request {
    user?: { userId: string; role: string };
  }
}

interface Order {
  OrderID: number;
  Title: string;
  Description: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export const createOrder = async (req: Request, res: Response) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Не указаны title или description' });
  }

  try {
    const pool = await poolPromise;
    const createdAt = new Date().toISOString().split('T')[0]; // Формат YYYY-MM-DD
    const updatedAt = createdAt;

    const result = await pool
      .request()
      .input('title', title)
      .input('description', description)
      .input('createdAt', createdAt)
      .input('updatedAt', updatedAt)
      .query(
        'INSERT INTO Orders (Title, Description, CreatedAt, UpdatedAt) OUTPUT INSERTED.OrderID VALUES (@title, @description, @createdAt, @updatedAt)'
      );

    const newOrderId = result.recordset[0].OrderID;
    res.status(201).json({ message: 'Заказ создан', orderId: newOrderId });
  } catch (error) {
    console.error('ordersController.ts: Ошибка при создании заказа:', error);
    res.status(500).json({ message: 'Ошибка сервера при создании заказа' });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Orders');

    const orders: Order[] = result.recordset;
    res.json(orders);
  } catch (error) {
    console.error('ordersController.ts: Ошибка при получении заказов:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении заказов' });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Не указаны title или description' });
  }

  try {
    const pool = await poolPromise;
    const updatedAt = new Date().toISOString().split('T')[0]; // Формат YYYY-MM-DD

    const result = await pool
      .request()
      .input('id', id)
      .input('title', title)
      .input('description', description)
      .input('updatedAt', updatedAt)
      .query(
        'UPDATE Orders SET Title = @title, Description = @description, UpdatedAt = @updatedAt WHERE OrderID = @id'
      );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    res.json({ message: 'Заказ обновлён' });
  } catch (error) {
    console.error('ordersController.ts: Ошибка при обновлении заказа:', error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении заказа' });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input('id', id)
      .query('DELETE FROM Orders WHERE OrderID = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    res.json({ message: 'Заказ удалён' });
  } catch (error) {
    console.error('ordersController.ts: Ошибка при удалении заказа:', error);
    res.status(500).json({ message: 'Ошибка сервера при удалении заказа' });
  }
};