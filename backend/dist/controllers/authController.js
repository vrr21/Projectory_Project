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
exports.login = exports.loginValidation = exports.register = exports.registerValidation = void 0;
const db_1 = __importDefault(require("../config/db"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
exports.registerValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('fullName').notEmpty().withMessage('Full name is required'),
];
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { email, password, fullName } = req.body;
    try {
        const pool = yield db_1.default;
        const existingUser = yield pool.request()
            .input('email', email)
            .query('SELECT * FROM Users WHERE Email = @email');
        if (existingUser.recordset.length > 0) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const employeeResult = yield pool.request()
            .input('fullName', fullName)
            .input('email', email)
            .input('positionId', 1) // Default position
            .query('INSERT INTO Employee (FullName, Email, PositionID) OUTPUT INSERTED.EmployeeID VALUES (@fullName, @email, @positionId)');
        const employeeId = employeeResult.recordset[0].EmployeeID;
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        yield pool.request()
            .input('employeeId', employeeId)
            .input('email', email)
            .input('password', hashedPassword)
            .input('role', 'Сотрудник')
            .query('INSERT INTO Users (EmployeeID, Email, Password, IsAdmin, Role) VALUES (@employeeId, @email, @password, 0, @role)');
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.register = register;
exports.loginValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
];
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { email, password } = req.body;
    try {
        const pool = yield db_1.default;
        const userResult = yield pool.request()
            .input('email', email)
            .query('SELECT * FROM Users WHERE Email = @email');
        if (userResult.recordset.length === 0) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const user = userResult.recordset[0];
        const isMatch = yield bcryptjs_1.default.compare(password, user.Password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ employeeId: user.EmployeeID, role: user.Role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, role: user.Role });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.login = login;
