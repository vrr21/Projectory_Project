import { Request, Response, RequestHandler } from 'express';
import sql from 'mssql';
import { connectToDb } from '../config/dbPool';

// Получение всех сотрудников
export const getEmployees: RequestHandler = async (req, res, next) => {
  try {
    const pool = await connectToDb();
    const result = await pool.request().query('SELECT * FROM Employee');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Ошибка при получении сотрудников:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получение сотрудника по ID
export const getEmployeeById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(id, 10))
      .query('SELECT * FROM Employee WHERE EmployeeID = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Сотрудник не найден' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Ошибка при получении сотрудника:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Создание нового сотрудника
export const createEmployee: RequestHandler = async (req, res, next) => {
  const { fullName, email, phone, positionId } = req.body;

  try {
    const pool = await connectToDb();
    await pool
      .request()
      .input('fullName', sql.NVarChar, fullName)
      .input('email', sql.NVarChar, email)
      .input('phone', sql.NVarChar, phone)
      .input('positionId', sql.Int, positionId)
      .query(`
        INSERT INTO Employee (FullName, Email, Phone, PositionID)
        VALUES (@fullName, @email, @phone, @positionId)
      `);
    res.status(201).json({ message: 'Сотрудник успешно создан' });
  } catch (error) {
    console.error('Ошибка при создании сотрудника:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновление сотрудника
export const updateEmployee: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  const { fullName, email, phone, positionId } = req.body;

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(id, 10))
      .input('fullName', sql.NVarChar, fullName)
      .input('email', sql.NVarChar, email)
      .input('phone', sql.NVarChar, phone)
      .input('positionId', sql.Int, positionId)
      .query(`
        UPDATE Employee
        SET FullName = @fullName, Email = @email, Phone = @phone, PositionID = @positionId
        WHERE EmployeeID = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Сотрудник не найден' });
    }

    res.status(200).json({ message: 'Сотрудник успешно обновлён' });
  } catch (error) {
    console.error('Ошибка при обновлении сотрудника:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удаление сотрудника
export const deleteEmployee: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(id, 10))
      .query('DELETE FROM Employee WHERE EmployeeID = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Сотрудник не найден' });
    }

    res.status(200).json({ message: 'Сотрудник успешно удалён' });
  } catch (error) {
    console.error('Ошибка при удалении сотрудника:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};