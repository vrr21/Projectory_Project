// backend/src/routes/comments.ts
import { Router } from 'express';
import { createComment, getCommentsByTask, deleteComment } from '../controllers/commentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authMiddleware, createComment);
router.get('/task/:taskId', authMiddleware, getCommentsByTask);
router.delete('/:id', authMiddleware, deleteComment);

export default router;