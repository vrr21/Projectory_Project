import { Request, Response, NextFunction } from 'express';
import poolPromise from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult, ValidationChain } from 'express-validator';

// Валидация для регистрации
export const registerValidation: ValidationChain[] = [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов'),
  body('fullName').notEmpty().withMessage('Полное имя обязательно'),
  body('phone').optional().isMobilePhone('any').withMessage('Некорректный номер телефона'),
  body('positionId').optional().isInt().withMessage('Некорректный ID должности'),
  body('role').optional().isString().withMessage('Некорректная роль'),
];

// Функция регистрации
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password, fullName, phone, positionId, role } = req.body;

  try {
    const pool = await poolPromise;

    // Проверяем, существует ли пользователь с таким email
    const existingUser = await pool
      .request()
      .input('email', email)
      .query('SELECT * FROM Users WHERE Email = @email');

    if (existingUser.recordset.length > 0) {
      res.status(400).json({ message: 'Пользователь с таким email уже существует' });
      return;
    }

    // Создаём запись в таблице Employee
    const employeeResult = await pool
      .request()
      .input('fullName', fullName)
      .input('email', email)
      .input('phone', phone || null) // Если phone не передан, используем null
      .input('positionId', positionId || 2) // По умолчанию ID должности = 2 (Сотрудник)
      .query(
        'INSERT INTO Employee (FullName, Email, Phone, PositionID) OUTPUT INSERTED.EmployeeID VALUES (@fullName, @email, @phone, @positionId)'
      );

    const employeeId = employeeResult.recordset[0].EmployeeID;

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Определяем роль и статус администратора
    const userRole = role || 'Сотрудник'; // По умолчанию "Сотрудник"
    const isAdmin = userRole === 'Администратор' ? 1 : 0;

    // Создаём запись в таблице Users
    await pool
      .request()
      .input('employeeId', employeeId)
      .input('email', email)
      .input('password', hashedPassword)
      .input('isAdmin', isAdmin)
      .input('role', userRole)
      .query(
        'INSERT INTO Users (EmployeeID, Email, Password, IsAdmin, Role) VALUES (@employeeId, @email, @password, @isAdmin, @role)'
      );

    // Генерируем JWT-токен
    const token = jwt.sign(
      { employeeId, role: userRole },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Возвращаем токен и роль
    res.status(201).json({ token, role: userRole });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
};

// Валидация для входа
export const loginValidation: ValidationChain[] = [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').notEmpty().withMessage('Пароль обязателен'),
];

// Функция входа
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  try {
    const pool = await poolPromise;

    // Ищем пользователя по email
    const userResult = await pool
      .request()
      .input('email', email)
      .query('SELECT * FROM Users WHERE Email = @email');

    if (userResult.recordset.length === 0) {
      res.status(400).json({ message: 'Неверные учетные данные' });
      return;
    }

    const user = userResult.recordset[0];

    // Проверяем пароль
    const isMatch = await bcrypt.compare(password, user.Password);

    if (!isMatch) {
      res.status(400).json({ message: 'Неверные учетные данные' });
      return;
    }

    // Генерируем JWT-токен
    const token = jwt.sign(
      { employeeId: user.EmployeeID, role: user.Role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Возвращаем токен и роль
    res.json({ token, role: user.Role });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
};