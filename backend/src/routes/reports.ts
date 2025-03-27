import { Router, Request, Response, NextFunction } from 'express';
import { getAdminStats, getUserTaskReport, getUserTaskByPeriod } from '../controllers/reportController';
import { authMiddleware } from '../middleware/authMiddleware';
import poolPromise from '../config/db';
import ExcelJS from 'exceljs';

type ExpressHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const router = Router();

const getAdminStatsHandler: ExpressHandler = getAdminStats;
const getUserTaskReportHandler: ExpressHandler = getUserTaskReport;
const getUserTaskByPeriodHandler: ExpressHandler = getUserTaskByPeriod;

router.get('/admin-stats', authMiddleware, getAdminStatsHandler);
router.get('/user-task-report', authMiddleware, getUserTaskReportHandler);
router.get('/user-task-by-period', authMiddleware, getUserTaskByPeriodHandler);

// Экспорт отчёта UserTaskReport в Excel
router.get('/export/user-task-report', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        UserID,
        FullName,
        CompletedTasks,
        TotalHours
      FROM UserTaskReport
    `);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('UserTaskReport');

    worksheet.columns = [
      { header: 'ID Пользователя', key: 'UserID', width: 15 },
      { header: 'ФИО', key: 'FullName', width: 30 },
      { header: 'Завершённые задачи', key: 'CompletedTasks', width: 20 },
      { header: 'Всего часов', key: 'TotalHours', width: 15 },
    ];

    worksheet.addRows(result.recordset);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=UserTaskReport.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Ошибка экспорта отчёта:', error);
    res.status(500).json({ message: 'Ошибка сервера при экспорте отчёта' });
    next(error);
  }
});

// Экспорт отчёта UserTaskByPeriod в Excel
router.get('/export/user-task-by-period', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        UserID,
        FullName,
        ExecutionDate,
        Stage,
        TaskDescription,
        HoursSpent
      FROM UserTaskByPeriod
    `);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('UserTaskByPeriod');

    worksheet.columns = [
      { header: 'ID Пользователя', key: 'UserID', width: 15 },
      { header: 'ФИО', key: 'FullName', width: 30 },
      { header: 'Дата выполнения', key: 'ExecutionDate', width: 20 },
      { header: 'Этап', key: 'Stage', width: 20 },
      { header: 'Описание задачи', key: 'TaskDescription', width: 40 },
      { header: 'Затраченные часы', key: 'HoursSpent', width: 15 },
    ];

    worksheet.addRows(result.recordset);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=UserTaskByPeriod.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Ошибка экспорта отчёта:', error);
    res.status(500).json({ message: 'Ошибка сервера при экспорте отчёта' });
    next(error);
  }
});

export default router;