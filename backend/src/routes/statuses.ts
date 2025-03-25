import { Router } from 'express';
import { getStatuses } from '../controllers/statusController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware(), getStatuses);

export default router;