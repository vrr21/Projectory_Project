import { Request, Response, RequestHandler } from 'express';
import sql from 'mssql';
import { connectToDb } from '../config/dbPool';

// Получение всех этапов
export const getStages: RequestHandler = async (req, res, next) => {
  try {
    const pool = await connectToDb();
    const result = await pool.request().query('SELECT * FROM Stage');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Ошибка при получении этапов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получение этапа по ID
export const getStageById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(id, 10))
      .query('SELECT * FROM Stage WHERE StageID = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Этап не найден' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Ошибка при получении этапа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Создание нового этапа
export const createStage: RequestHandler = async (req, res, next) => {
  const { stageName, description } = req.body;

  try {
    const pool = await connectToDb();
    await pool
      .request()
      .input('stageName', sql.NVarChar, stageName)
      .input('description', sql.NVarChar, description)
      .query(`
        INSERT INTO Stage (StageName, Description)
        VALUES (@stageName, @description)
      `);
    res.status(201).json({ message: 'Этап успешно создан' });
  } catch (error) {
    console.error('Ошибка при создании этапа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновление этапа
export const updateStage: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  const { stageName, description } = req.body;

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(id, 10))
      .input('stageName', sql.NVarChar, stageName)
      .input('description', sql.NVarChar, description)
      .query(`
        UPDATE Stage
        SET StageName = @stageName, Description = @description
        WHERE StageID = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Этап не найден' });
    }

    res.status(200).json({ message: 'Этап успешно обновлён' });
  } catch (error) {
    console.error('Ошибка при обновлении этапа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удаление этапа
export const deleteStage: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(id, 10))
      .query('DELETE FROM Stage WHERE StageID = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Этап не найден' });
    }

    res.status(200).json({ message: 'Этап успешно удалён' });
  } catch (error) {
    console.error('Ошибка при удалении этапа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};