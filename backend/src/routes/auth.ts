import { Router } from 'express';
import { login, loginValidation, register, registerValidation } from '../controllers/authController';

const router = Router();

router.post('/register', ...registerValidation, register);
router.post('/login', ...loginValidation, login);

export default router;