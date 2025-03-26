// backend/src/routes/authRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { register, login, registerValidation, loginValidation } from '../controllers/authController';
import bcrypt from 'bcryptjs';
import poolPromise from '../config/db';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// backend/src/routes/authRoutes.ts (фрагмент)
router.post('/create-admin', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;
    const hashedPassword = await bcrypt.hash('admin123', 12);

    await pool
      .request()
      .input('fullName', 'Admin User')
      .input('email', 'admin@gmail.com')
      .input('password', hashedPassword)
      .input('phone', '+1234567890')
      .input('position', 1)
      .input('role', 'Администратор')
      .input('isAdmin', 1)
      .query(
        'INSERT INTO Users (FullName, Email, Password, Phone, PositionID, Role, IsAdmin) VALUES (@fullName, @email, @password, @phone, @position, @role, @isAdmin)'
      );

    res.status(201).json({ message: 'Администратор создан' });
  } catch (error) {
    console.error('Ошибка создания администратора:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
    next(error);
  }
});

export default router;