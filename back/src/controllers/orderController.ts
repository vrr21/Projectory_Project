import { Request, Response, RequestHandler } from 'express';
import sql from 'mssql';
import { connectToDb } from '../config/dbPool';

// Получение всех заказов
export const getOrders: RequestHandler = async (req, res, next) => {
  try {
    const pool = await connectToDb();
    const result = await pool.request().query('SELECT * FROM CustomerOrder');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получение заказа по ID
export const getOrderById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(id, 10))
      .query('SELECT * FROM CustomerOrder WHERE OrderID = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Ошибка при получении заказа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Создание нового заказа
export const createOrder: RequestHandler = async (req, res, next) => {
  const { customerId, orderTypeId, orderDate, description, statusId } = req.body;

  try {
    const pool = await connectToDb();
    await pool
      .request()
      .input('customerId', sql.Int, customerId)
      .input('orderTypeId', sql.Int, orderTypeId)
      .input('orderDate', sql.Date, orderDate)
      .input('description', sql.NVarChar, description)
      .input('statusId', sql.Int, statusId)
      .query(`
        INSERT INTO CustomerOrder (CustomerID, OrderTypeID, OrderDate, Description, StatusID)
        VALUES (@customerId, @orderTypeId, @orderDate, @description, @statusId)
      `);
    res.status(201).json({ message: 'Заказ успешно создан' });
  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновление заказа
export const updateOrder: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  const { customerId, orderTypeId, orderDate, description, statusId } = req.body;

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(id, 10))
      .input('customerId', sql.Int, customerId)
      .input('orderTypeId', sql.Int, orderTypeId)
      .input('orderDate', sql.Date, orderDate)
      .input('description', sql.NVarChar, description)
      .input('statusId', sql.Int, statusId)
      .query(`
        UPDATE CustomerOrder
        SET CustomerID = @customerId, OrderTypeID = @orderTypeId, OrderDate = @orderDate,
            Description = @description, StatusID = @statusId
        WHERE OrderID = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    res.status(200).json({ message: 'Заказ успешно обновлён' });
  } catch (error) {
    console.error('Ошибка при обновлении заказа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удаление заказа
export const deleteOrder: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(id, 10))
      .query('DELETE FROM CustomerOrder WHERE OrderID = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    res.status(200).json({ message: 'Заказ успешно удалён' });
  } catch (error) {
    console.error('Ошибка при удалении заказа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};