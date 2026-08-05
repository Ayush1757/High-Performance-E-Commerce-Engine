import { Router } from 'express';
import { getDashboardStats, getAllUsers, updateUserRole } from '../controllers/adminController';
import { protect, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, isAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

export default router;
