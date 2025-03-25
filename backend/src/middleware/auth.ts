import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { DecodedToken } from '../types';

export const authMiddleware = (requiredRole?: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
      (req as any).user = decoded;

      if (requiredRole && decoded.role !== requiredRole) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }

      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
  };
};