import { Router } from 'express';
import { authenticate } from '../../middleware';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from '../../controllers/product.controller';

const router = Router();

router.post('/', authenticate, createProduct);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.put('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);

export default router;