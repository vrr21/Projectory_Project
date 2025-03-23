import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Обновляем интерфейс JwtPayload, добавляя employeeId
interface JwtPayload {
  userId: number;
  employeeId: number; // Добавляем поле employeeId
  role: string;
}

export const authenticateToken = (requiredRole?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Токен не предоставлен' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey123') as JwtPayload;

      req.user = decoded;

      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ message: 'Доступ запрещен' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Неверный токен' });
    }
  };
};

// Расширяем интерфейс Request, чтобы TypeScript знал о свойстве user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload; // Тип user теперь включает employeeId
    }
  }
}