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
exports.getTaskListByOrder = exports.getEmployeeTaskByPeriod = exports.getEmployeeTaskReport = void 0;
const db_1 = __importDefault(require("../config/db"));
const getEmployeeTaskReport = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield db_1.default;
        const result = yield pool.request().query('SELECT * FROM EmployeeTaskReport');
        res.json(result.recordset);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.getEmployeeTaskReport = getEmployeeTaskReport;
const getEmployeeTaskByPeriod = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDate, endDate } = req.query;
    try {
        const pool = yield db_1.default;
        const result = yield pool.request()
            .input('startDate', startDate)
            .input('endDate', endDate)
            .query('SELECT * FROM EmployeeTaskByPeriod WHERE ExecutionDate BETWEEN @startDate AND @endDate');
        res.json(result.recordset);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.getEmployeeTaskByPeriod = getEmployeeTaskByPeriod;
const getTaskListByOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield db_1.default;
        const result = yield pool.request().query('SELECT * FROM TaskListByOrder');
        res.json(result.recordset);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.getTaskListByOrder = getTaskListByOrder;
