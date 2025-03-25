// backend/src/controllers/orderController.ts
import { RequestHandler } from 'express';
import { IResult } from 'mssql';
import poolPromise from '../config/db';

interface Order {
  OrderID: number;
  Title: string;
  Description: string;
  CreatedAt: Date;
  Deadline: Date;
  StatusID: number;
}

interface CreateOrderRequestBody {
  title: string;
  description: string;
  deadline: string;
}

interface UpdateOrderRequestBody {
  title?: string;
  description?: string;
  deadline?: string;
  statusId?: number;
}

type OrderResponse = Order | { message: string };
type OrdersResponse = Order[] | { message: string };

export const createOrder: RequestHandler<{}, OrderResponse, CreateOrderRequestBody> = async (req, res) => {
  const { title, description, deadline } = req.body;

  if (!title || !deadline) {
    res.status(400).json({ message: 'Название и дедлайн обязательны' });
    return;
  }

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('title', title)
      .input('description', description)
      .input('createdAt', new Date())
      .input('deadline', new Date(deadline))
      .input('statusId', 1) // To Do
      .query(
        'INSERT INTO Orders (Title, Description, CreatedAt, Deadline, StatusID) VALUES (@title, @description, @createdAt, @deadline, @statusId)'
      );

    const result: IResult<Order> = await pool
      .request()
      .query('SELECT TOP 1 * FROM Orders ORDER BY OrderID DESC');

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Ошибка создания заказа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const getOrders: RequestHandler = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result: IResult<Order> = await pool.request().query('SELECT * FROM Orders');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Ошибка получения заказов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const updateOrder: RequestHandler<{ id: string }, OrderResponse, UpdateOrderRequestBody> = async (req, res) => {
  const { id } = req.params;
  const { title, description, deadline, statusId } = req.body;

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('id', parseInt(id))
      .input('title', title)
      .input('description', description)
      .input('deadline', deadline ? new Date(deadline) : null)
      .input('statusId', statusId)
      .query(
        'UPDATE Orders SET Title = COALESCE(@title, Title), Description = COALESCE(@description, Description), Deadline = COALESCE(@deadline, Deadline), StatusID = COALESCE(@statusId, StatusID) WHERE OrderID = @id'
      );

    const result: IResult<Order> = await pool
      .request()
      .input('id', parseInt(id))
      .query('SELECT * FROM Orders WHERE OrderID = @id');

    if (result.recordset.length === 0) {
      res.status(404).json({ message: 'Заказ не найден' });
      return;
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Ошибка обновления заказа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const deleteOrder: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', parseInt(id))
      .query('DELETE FROM Orders WHERE OrderID = @id');

    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: 'Заказ не найден' });
      return;
    }

    res.status(200).json({ message: 'Заказ удалён' });
  } catch (error) {
    console.error('Ошибка удаления заказа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};