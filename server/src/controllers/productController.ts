import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { redisClient } from '../config/redis';
import mongoose from 'mongoose';

// Helper to clear product list cache when data changes
const clearProductCache = async (): Promise<void> => {
  try {
    if (redisClient.isReady) {
      await redisClient.del('products');
    }
  } catch (err) {
    console.error('Redis cache invalidation error:', err);
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Public
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, category, stock, brand, images, rating } = req.body;

    if (!name || !description || price === undefined || !category || !brand) {
      res.status(400).json({ message: 'Please provide all required product fields' });
      return;
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      brand,
      images,
      rating,
    });

    await clearProductCache();

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error: (error as Error).message });
  }
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = 'products';

    // 1. Check Redis first
    if (redisClient.isReady) {
      const cachedProducts = await redisClient.get(cacheKey);
      if (cachedProducts) {
        res.json(JSON.parse(cachedProducts));
        return;
      }
    }

    // 2. Otherwise read MongoDB
    const products = await Product.find({});

    // 3. Store in Redis
    if (redisClient.isReady) {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(products));
    }

    // 4. Return response
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: (error as Error).message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: 'Invalid product ID format' });
      return;
    }

    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product', error: (error as Error).message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Public
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: 'Invalid product ID format' });
      return;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedProduct) {
      await clearProductCache();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: (error as Error).message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Public
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: 'Invalid product ID format' });
      return;
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (product) {
      await clearProductCache();
      res.json({ message: 'Product removed successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: (error as Error).message });
  }
};

