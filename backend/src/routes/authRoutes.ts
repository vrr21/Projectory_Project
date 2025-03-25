// backend/src/routes/authRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';

// Явно определяем тип обработчика маршрутов
type ExpressHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// Импортируем функции с явным указанием типов
import { register, login } from '../controllers/authController';

const router = Router();

// Проверяем, что функции импортированы корректно
console.log('Импорт register:', typeof register);
console.log('Импорт login:', typeof login);

if (typeof register !== 'function' || typeof login !== 'function') {
  throw new Error('Функции register или login не определены в authController.ts');
}

// Явно приводим функции к типу ExpressHandler
const registerHandler: ExpressHandler = register;
const loginHandler: ExpressHandler = login;

// Маршруты для регистрации и авторизации
router.post('/register', registerHandler);
router.post('/login', loginHandler);

export default router;