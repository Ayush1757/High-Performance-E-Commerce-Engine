import { Request, Response } from 'express';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { getCacheMetrics } from '../utils/cache';
import logger from '../utils/logger';

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [userCount, productCount, orderStats, recentUsers] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalPrice' },
            avgOrderValue: { $avg: '$totalPrice' },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
            },
            completedOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
            },
          },
        },
      ]),
      User.find()
        .select('name email role createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
      pendingOrders: 0,
      completedOrders: 0,
    };

    // Cache performance metrics
    const cacheStats = getCacheMetrics();

    res.json({
      success: true,
      data: {
        users: { total: userCount },
        products: { total: productCount },
        orders: stats,
        cache: cacheStats,
        recentUsers,
      },
    });
  } catch (error) {
    logger.error('Failed to get dashboard stats', { error: (error as Error).message });
    res.status(500).json({ success: false, message: 'Failed to get dashboard statistics' });
  }
};

/**
 * @desc    Get all users (Admin)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      User.countDocuments(),
      User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        users,
        page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch users', { error: (error as Error).message });
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

/**
 * @desc    Update user role (Admin)
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role. Must be "user" or "admin".' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    logger.info(`User ${user.email} role updated to ${role}`);
    res.json({ success: true, data: user });
  } catch (error) {
    logger.error('Failed to update user role', { error: (error as Error).message });
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
};
