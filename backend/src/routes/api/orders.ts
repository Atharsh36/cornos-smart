import { Router } from 'express';
import { authenticate } from '../../middleware';
import {
  createOrder,
  getOrder,
  getBuyerOrders,
  getSellerOrders,
  updateOrderStatus,
  raiseDispute,
} from '../../controllers/order.controller';

const router = Router();

router.post('/', authenticate, createOrder);
router.get('/:id', getOrder);
router.get('/buyer/:wallet', getBuyerOrders); // Remove auth for testing
router.get('/seller/:wallet', getSellerOrders);
router.patch('/:id/status', authenticate, updateOrderStatus);
router.post('/:id/dispute', authenticate, raiseDispute);

export default router;