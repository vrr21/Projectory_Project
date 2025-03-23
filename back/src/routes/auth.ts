import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { poolPromise } from '../config/db';
import { hashPassword, comparePassword } from '../middleware/hashPasswords';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey123';

// Регистрация
router.post('/register', async (req, res) => {
  const { fullName, phone, email, password, positionId } = req.body;

  try {
    const pool = await poolPromise;

    // Проверка, существует ли пользователь с таким email
    const userCheck = await pool
      .request()
      .input('email', email)
      .query('SELECT * FROM Users WHERE Email = @email');

    if (userCheck.recordset.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Проверка, существует ли PositionID
    const positionCheck = await pool
      .request()
      .input('positionId', positionId)
      .query('SELECT * FROM Position WHERE PositionID = @positionId');

    if (positionCheck.recordset.length === 0) {
      return res.status(400).json({ error: `PositionID ${positionId} не существует. Доступные значения: 1 (Разработчик), 2 (Менеджер)` });
    }

    // Хеширование пароля (временно отключено для тестов)
    // const hashedPassword = await hashPassword(password);
    const hashedPassword = password; // Временно используем незакешированный пароль
    console.log(`Пароль для ${email}: ${hashedPassword}`);

    // Вставка нового сотрудника
    const employeeResult = await pool
      .request()
      .input('fullName', fullName)
      .input('email', email)
      .input('phone', phone)
      .input('positionId', positionId)
      .query(
        'INSERT INTO Employee (FullName, Email, Phone, PositionID) OUTPUT INSERTED.EmployeeID VALUES (@fullName, @email, @phone, @positionId)'
      );

    const employeeId = employeeResult.recordset[0].EmployeeID;
    console.log(`Сотрудник добавлен с EmployeeID: ${employeeId}`);

    // Вставка нового пользователя
    await pool
      .request()
      .input('employeeId', employeeId)
      .input('email', email)
      .input('password', hashedPassword)
      .input('isAdmin', 0)
      .input('role', 'Сотрудник')
      .query(
        'INSERT INTO Users (EmployeeID, Email, Password, IsAdmin, Role) VALUES (@employeeId, @email, @password, @isAdmin, @role)'
      );

    res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (error: unknown) {
    console.error('Ошибка при регистрации:');
    if (error instanceof Error) {
      console.error(error.message);
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Ошибка сервера', error: 'Неизвестная ошибка' });
    }
  }
});

// Авторизация
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`Попытка авторизации для email: ${email}`);

  try {
    const pool = await poolPromise;
    console.log('Подключение к базе данных успешно');

    // Поиск пользователя
    const result = await pool
      .request()
      .input('email', email)
      .query('SELECT * FROM Users WHERE Email = @email');

    console.log('Результат запроса к базе данных:', result.recordset);

    const user = result.recordset[0];

    if (!user) {
      console.log(`Пользователь с email ${email} не найден`);
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    console.log(`Найден пользователь: ${user.Email}, пароль в базе: ${user.Password}`);

    // Проверка пароля (временно отключено хеширование для тестов)
    // const isPasswordValid = await comparePassword(password, user.Password);
    const isPasswordValid = password === user.Password; // Сравнение без хеширования
    console.log(`Введенный пароль: ${password}, результат сравнения: ${isPasswordValid}`);

    if (!isPasswordValid) {
      console.log(`Пароль для ${email} не совпадает`);
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    // Генерация JWT-токена
    const token = jwt.sign(
      { userId: user.UserID, employeeId: user.EmployeeID, role: user.Role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log(`Токен сгенерирован для ${email}: ${token}`);
    res.json({ token, role: user.Role });
  } catch (error: unknown) {
    console.error('Ошибка при авторизации:');
    if (error instanceof Error) {
      console.error(error.message);
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Ошибка сервера', error: 'Неизвестная ошибка' });
    }
  }
});

export default router;