import { Router } from 'express';
import { getStatuses, getStatusById, createStatus, updateStatus, deleteStatus } from '../controllers/statusController';

const router = Router();

// Маршруты для статусов
router.get('/', getStatuses);
router.get('/:id', getStatusById);
router.post('/', createStatus);
router.put('/:id', updateStatus);
router.delete('/:id', deleteStatus);

export default router;