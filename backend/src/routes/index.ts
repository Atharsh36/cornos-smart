import { Router } from 'express';
import productRoutes from './api/products';
import orderRoutes from './api/orders';
import authRoutes from './api/auth';
import userRoutes from './api/users';
import aiRoutes from './api/ai';
// import auditRoutes from '../audit-agent/routes/index';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy', data: { status: 'OK' } });
});

router.use('/api/products', productRoutes);
router.use('/api/orders', orderRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/ai', aiRoutes);
// router.use('/api/audit', auditRoutes);

export default router;