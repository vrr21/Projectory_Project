"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mssql_1 = require("mssql");
const dotenv_1 = __importDefault(require("dotenv"));
// Загружаем переменные окружения из файла .env
dotenv_1.default.config();
// Проверяем, что все необходимые переменные окружения определены
const requiredEnvVars = [
    'DB_USER',
    'DB_PASSWORD',
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'JWT_SECRET',
];
// Функция для проверки переменных окружения
const checkEnvVars = (vars) => {
    for (const envVar of vars) {
        if (!process.env[envVar]) {
            throw new Error(`Environment variable ${String(envVar)} is not defined`);
        }
    }
};
// Вызываем проверку
checkEnvVars(requiredEnvVars);
// Формируем конфигурацию для подключения к базе данных
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10), // Убедимся, что порт - число
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};
// Создаём пул подключений
const poolPromise = new mssql_1.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
    console.log('Connected to MSSQL');
    return pool;
})
    .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
});
exports.default = poolPromise;
