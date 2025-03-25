// backend/src/middleware/roleMiddleware.ts
import { Request, Response, NextFunction } from 'express';

// Убедимся, что тип Request знает о свойстве user (оно уже расширено в authMiddleware.ts)

export const roleMiddleware = (role: string) => (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== role) {
    res.status(403).json({ message: 'Доступ запрещён' });
    return;
  }
  next();
};