// backend/src/controllers/reportController.ts
import { RequestHandler } from 'express';
import { IResult } from 'mssql';
import poolPromise from '../config/db';

interface UserTaskReport {
  UserID: number;
  FullName: string;
  CompletedTasks: number;
  TotalHours: number;
}

interface UserTaskByPeriod {
  UserID: number;
  FullName: string;
  ExecutionDate: Date;
  Stage: string;
  TaskDescription: string;
  HoursSpent: number;
}

interface TaskList {
  TaskExecutionID: number;
  TaskDescription: string;
  UserName: string;
  Stage: string;
  ExecutionDate: Date;
  Deadline: Date;
  HoursSpent: number;
  Status: string;
  OrderTitle: string;
}

interface OrderLifecycle {
  OrderID: number;
  OrderTitle: string;
  OrderDescription: string;
  CreatedAt: Date;
  Deadline: Date;
  OrderStatus: string;
  TaskExecutionID: number;
  TaskDescription: string;
  UserName: string;
  Stage: string;
  ExecutionDate: Date;
  HoursSpent: number;
  TaskStatus: string;
}

export const getUserTaskReport: RequestHandler = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result: IResult<UserTaskReport> = await pool.request().query('SELECT * FROM UserTaskReport');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Ошибка получения отчёта UserTaskReport:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const getUserTaskByPeriod: RequestHandler = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result: IResult<UserTaskByPeriod> = await pool.request().query('SELECT * FROM UserTaskByPeriod');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Ошибка получения отчёта UserTaskByPeriod:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const getTaskList: RequestHandler = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result: IResult<TaskList> = await pool.request().query('SELECT * FROM TaskList');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Ошибка получения отчёта TaskList:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const getOrderLifecycle: RequestHandler = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result: IResult<OrderLifecycle> = await pool.request().query('SELECT * FROM OrderLifecycle');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Ошибка получения отчёта OrderLifecycle:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};