import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import logger from '../utils/logger';

interface JwtPayload {
  id: string;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Authentication middleware.
 * Verifies the JWT token from the Authorization header and attaches
 * the authenticated user to the request object.
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      logger.error('JWT_SECRET is not defined in environment variables');
      res.status(500).json({ success: false, message: 'Server configuration error' });
      return;
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    logger.warn('Token verification failed', { error: (error as Error).message });
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

/**
 * Authorization middleware for admin-only routes.
 * Must be used AFTER the `protect` middleware.
 */
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
  }
};
