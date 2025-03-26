// backend/src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import poolPromise from '../config/db';
import { body, validationResult } from 'express-validator';

const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey123';

export const registerValidation = [
  body('email').isEmail().withMessage('Неверный формат email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль должен быть минимум 6 символов'),
  body('phone').isMobilePhone('any').withMessage('Неверный формат телефона'),
  body('positionId').isInt().withMessage('PositionId должен быть числом'),
  body('fullName').notEmpty().withMessage('Полное имя обязательно'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Неверный формат email'),
  body('password').notEmpty().withMessage('Пароль обязателен'),
];

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: 'Ошибка валидации', errors: errors.array() });
    return;
  }

  const { email, password, phone, positionId, fullName } = req.body;

  try {
    const pool = await poolPromise;
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('authController.ts: Сгенерирован хеш пароля:', hashedPassword);

    console.log('authController.ts: Попытка регистрации:', { email, fullName, phone, positionId });

    const userExists = await pool
      .request()
      .input('email', email)
      .query('SELECT * FROM Users WHERE Email = @email');

    if (userExists.recordset.length > 0) {
      console.log('authController.ts: Пользователь с таким email уже существует:', email);
      res.status(400).json({ message: 'Пользователь с таким email уже существует' });
      return;
    }

    await pool
      .request()
      .input('fullName', fullName)
      .input('email', email)
      .input('password', hashedPassword)
      .input('phone', phone)
      .input('position', positionId)
      .input('role', 'Сотрудник')
      .input('isAdmin', 0)
      .query(
        'INSERT INTO Users (FullName, Email, Password, Phone, PositionID, Role, IsAdmin) VALUES (@fullName, @email, @password, @phone, @position, @role, @isAdmin)'
      );

    console.log('authController.ts: Пользователь успешно добавлен в таблицу Users:', email);

    const newUser = await pool
      .request()
      .input('email', email)
      .query('SELECT UserID, Role FROM Users WHERE Email = @email');

    const user = newUser.recordset[0];
    if (!user) {
      console.log('authController.ts: Не удалось найти нового пользователя:', email);
      res.status(500).json({ message: 'Ошибка при создании пользователя' });
      return;
    }

    const token = jwt.sign({ userId: user.UserID, role: user.Role }, JWT_SECRET, { expiresIn: '1h' });
    console.log('authController.ts: Токен сгенерирован для нового пользователя:', { userId: user.UserID, role: user.Role });

    res.status(201).json({ token, role: user.Role });
  } catch (error) {
    console.error('authController.ts: Ошибка регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: 'Ошибка валидации', errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  try {
    const pool = await poolPromise;
    console.log('authController.ts: Попытка авторизации:', { email, password });

    const result = await pool
      .request()
      .input('email', email)
      .query('SELECT * FROM Users WHERE Email = @email');

    const user = result.recordset[0];
    if (!user) {
      console.log('authController.ts: Пользователь не найден:', email);
      res.status(400).json({ message: 'Неверный email' });
      return;
    }

    console.log('authController.ts: Найденный пользователь:', { userId: user.UserID, email: user.Email, storedHash: user.PlainPassword });

    // const isMatch = await bcrypt.compare(password, user.Password);
    const isMatch = password === user.PlainPassword
    console.log('authController.ts: Результат сравнения пароля:', isMatch);

    if (!isMatch) {
      console.log('authController.ts: Пароль не совпадает для пользователя:', email);
      res.status(400).json({ message: 'Неверный пароль' });
      return;
    }

    const token = jwt.sign({ userId: user.UserID, role: user.Role }, JWT_SECRET, { expiresIn: '1h' });
    console.log('authController.ts: Токен сгенерирован для пользователя:', { userId: user.UserID, role: user.Role });
    res.json({ token, role: user.Role });
  } catch (error) {
    console.error('authController.ts: Ошибка авторизации:', error);
    res.status(500).json({ message: 'Ошибка сервера при авторизации' });
    next(error);
  }
};