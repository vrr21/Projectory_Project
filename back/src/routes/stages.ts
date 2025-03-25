import { Router } from 'express';
import { getStages, getStageById, createStage, updateStage, deleteStage } from '../controllers/stageController';

const router = Router();

// Маршруты для этапов
router.get('/', getStages);
router.get('/:id', getStageById);
router.post('/', createStage);
router.put('/:id', updateStage);
router.delete('/:id', deleteStage);

export default router;