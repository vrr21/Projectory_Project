import { Router } from 'express';
import { getStages } from '../controllers/stageController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware(), getStages);

export default router;