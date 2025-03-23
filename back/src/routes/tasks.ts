import { Router } from 'express';
import { poolPromise } from '../config/db';
import { authenticateToken } from './auth';

const router = Router();

// Маршрут для получения задач
router.get('/', authenticateToken, async (req, res) => {
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
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

// Маршрут для добавления задачи
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, dueDate, employeeId, stageId, statusId, executionDate, hoursSpent } = req.body;

  try {
    const pool = await poolPromise;

    // Находим OrderID
    const orderResult = await pool
      .request()
      .input('description', description)
      .query('SELECT OrderID FROM CustomerOrder WHERE Description = @description');

    if (!orderResult.recordset.length) {
      return res.status(400).json({ error: 'Заказ не найден' });
    }

    const orderId = orderResult.recordset[0].OrderID;

    const result = await pool
      .request()
      .input('orderId', orderId)
      .input('employeeId', employeeId)
      .input('stageId', stageId)
      .input('executionDate', executionDate)
      .input('hoursSpent', hoursSpent)
      .input('statusId', statusId)
      .query(`
        INSERT INTO TaskExecution (OrderID, EmployeeID, StageID, ExecutionDate, HoursSpent, StatusID)
        OUTPUT INSERTED.TaskExecutionID
        VALUES (@orderId, @employeeId, @stageId, @executionDate, @hoursSpent, @statusId)
      `);

    res.json({ TaskID: result.recordset[0].TaskExecutionID });
  } catch (err) {
    console.error('Error adding task:', err);
    res.status(500).json({ error: 'Error adding task' });
  }
});

// Маршрут для обновления статуса задачи
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const pool = await poolPromise;
    const statusResult = await pool
      .request()
      .input('status', status)
      .query('SELECT StatusID FROM Status WHERE Name = @status');

    if (!statusResult.recordset.length) {
      return res.status(400).json({ error: 'Статус не найден' });
    }

    const statusId = statusResult.recordset[0].StatusID;

    await pool
      .request()
      .input('id', id)
      .input('statusId', statusId)
      .query('UPDATE TaskExecution SET StatusID = @statusId WHERE TaskExecutionID = @id');

    res.json({ message: 'Статус обновлен' });
  } catch (err) {
    console.error('Error updating task status:', err);
    res.status(500).json({ error: 'Error updating task status' });
  }
});

// Маршрут для удаления задачи
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('id', id)
      .query('DELETE FROM TaskExecution WHERE TaskExecutionID = @id');

    res.json({ message: 'Задача удалена' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Error deleting task' });
  }
});

// Маршрут для получения сотрудников
router.get('/employees', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT EmployeeID, FullName FROM Employee');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Error fetching employees' });
  }
});

// Маршрут для получения этапов
router.get('/stages', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT StageID, Name FROM Stage');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching stages:', err);
    res.status(500).json({ error: 'Error fetching stages' });
  }
});

// Маршрут для получения статусов
router.get('/statuses', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT StatusID, Name FROM Status');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching statuses:', err);
    res.status(500).json({ error: 'Error fetching statuses' });
  }
});

export default router;