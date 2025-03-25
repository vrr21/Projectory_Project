// backend/src/routes/orders.ts
import { Router } from 'express';
import { createOrder, getOrders, updateOrder, deleteOrder } from '../controllers/orderController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

const router = Router();

router.post('/', authMiddleware, roleMiddleware('Администратор'), createOrder);
router.get('/', authMiddleware, getOrders);
router.put('/:id', authMiddleware, roleMiddleware('Администратор'), updateOrder);
router.delete('/:id', authMiddleware, roleMiddleware('Администратор'), deleteOrder);

export default router;