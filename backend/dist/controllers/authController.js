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
// Валидация для регистрации
exports.registerValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Некорректный email'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов'),
    (0, express_validator_1.body)('fullName').notEmpty().withMessage('Полное имя обязательно'),
    (0, express_validator_1.body)('phone').optional().isMobilePhone('any').withMessage('Некорректный номер телефона'),
    (0, express_validator_1.body)('positionId').optional().isInt().withMessage('Некорректный ID должности'),
    (0, express_validator_1.body)('role').optional().isString().withMessage('Некорректная роль'),
];
// Функция регистрации
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { email, password, fullName, phone, positionId, role } = req.body;
    try {
        const pool = yield db_1.default;
        // Проверяем, существует ли пользователь с таким email
        const existingUser = yield pool
            .request()
            .input('email', email)
            .query('SELECT * FROM Users WHERE Email = @email');
        if (existingUser.recordset.length > 0) {
            res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            return;
        }
        // Создаём запись в таблице Employee
        const employeeResult = yield pool
            .request()
            .input('fullName', fullName)
            .input('email', email)
            .input('phone', phone || null)
            .input('positionId', positionId || 2)
            .query('INSERT INTO Employee (FullName, Email, Phone, PositionID) OUTPUT INSERTED.EmployeeID VALUES (@fullName, @email, @phone, @positionId)');
        const employeeId = employeeResult.recordset[0].EmployeeID;
        // Хешируем пароль
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Определяем роль и статус администратора
        const userRole = role || 'Сотрудник';
        const isAdmin = userRole === 'Администратор' ? 1 : 0;
        // Создаём запись в таблице Users
        yield pool
            .request()
            .input('employeeId', employeeId)
            .input('email', email)
            .input('password', hashedPassword)
            .input('isAdmin', isAdmin)
            .input('role', userRole)
            .query('INSERT INTO Users (EmployeeID, Email, Password, IsAdmin, Role) VALUES (@employeeId, @email, @password, @isAdmin, @role)');
        // Генерируем JWT-токен
        const token = jsonwebtoken_1.default.sign({ employeeId, role: userRole }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token, role: userRole });
    }
    catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ message: 'Ошибка сервера', error });
    }
});
exports.register = register;
// Валидация для входа
exports.loginValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Некорректный email'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Пароль обязателен'),
];
// Функция входа
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { email, password } = req.body;
    try {
        const pool = yield db_1.default;
        // Ищем пользователя по email
        const userResult = yield pool
            .request()
            .input('email', email)
            .query('SELECT * FROM Users WHERE Email = @email');
        if (userResult.recordset.length === 0) {
            res.status(400).json({ message: 'Неверные учетные данные' });
            return;
        }
        const user = userResult.recordset[0];
        // Проверяем пароль
        const isMatch = yield bcryptjs_1.default.compare(password, user.Password);
        if (!isMatch) {
            res.status(400).json({ message: 'Неверные учетные данные' });
            return;
        }
        // Генерируем JWT-токен
        const token = jsonwebtoken_1.default.sign({ employeeId: user.EmployeeID, role: user.Role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, role: user.Role });
    }
    catch (error) {
        console.error('Ошибка при входе:', error);
        res.status(500).json({ message: 'Ошибка сервера', error });
    }
});
exports.login = login;
