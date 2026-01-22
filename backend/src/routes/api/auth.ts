import { Router } from 'express';
import { getNonce, verifySignature } from '../../controllers/auth.controller';

const router = Router();

router.post('/nonce', getNonce);
router.post('/verify', verifySignature);

export default router;