import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sql from "mssql";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Загружаем переменные окружения из .env
dotenv.config();

const app = express();

// Порт из .env
const port = process.env.PORT || 3002;

// Настройка подключения к MSSQL
const dbConfig: sql.config = {
  user: process.env.DB_USER || "ProssLibrann",
  password: process.env.DB_PASSWORD || "123456789",
  server: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "1433"),
  database: process.env.DB_NAME || "KURSACHBD",
  options: {
    encrypt: false, // Для localhost шифрование не требуется
    trustServerCertificate: true, // Для локального SQL Server
  },
};

// JWT секрет
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey123";

// Middleware
app.use(express.json());
app.use(cors());

// Подключение к базе данных
const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log("Connected to MSSQL database");
    return pool;
  })
  .catch(err => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });

// Базовый маршрут
app.get("/", (req, res) => {
  res.send("Hello from Projectory backend!");
});

// Регистрация
app.post("/api/auth/register", async (req, res) => {
  const { fullName, phone, email, password, positionId } = req.body;

  try {
    const pool = await poolPromise;

    // Проверка, существует ли пользователь с таким email
    const userCheck = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM Users WHERE Email = @email");

    if (userCheck.recordset.length > 0) {
      return res.status(400).json({ error: "Пользователь с таким email уже существует" });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Вставка нового сотрудника
    const employeeResult = await pool
      .request()
      .input("fullName", sql.NVarChar, fullName)
      .input("email", sql.NVarChar, email)
      .input("phone", sql.NVarChar, phone)
      .input("positionId", sql.Int, positionId)
      .query(
        "INSERT INTO Employee (FullName, Email, Phone, PositionID) OUTPUT INSERTED.EmployeeID VALUES (@fullName, @email, @phone, @positionId)"
      );

    const employeeId = employeeResult.recordset[0].EmployeeID;

    // Вставка нового пользователя
    await pool
      .request()
      .input("employeeId", sql.Int, employeeId)
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, hashedPassword)
      .input("isAdmin", sql.Bit, 0)
      .input("role", sql.NVarChar, "Сотрудник")
      .query(
        "INSERT INTO Users (EmployeeID, Email, Password, IsAdmin, Role) VALUES (@employeeId, @email, @password, @isAdmin, @role)"
      );

    res.status(201).json({ message: "Пользователь успешно зарегистрирован" });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Авторизация
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM Users WHERE Email = @email");

    const user = result.recordset[0];
    if (!user) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    // Сравниваем пароли (предполагаем, что пароли в базе захешированы)
    const isPasswordValid = await bcrypt.compare(password, user.Password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    // Генерируем JWT токен
    const token = jwt.sign(
      { userId: user.UserID, employeeId: user.EmployeeID, role: user.Role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.Role });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Middleware для проверки JWT
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Токен отсутствует" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Неверный токен" });
    }
    (req as any).user = user;
    next();
  });
};

// Маршрут для получения задач
app.get("/api/tasks", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        te.TaskExecutionID AS TaskID,
        co.Description AS Title,
        co.Description,
        s.Name AS Stage,
        st.Name AS Status,
        te.ExecutionDate AS DueDate,
        te.EmployeeID AS CreatedBy,
        te.HoursSpent
      FROM TaskExecution te
      JOIN CustomerOrder co ON te.OrderID = co.OrderID
      JOIN Stage s ON te.StageID = s.StageID
      JOIN Status st ON te.StatusID = st.StatusID
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Error fetching tasks" });
  }
});

// Маршрут для добавления задачи
app.post("/api/tasks", authenticateToken, async (req, res) => {
  const { title, description, dueDate, employeeId, stageId, statusId, executionDate, hoursSpent } = req.body;

  try {
    const pool = await poolPromise;

    // Находим OrderID (предполагаем, что title и description связаны с заказом)
    const orderResult = await pool
      .request()
      .input("description", sql.NVarChar, description)
      .query("SELECT OrderID FROM CustomerOrder WHERE Description = @description");

    if (!orderResult.recordset.length) {
      return res.status(400).json({ error: "Заказ не найден" });
    }

    const orderId = orderResult.recordset[0].OrderID;

    const result = await pool
      .request()
      .input("orderId", sql.Int, orderId)
      .input("employeeId", sql.Int, employeeId)
      .input("stageId", sql.Int, stageId)
      .input("executionDate", sql.Date, executionDate)
      .input("hoursSpent", sql.Int, hoursSpent)
      .input("statusId", sql.Int, statusId)
      .query(`
        INSERT INTO TaskExecution (OrderID, EmployeeID, StageID, ExecutionDate, HoursSpent, StatusID)
        OUTPUT INSERTED.TaskExecutionID
        VALUES (@orderId, @employeeId, @stageId, @executionDate, @hoursSpent, @statusId)
      `);

    res.json({ TaskID: result.recordset[0].TaskExecutionID });
  } catch (err) {
    console.error("Error adding task:", err);
    res.status(500).json({ error: "Error adding task" });
  }
});

