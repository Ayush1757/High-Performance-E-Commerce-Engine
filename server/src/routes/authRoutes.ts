import { Router } from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (require authentication)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

export default router;
