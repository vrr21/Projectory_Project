// backend/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Расширяем тип Request, чтобы добавить свойство user
declare global {
  namespace Express {
    interface Request {
      user?: { userId: number; role: string };
    }
  }
}

const JWT_SECRET = 'mysecretkey123'; // Должно совпадать с authController.ts

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  console.log('Полученный токен:', token);

  if (!token) {
    console.log('Токен отсутствует');
    res.status(401).json({ message: 'Токен отсутствует' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
    console.log('Токен успешно проверен, декодированные данные:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Ошибка проверки токена:', error);
    res.status(401).json({ message: 'Неверный токен' });
    return;
  }
};