// Маршрут для обновления статуса задачи
app.put("/api/tasks/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const pool = await poolPromise;
    const statusResult = await pool
      .request()
      .input("status", sql.NVarChar, status)
      .query("SELECT StatusID FROM Status WHERE Name = @status");

    if (!statusResult.recordset.length) {
      return res.status(400).json({ error: "Статус не найден" });
    }

    const statusId = statusResult.recordset[0].StatusID;

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("statusId", sql.Int, statusId)
      .query("UPDATE TaskExecution SET StatusID = @statusId WHERE TaskExecutionID = @id");

    res.json({ message: "Статус обновлен" });
  } catch (err) {
    console.error("Error updating task status:", err);
    res.status(500).json({ error: "Error updating task status" });
  }
});

// Маршрут для удаления задачи
app.delete("/api/tasks/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM TaskExecution WHERE TaskExecutionID = @id");

    res.json({ message: "Задача удалена" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Error deleting task" });
  }
});

// Маршрут для получения сотрудников
app.get("/api/employees", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT EmployeeID, FullName FROM Employee");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ error: "Error fetching employees" });
  }
});

// Маршрут для получения этапов
app.get("/api/stages", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT StageID, Name FROM Stage");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching stages:", err);
    res.status(500).json({ error: "Error fetching stages" });
  }
});

// Маршрут для получения статусов
app.get("/api/statuses", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT StatusID, Name FROM Status");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching statuses:", err);
    res.status(500).json({ error: "Error fetching statuses" });
  }
});

// Маршрут для получения данных сотрудника по ID
app.get("/api/employees/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT FullName, Email, Phone FROM Employee WHERE EmployeeID = @id");

    if (!result.recordset.length) {
      return res.status(404).json({ error: "Сотрудник не найден" });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error fetching employee:", err);
    res.status(500).json({ error: "Error fetching employee" });
  }
});

// Маршрут для получения данных пользователя по EmployeeID
app.get("/api/users/:employeeId", authenticateToken, async (req, res) => {
  const { employeeId } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("employeeId", sql.Int, employeeId)
      .query("SELECT Role FROM Users WHERE EmployeeID = @employeeId");

    if (!result.recordset.length) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Error fetching user" });
  }
});

// Маршрут для получения заказов
app.get("/orders", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        co.OrderID,
        co.Description,
        co.OrderDate,
        co.DueDate,
        c.Name AS Customer,
        ot.Name AS OrderType,
        s.Name AS Status
      FROM CustomerOrder co
      JOIN Customer c ON co.CustomerID = c.CustomerID
      JOIN OrderType ot ON co.OrderTypeID = ot.OrderTypeID
      JOIN Status s ON co.StatusID = s.StatusID
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Error fetching orders" });
  }
});

// Маршрут для отчета по задачам сотрудника
app.get("/reports/employee-tasks/:employeeId", authenticateToken, async (req, res) => {
  const { employeeId } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("employeeId", sql.Int, employeeId)
      .query(`
        SELECT 
          e.FullName,
          te.TaskExecutionID,
          co.Description AS TaskTitle,
          s.Name AS Status,
          te.HoursSpent
        FROM TaskExecution te
        JOIN Employee e ON te.EmployeeID = e.EmployeeID
        JOIN CustomerOrder co ON te.OrderID = co.OrderID
        JOIN Status s ON te.StatusID = s.StatusID
        WHERE te.EmployeeID = @employeeId
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching employee tasks report:", err);
    res.status(500).json({ error: "Error fetching employee tasks report" });
  }
});

// Маршрут для отчета по задачам сотрудника за период
app.get("/reports/employee-tasks-period/:employeeId", authenticateToken, async (req, res) => {
  const { employeeId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("employeeId", sql.Int, employeeId)
      .input("startDate", sql.Date, startDate)
      .input("endDate", sql.Date, endDate)
      .query(`
        SELECT 
          te.EmployeeID,
          e.FullName,
          te.ExecutionDate,
          s.Name AS Stage,
          co.Description AS OrderDescription,
          te.HoursSpent
        FROM TaskExecution te
        JOIN Employee e ON te.EmployeeID = e.EmployeeID
        JOIN Stage s ON te.StageID = s.StageID
        JOIN CustomerOrder co ON te.OrderID = co.OrderID
        WHERE te.EmployeeID = @employeeId
          AND te.ExecutionDate BETWEEN @startDate AND @endDate
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching employee tasks period report:", err);
    res.status(500).json({ error: "Error fetching employee tasks period report" });
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
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