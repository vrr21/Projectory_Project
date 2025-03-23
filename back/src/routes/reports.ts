import { Router } from 'express';
import { poolPromise } from '../config/db';
import { authenticateToken } from './auth';

const router = Router();

// Маршрут для отчета по задачам сотрудника
router.get('/employee-tasks/:employeeId', authenticateToken, async (req, res) => {
  const { employeeId } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('employeeId', employeeId)
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
    console.error('Error fetching employee tasks report:', err);
    res.status(500).json({ error: 'Error fetching employee tasks report' });
  }
});

// Маршрут для отчета по задачам сотрудника за период
router.get('/employee-tasks-period/:employeeId', authenticateToken, async (req, res) => {
  const { employeeId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('employeeId', employeeId)
      .input('startDate', startDate)
      .input('endDate', endDate)
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
    console.error('Error fetching employee tasks period report:', err);
    res.status(500).json({ error: 'Error fetching employee tasks period report' });
  }
});

export default router;