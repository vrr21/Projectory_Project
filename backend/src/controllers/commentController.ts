// backend/src/controllers/commentController.ts
import { RequestHandler } from 'express';
import { IResult } from 'mssql';
import poolPromise from '../config/db';

interface Comment {
  CommentID: number;
  TaskExecutionID: number;
  Text: string;
  AuthorID: number;
  CreatedAt: Date;
}

interface CreateCommentRequestBody {
  taskExecutionId: number;
  text: string;
  authorId: number;
}

type CommentResponse = Comment | { message: string };
type CommentsResponse = Comment[] | { message: string };

export const createComment: RequestHandler<{}, CommentResponse, CreateCommentRequestBody> = async (req, res) => {
  const { taskExecutionId, text, authorId } = req.body;

  if (!taskExecutionId || !text || !authorId) {
    res.status(400).json({ message: 'Все поля обязательны' });
    return;
  }

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('taskExecutionId', taskExecutionId)
      .input('text', text)
      .input('authorId', authorId)
      .input('createdAt', new Date())
      .query(
        'INSERT INTO Comments (TaskExecutionID, Text, AuthorID, CreatedAt) VALUES (@taskExecutionId, @text, @authorId, @createdAt)'
      );

    const result: IResult<Comment> = await pool
      .request()
      .query('SELECT TOP 1 * FROM Comments ORDER BY CommentID DESC');

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Ошибка создания комментария:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const getCommentsByTask: RequestHandler<{ taskId: string }> = async (req, res) => {
  const { taskId } = req.params;

  try {
    const pool = await poolPromise;
    const result: IResult<Comment> = await pool
      .request()
      .input('taskId', parseInt(taskId))
      .query('SELECT * FROM Comments WHERE TaskExecutionID = @taskId');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Ошибка получения комментариев:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const deleteComment: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', parseInt(id))
      .query('DELETE FROM Comments WHERE CommentID = @id');

    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: 'Комментарий не найден' });
      return;
    }

    res.status(200).json({ message: 'Комментарий удалён' });
  } catch (error) {
    console.error('Ошибка удаления комментария:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};