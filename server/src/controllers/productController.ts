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

// @desc    Fetch products with Search, Category Filter, Price Filter, Sorting, Pagination & Redis Cache-Aside
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    // Generate unique Redis cache key based on query parameters
    const cacheKey = `products:${JSON.stringify(req.query)}`;

    const fetchProductsData = async () => {
      const query: any = {};

      // 1. Search Query (partial case-insensitive match on name or description)
      if (search) {
        query.$or = [
          { name: { $regex: search as string, $options: 'i' } },
          { description: { $regex: search as string, $options: 'i' } },
        ];
      }

      // 2. Category Filter
      if (category) {
        query.category = { $regex: `^${category as string}$`, $options: 'i' };
      }

      // 3. Brand Filter
      if (brand) {
        query.brand = { $regex: `^${brand as string}$`, $options: 'i' };
      }

      // 4. Price Range Filter
      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined && minPrice !== '') {
          query.price.$gte = Number(minPrice);
        }
        if (maxPrice !== undefined && maxPrice !== '') {
          query.price.$lte = Number(maxPrice);
        }
      }

      // 5. Sorting
      let sortOptions: any = { createdAt: -1 }; // default newest first
      if (sort === 'price_asc') {
        sortOptions = { price: 1 };
      } else if (sort === 'price_desc') {
        sortOptions = { price: -1 };
      } else if (sort === 'rating_desc') {
        sortOptions = { rating: -1 };
      } else if (sort === 'name_asc') {
        sortOptions = { name: 1 };
      } else if (sort === 'oldest') {
        sortOptions = { createdAt: 1 };
      }

      // 6. Pagination Math
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.max(1, Number(limit));
      const skip = (pageNum - 1) * limitNum;

      // Execute total count and paginated query concurrently for performance
      const [total, products] = await Promise.all([
        Product.countDocuments(query),
        Product.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum),
      ]);

      const pages = Math.ceil(total / limitNum);

      return {
        products,
        page: pageNum,
        pages,
        total,
      };
    };

    // Use Cache-Aside helper (cache results for 5 minutes / 300 seconds)
    const result = await getOrSetCache(cacheKey, fetchProductsData, 300);

    res.json(result);
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
