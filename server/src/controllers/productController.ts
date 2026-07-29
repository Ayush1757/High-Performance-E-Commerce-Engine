import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { getOrSetCache, invalidateCache } from '../utils/cache';
import mongoose from 'mongoose';

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

    // Invalidate product list cache
    await invalidateCache('products');

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error: (error as Error).message });
  }
};

// @desc    Fetch all products using Cache-Aside Strategy
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    // Cache-Aside: Check Redis -> If Miss, fetch from MongoDB -> Write to Redis (3600s TTL)
    const products = await getOrSetCache('products', () => Product.find({}), 3600);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: (error as Error).message });
  }
};

// @desc    Fetch single product using Cache-Aside Strategy
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid product ID format' });
      return;
    }

    // Cache-Aside for single product (1800s TTL)
    const product = await getOrSetCache(
      `product:${id}`,
      () => Product.findById(id),
      1800
    );

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
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid product ID format' });
      return;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedProduct) {
      // Invalidate list and single product cache
      await invalidateCache(['products', `product:${id}`]);
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
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid product ID format' });
      return;
    }

    const product = await Product.findByIdAndDelete(id);

    if (product) {
      // Invalidate list and single product cache
      await invalidateCache(['products', `product:${id}`]);
      res.json({ message: 'Product removed successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: (error as Error).message });
  }
};
