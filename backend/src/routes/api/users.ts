import { Router } from 'express';
import { authenticate } from '../../middleware';
import { getProfile, updateProfile } from '../../controllers/user.controller';

const router = Router();

router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, updateProfile);

export default router;