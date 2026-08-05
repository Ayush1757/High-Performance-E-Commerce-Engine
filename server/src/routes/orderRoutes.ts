import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  getOrderStats,
} from '../controllers/orderController';
import { protect, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// Private routes (require authentication)
router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);

// Admin routes
router.get('/stats', protect, isAdmin, getOrderStats);
router.get('/', protect, isAdmin, getAllOrders);

// Private routes with ID param
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, isAdmin, updateOrderStatus);

export default router;
