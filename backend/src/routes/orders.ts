import { Router } from 'express';
import { getOrders, createOrder, updateOrder, deleteOrder } from '../controllers/orderController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware('Администратор'), getOrders);
router.post('/', authMiddleware('Администратор'), createOrder);
router.put('/:id', authMiddleware('Администратор'), updateOrder);
router.delete('/:id', authMiddleware('Администратор'), deleteOrder);

export default router;