// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import poolPromise from '../config/db';

const JWT_SECRET = 'mysecretkey123'; // Устанавливаем фиксированное значение для отладки

export const register = async (req: Request, res: Response) => {
  const { email, password, phone, position, fullName } = req.body;

  try {
    const pool = await poolPromise;
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Попытка регистрации:', { email, fullName, phone, positionId: position });

    // Проверяем, существует ли пользователь с таким email
    const userExists = await pool
      .request()
      .input('email', email)
      .query('SELECT * FROM Users WHERE Email = @email');

    if (userExists.recordset.length > 0) {
      console.log('Пользователь с таким email уже существует:', email);
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Регистрируем нового пользователя
    await pool
      .request()
      .input('fullName', fullName)
      .input('email', email)
      .input('password', hashedPassword)
      .input('plainPassword', password)
      .input('phone', phone)
      .input('position', position)
      .input('role', 'Сотрудник')
      .input('isAdmin', 0)
      .query(
        'INSERT INTO Users (FullName, Email, Password, PlainPassword, Phone, PositionID, Role, IsAdmin) VALUES (@fullName, @email, @password, @plainPassword, @phone, @position, @role, @isAdmin)'
      );

    console.log('Пользователь успешно добавлен в таблицу Users:', email);

    // Получаем ID нового пользователя
    const newUser = await pool
      .request()
      .input('email', email)
      .query('SELECT UserID, Role FROM Users WHERE Email = @email');

    const user = newUser.recordset[0];
    const token = jwt.sign({ userId: user.UserID, role: user.Role }, JWT_SECRET, { expiresIn: '1h' });
    console.log('Токен сгенерирован для нового пользователя:', token);

    res.status(201).json({ token, role: user.Role });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const pool = await poolPromise;
    console.log('Попытка авторизации:', { email, password });

    const result = await pool
      .request()
      .input('email', email)
      .query('SELECT * FROM Users WHERE Email = @email');

    const user = result.recordset[0];
    if (!user) {
      console.log('Пользователь не найден:', email);
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    console.log('Найденный пользователь:', user);

    // Проверяем пароль
    let isMatch = false;
    if (user.PlainPassword) {
      isMatch = password === user.PlainPassword;
      console.log('Сравнение с PlainPassword:', { isMatch, plainPassword: user.PlainPassword });
    } else {
      isMatch = await bcrypt.compare(password, user.Password);
      console.log('Сравнение с хешем:', { isMatch, hashedPassword: user.Password });
    }

    if (!isMatch) {
      console.log('Пароль не совпадает для пользователя:', email);
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ userId: user.UserID, role: user.Role }, JWT_SECRET, { expiresIn: '1h' });
    console.log('Токен сгенерирован для пользователя:', { email, token });
    res.json({ token, role: user.Role });
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};