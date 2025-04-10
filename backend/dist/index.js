"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const employees_1 = __importDefault(require("./routes/employees"));
const orders_1 = __importDefault(require("./routes/orders"));
const reports_1 = __importDefault(require("./routes/reports"));
const stages_1 = __importDefault(require("./routes/stages"));
const statuses_1 = __importDefault(require("./routes/statuses"));
const tasks_1 = __importDefault(require("./routes/tasks"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000', // Порт фронтенда
    credentials: true,
}));
app.use(express_1.default.json());
// Проверка работы сервера
app.get('/', (req, res) => {
    res.send('Server is running');
});
app.use('/api/auth', auth_1.default);
app.use('/api/employees', employees_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/reports', reports_1.default);
app.use('/api/stages', stages_1.default);
app.use('/api/statuses', statuses_1.default);
app.use('/api/tasks', tasks_1.default);
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
