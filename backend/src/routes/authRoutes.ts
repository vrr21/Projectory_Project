// backend/src/routes/authRoutes.ts
import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

// Проверяем, что функции импортированы корректно
console.log('Импорт register:', typeof register);
console.log('Импорт login:', typeof login);

if (typeof register !== 'function' || typeof login !== 'function') {
  throw new Error('Функции register или login не определены в authController.ts');
}

// Маршруты для регистрации и авторизации
router.post('/register', register);
router.post('/login', login);

export default router;