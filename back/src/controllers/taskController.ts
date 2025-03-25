import { Request, Response, RequestHandler } from 'express';
import sql from 'mssql';
import { connectToDb } from '../config/dbPool';

// Получение всех задач
export const getTasks: RequestHandler = async (req, res, next) => {
  try {
    const pool = await connectToDb();
    const result = await pool.request().query('SELECT * FROM Task');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Ошибка при получении задач:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получение задачи по ID
export const getTaskById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(id, 10))
      .query('SELECT * FROM Task WHERE TaskID = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Ошибка при получении задачи:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Создание новой задачи
export const createTask: RequestHandler = async (req, res, next) => {
  const { orderId, employeeId, stageId, description, startDate, endDate, statusId } = req.body;

  try {
    const pool = await connectToDb();
    await pool
      .request()
      .input('orderId', sql.Int, orderId)
      .input('employeeId', sql.Int, employeeId)
      .input('stageId', sql.Int, stageId)
      .input('description', sql.NVarChar, description)
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .input('statusId', sql.Int, statusId)
      .query(`
        INSERT INTO Task (OrderID, EmployeeID, StageID, Description, StartDate, EndDate, StatusID)
        VALUES (@orderId, @employeeId, @stageId, @description, @startDate, @endDate, @statusId)
      `);
    res.status(201).json({ message: 'Задача успешно создана' });
  } catch (error) {
    console.error('Ошибка при создании задачи:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновление задачи
export const updateTask: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  const { orderId, employeeId, stageId, description, startDate, endDate, statusId } = req.body;

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(id, 10))
      .input('orderId', sql.Int, orderId)
      .input('employeeId', sql.Int, employeeId)
      .input('stageId', sql.Int, stageId)
      .input('description', sql.NVarChar, description)
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .input('statusId', sql.Int, statusId)
      .query(`
        UPDATE Task
        SET OrderID = @orderId, EmployeeID = @employeeId, StageID = @stageId,
            Description = @description, StartDate = @startDate, EndDate = @endDate, StatusID = @statusId
        WHERE TaskID = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    res.status(200).json({ message: 'Задача успешно обновлена' });
  } catch (error) {
    console.error('Ошибка при обновлении задачи:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удаление задачи
export const deleteTask: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(id, 10))
      .query('DELETE FROM Task WHERE TaskID = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    res.status(200).json({ message: 'Задача успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении задачи:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};