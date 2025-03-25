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
exports.deleteEmployee = exports.updateEmployee = exports.createEmployee = exports.getEmployees = void 0;
const db_1 = __importDefault(require("../config/db"));
const getEmployees = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield db_1.default;
        const result = yield pool.request().query('SELECT * FROM Employee');
        res.json(result.recordset);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.getEmployees = getEmployees;
const createEmployee = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, email, phone, positionId } = req.body;
    try {
        const pool = yield db_1.default;
        yield pool.request()
            .input('fullName', fullName)
            .input('email', email)
            .input('phone', phone)
            .input('positionId', positionId)
            .query('INSERT INTO Employee (FullName, Email, Phone, PositionID) VALUES (@fullName, @email, @phone, @positionId)');
        res.status(201).json({ message: 'Employee created' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.createEmployee = createEmployee;
const updateEmployee = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { fullName, email, phone, positionId } = req.body;
    try {
        const pool = yield db_1.default;
        yield pool.request()
            .input('id', id)
            .input('fullName', fullName)
            .input('email', email)
            .input('phone', phone)
            .input('positionId', positionId)
            .query('UPDATE Employee SET FullName = @fullName, Email = @email, Phone = @phone, PositionID = @positionId WHERE EmployeeID = @id');
        res.json({ message: 'Employee updated' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.updateEmployee = updateEmployee;
const deleteEmployee = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const pool = yield db_1.default;
        yield pool.request()
            .input('id', id)
            .query('DELETE FROM Employee WHERE EmployeeID = @id');
        res.json({ message: 'Employee deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.deleteEmployee = deleteEmployee;
