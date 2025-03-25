import { Request, Response, RequestHandler } from 'express';
import sql from 'mssql';
import { connectToDb } from '../config/dbPool';

// Получение отчёта о задачах сотрудников
export const getEmployeeTaskReport: RequestHandler = async (req, res, next) => {
  try {
    const pool = await connectToDb();
    const result = await pool.request().query('SELECT * FROM EmployeeTaskReport');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Ошибка при получении отчёта о задачах сотрудников:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получение отчёта о задачах по периоду
export const getEmployeeTaskByPeriod: RequestHandler = async (req, res, next) => {
  try {
    const pool = await connectToDb();
    const result = await pool.request().query('SELECT * FROM EmployeeTaskByPeriod');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Ошибка при получении отчёта о задачах по периоду:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получение списка задач по заказу
export const getTaskListByOrder: RequestHandler = async (req, res, next) => {
  const { orderId } = req.params;

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input('orderId', sql.Int, parseInt(orderId, 10))
      .query('SELECT * FROM TaskListByOrder WHERE OrderID = @orderId');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Ошибка при получении списка задач по заказу:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};