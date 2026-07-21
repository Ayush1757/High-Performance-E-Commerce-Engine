import { Router, Request, Response } from 'express';
import { registerUser, loginUser } from '../controllers/authController';
import { protect, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Example of a protected route using the middleware
router.get('/profile', protect, (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  res.json({
    message: 'Profile data retrieved successfully',
    user: authReq.user,
  });
});

export default router;
