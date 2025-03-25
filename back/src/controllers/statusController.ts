import { Request, Response, RequestHandler } from 'express';
import sql from 'mssql';
import { connectToDb } from '../config/dbPool';

// Получение всех статусов
export const getStatuses: RequestHandler = async (req, res, next) => {
  try {
    const pool = await connectToDb();
    const result = await pool.request().query('SELECT * FROM Status');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Ошибка при получении статусов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получение статуса по ID
export const getStatusById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(id, 10))
      .query('SELECT * FROM Status WHERE StatusID = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Статус не найден' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Ошибка при получении статуса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Создание нового статуса
export const createStatus: RequestHandler = async (req, res, next) => {
  const { statusName } = req.body;

  try {
    const pool = await connectToDb();
    await pool
      .request()
      .input('statusName', sql.NVarChar, statusName)
      .query(`
        INSERT INTO Status (StatusName)
        VALUES (@statusName)
      `);
    res.status(201).json({ message: 'Статус успешно создан' });
  } catch (error) {
    console.error('Ошибка при создании статуса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновление статуса
export const updateStatus: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  const { statusName } = req.body;

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(id, 10))
      .input('statusName', sql.NVarChar, statusName)
      .query(`
        UPDATE Status
        SET StatusName = @statusName
        WHERE StatusID = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Статус не найден' });
    }

    res.status(200).json({ message: 'Статус успешно обновлён' });
  } catch (error) {
    console.error('Ошибка при обновлении статуса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удаление статуса
export const deleteStatus: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(id, 10))
      .query('DELETE FROM Status WHERE StatusID = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Статус не найден' });
    }

    res.status(200).json({ message: 'Статус успешно удалён' });
  } catch (error) {
    console.error('Ошибка при удалении статуса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};