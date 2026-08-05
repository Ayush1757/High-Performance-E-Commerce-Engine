import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';
import logger from '../utils/logger';

/**
 * @desc    Create a new order (checkout)
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400).json({ success: false, message: 'No order items provided' });
      return;
    }

    if (!shippingAddress) {
      res.status(400).json({ success: false, message: 'Shipping address is required' });
      return;
    }

    // Validate and calculate prices from DB (don't trust client prices)
    let itemsPrice = 0;
    const validatedItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
        return;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
        return;
      }

      const itemTotal = product.price * item.quantity;
      itemsPrice += itemTotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0] || '',
      });
    }

    // Calculate pricing
    const shippingPrice = itemsPrice > 500 ? 0 : 50; // Free shipping over $500
    const taxRate = 0.18; // 18% GST
    const taxPrice = Number((itemsPrice * taxRate).toFixed(2));
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

    // Use a transaction for atomicity (stock reduction + order creation)
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Reduce stock for each product
      for (const item of validatedItems) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } },
          { session }
        );
      }

      const order = await Order.create(
        [
          {
            user: authReq.user._id,
            orderItems: validatedItems,
            shippingAddress,
            paymentMethod: paymentMethod || 'card',
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      logger.info(`Order created: ${order[0]._id} by user ${authReq.user.email}`);
      res.status(201).json({ success: true, data: order[0] });
    } catch (txError) {
      await session.abortTransaction();
      session.endSession();
      throw txError;
    }
  } catch (error) {
    logger.error('Failed to create order', { error: (error as Error).message });
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

/**
 * @desc    Get logged-in user's orders
 * @route   GET /api/orders/my
 * @access  Private
 */
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [total, orders] = await Promise.all([
      Order.countDocuments({ user: authReq.user._id }),
      Order.find({ user: authReq.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch user orders', { error: (error as Error).message });
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid order ID format' });
      return;
    }

    const order = await Order.findById(id).populate('user', 'name email').lean();

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Only allow the order owner or admin to view
    const isOwner = order.user && (order.user as any)._id.toString() === authReq.user._id.toString();
    const isAdminUser = authReq.user.role === 'admin';

    if (!isOwner && !isAdminUser) {
      res.status(403).json({ success: false, message: 'Not authorized to view this order' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error) {
    logger.error('Failed to fetch order', { error: (error as Error).message });
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};

/**
 * @desc    Update order status (Admin)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid order ID format' });
      return;
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    order.status = status;

    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    if (status === 'processing') {
      order.isPaid = true;
      order.paidAt = new Date();
    }

    const updatedOrder = await order.save();
    logger.info(`Order ${id} status updated to ${status}`);

    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    logger.error('Failed to update order status', { error: (error as Error).message });
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    const filter: Record<string, unknown> = {};
    if (status) {
      filter.status = status;
    }

    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch all orders', { error: (error as Error).message });
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

/**
 * @desc    Get order statistics via aggregation (Admin)
 * @route   GET /api/orders/stats
 * @access  Private/Admin
 */
export const getOrderStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await Order.aggregate([
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
            { $sort: { count: -1 } },
          ],
          overall: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$totalPrice' },
                avgOrderValue: { $avg: '$totalPrice' },
                paidOrders: { $sum: { $cond: ['$isPaid', 1, 0] } },
                deliveredOrders: { $sum: { $cond: ['$isDelivered', 1, 0] } },
              },
            },
          ],
          recentOrders: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            { $project: { totalPrice: 1, status: 1, createdAt: 1, user: 1 } },
          ],
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        byStatus: stats[0].byStatus,
        overall: stats[0].overall[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          avgOrderValue: 0,
          paidOrders: 0,
          deliveredOrders: 0,
        },
        recentOrders: stats[0].recentOrders,
      },
    });
  } catch (error) {
    logger.error('Failed to get order stats', { error: (error as Error).message });
    res.status(500).json({ success: false, message: 'Failed to get order statistics' });
  }
};
