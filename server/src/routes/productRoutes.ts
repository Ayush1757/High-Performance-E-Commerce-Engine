import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductStats,
} from '../controllers/productController';
import { protect, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/stats', getProductStats);
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes (require authentication + admin role)
router.post('/', protect, isAdmin, createProduct);
router.put('/:id', protect, isAdmin, updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

export default router;
