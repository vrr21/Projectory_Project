import { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from 'mssql';
import { connectToDb } from '../config/dbPool';

const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey123';

// Регистрация пользователя
export const register: RequestHandler = async (req, res, next) => {
  const { fullName, email, password, phone, positionId } = req.body;

  try {
    const pool = await connectToDb();
    const emailCheck = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Employee WHERE Email = @email');

    if (emailCheck.recordset.length > 0) {
      return res.status(400).json({ message: 'Email уже зарегистрирован' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.request()
      .input('fullName', sql.NVarChar, fullName)
      .input('email', sql.NVarChar, email)
      .input('phone', sql.NVarChar, phone)
      .input('positionId', sql.Int, positionId)
      .query(`
        INSERT INTO Employee (FullName, Email, Phone, PositionID)
        VALUES (@fullName, @email, @phone, @positionId)
      `);

    const employeeResult = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT EmployeeID FROM Employee WHERE Email = @email');
    const employeeId = employeeResult.recordset[0].EmployeeID;

    await pool.request()
      .input('employeeId', sql.Int, employeeId)
      .input('email', sql.NVarChar, email)
      .input('hashedPassword', sql.NVarChar, hashedPassword)
      .query(`
        INSERT INTO Users (EmployeeID, Email, Password, IsAdmin, Role)
        VALUES (@employeeId, @email, @hashedPassword, 0, 'Сотрудник')
      `);

    res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Вход пользователя
export const login: RequestHandler = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Email = @email');

    if (result.recordset.length === 0) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    const user = result.recordset[0];

    const isPasswordValid = await bcrypt.compare(password, user.Password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { employeeId: user.EmployeeID, role: user.Role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      token,
      role: user.Role,
      message: 'Успешный вход',
    });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Вход администратора
export const adminLogin: RequestHandler = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Email = @email AND Role = \'Администратор\'');

    if (result.recordset.length === 0) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    const user = result.recordset[0];

    const isPasswordValid = await bcrypt.compare(password, user.Password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { employeeId: user.EmployeeID, role: user.Role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      token,
      role: user.Role,
      message: 'Успешный вход администратора',
    });
  } catch (error) {
    console.error('Ошибка при входе администратора:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};