import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { poolPromise } from '../config/db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey123';

// Middleware для проверки JWT
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен отсутствует' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Неверный токен' });
    }
    (req as any).user = user;
    next();
  });
};

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
      return res.status(400).json({ message: `PositionID ${positionId} не существует. Доступные значения: 1 (Разработчик), 2 (Менеджер)` });
    }

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

    // Вставка нового пользователя (пароль в открытом виде)
    await pool
      .request()
      .input('employeeId', employeeId)
      .input('email', email)
      .input('password', password)
      .input('isAdmin', 0)
      .input('role', 'Сотрудник')
      .query(
        'INSERT INTO Users (EmployeeID, Email, Password, IsAdmin, Role) VALUES (@employeeId, @email, @password, @isAdmin, @role)'
      );

    res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: 'Ошибка сервера', details: String(err) });
  }
});

// Авторизация
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`Попытка авторизации для email: ${email}`);

  try {
    const pool = await poolPromise;
    console.log('Подключение к базе данных успешно');

    const result = await pool
      .request()
      .input('email', email)
      .query('SELECT * FROM Users WHERE Email = @email');

    console.log('Результат запроса к базе данных:', result.recordset);

    const user = result.recordset[0];
    if (!user) {
      console.log(`Пользователь с email ${email} не найден`);
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    console.log(`Найден пользователь: ${user.Email}, пароль в базе: ${user.Password}`);

    // Проверка пароля (пароли в открытом виде)
    const isPasswordValid = password === user.Password;
    console.log(`Введенный пароль: ${password}, результат сравнения: ${isPasswordValid}`);

    if (!isPasswordValid) {
      console.log(`Пароль для ${email} не совпадает`);
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Генерируем JWT токен
    const token = jwt.sign(
      { userId: user.UserID, employeeId: user.EmployeeID, role: user.Role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log(`Токен сгенерирован для ${email}: ${token}`);
    res.json({ token, role: user.Role });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Ошибка сервера', details: String(err) });
  }
});

// Маршрут для получения данных сотрудника по ID
router.get('/employees/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', id)
      .query('SELECT FullName, Email, Phone FROM Employee WHERE EmployeeID = @id');

    if (!result.recordset.length) {
      return res.status(404).json({ error: 'Сотрудник не найден' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching employee:', err);
    res.status(500).json({ error: 'Error fetching employee' });
  }
});

// Маршрут для получения данных пользователя по EmployeeID
router.get('/users/:employeeId', authenticateToken, async (req, res) => {
  const { employeeId } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('employeeId', employeeId)
      .query('SELECT Role FROM Users WHERE EmployeeID = @employeeId');

    if (!result.recordset.length) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Error fetching user' });
  }
});

// Типизация для req.user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        employeeId: number;
        role: string;
      };
    }
  }
}

export default router;
export { authenticateToken };