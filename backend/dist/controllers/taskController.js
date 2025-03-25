"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.createTask = exports.getTasks = void 0;
const db_1 = __importDefault(require("../config/db"));
const getTasks = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield db_1.default;
        const result = yield pool.request().query(`
      SELECT te.TaskExecutionID AS id, te.OrderID AS orderId, e.FullName AS assignee, s.Name AS stage, te.ExecutionDate AS createdAt, te.HoursSpent, st.Name AS status
      FROM TaskExecution te
      JOIN Employee e ON te.EmployeeID = e.EmployeeID
      JOIN Stage s ON te.StageID = s.StageID
      JOIN Status st ON te.StatusID = st.StatusID
    `);
        const tasks = result.recordset.map((row) => ({
            id: row.id,
            title: row.stage,
            description: `Task for order ${row.orderId}`,
            status: row.status,
            assignee: row.assignee,
            createdAt: row.createdAt,
            orderId: row.orderId,
            comments: [], // Комментарии пока не реализованы
        }));
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.getTasks = getTasks;
const createTask = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId, employeeId, stageId, executionDate, hoursSpent, statusId } = req.body;
    try {
        const pool = yield db_1.default;
        yield pool.request()
            .input('orderId', orderId)
            .input('employeeId', employeeId)
            .input('stageId', stageId)
            .input('executionDate', executionDate)
            .input('hoursSpent', hoursSpent)
            .input('statusId', statusId)
            .query('INSERT INTO TaskExecution (OrderID, EmployeeID, StageID, ExecutionDate, HoursSpent, StatusID) VALUES (@orderId, @employeeId, @stageId, @executionDate, @hoursSpent, @statusId)');
        res.status(201).json({ message: 'Task created' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.createTask = createTask;
const updateTask = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { orderId, employeeId, stageId, executionDate, hoursSpent, statusId } = req.body;
    try {
        const pool = yield db_1.default;
        yield pool.request()
            .input('id', id)
            .input('orderId', orderId)
            .input('employeeId', employeeId)
            .input('stageId', stageId)
            .input('executionDate', executionDate)
            .input('hoursSpent', hoursSpent)
            .input('statusId', statusId)
            .query('UPDATE TaskExecution SET OrderID = @orderId, EmployeeID = @employeeId, StageID = @stageId, ExecutionDate = @executionDate, HoursSpent = @hoursSpent, StatusID = @statusId WHERE TaskExecutionID = @id');
        res.json({ message: 'Task updated' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.updateTask = updateTask;
const deleteTask = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const pool = yield db_1.default;
        yield pool.request()
            .input('id', id)
            .query('DELETE FROM TaskExecution WHERE TaskExecutionID = @id');
        res.json({ message: 'Task deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.deleteTask = deleteTask;
