import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { getOrSetCache, invalidateCache } from '../utils/cache';
import mongoose, { SortOrder } from 'mongoose';
import logger from '../utils/logger';

/** Escape special regex characters to prevent ReDoS / injection */
const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/** TypeScript interface for product query filters */
interface ProductQueryFilter {
  $or?: Array<{ name?: { $regex: string; $options: string }; description?: { $regex: string; $options: string } }>;
  category?: { $regex: string; $options: string };
  brand?: { $regex: string; $options: string };
  price?: { $gte?: number; $lte?: number };
}

/** TypeScript interface for sort options */
interface ProductSortOptions {
  [key: string]: SortOrder;
}

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, category, stock, brand, images, rating } = req.body;

    if (!name || !description || price === undefined || !category || !brand) {
      res.status(400).json({ success: false, message: 'Please provide all required product fields (name, description, price, category, brand)' });
      return;
    }

    if (typeof price !== 'number' || price < 0) {
      res.status(400).json({ success: false, message: 'Price must be a non-negative number' });
      return;
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock: stock || 0,
      brand,
      images: images || [],
      rating: rating || 0,
    });

    // Invalidate product list cache
    await invalidateCache('products');

    logger.info(`Product created: ${product.name} (${product._id})`);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    logger.error('Failed to create product', { error: (error as Error).message });
    res.status(500).json({ success: false, message: 'Failed to create product', error: (error as Error).message });
  }
};

/**
 * @desc    Fetch products with Search, Category Filter, Price Filter, Sorting, Pagination & Redis Cache-Aside
 * @route   GET /api/products
 * @access  Public
 */
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
      const query: any = { name: { $exists: true } };

      // 1. Search Query (partial case-insensitive match on name or description)
      // Regex characters are escaped to prevent injection
      if (search && typeof search === 'string') {
        const escaped = escapeRegex(search);
        query.$or = [
          { name: { $regex: escaped, $options: 'i' } },
          { description: { $regex: escaped, $options: 'i' } },
        ];
      }

      // 2. Category Filter
      if (category && typeof category === 'string') {
        query.category = { $regex: `^${escapeRegex(category)}$`, $options: 'i' };
      }

      // 3. Brand Filter
      if (brand && typeof brand === 'string') {
        query.brand = { $regex: `^${escapeRegex(brand)}$`, $options: 'i' };
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

      // 5. Rating Filter
      const { minRating, inStock } = req.query;
      if (minRating !== undefined && minRating !== '') {
        query.rating = { $gte: Number(minRating) };
      }

      // 6. Availability Filter (In Stock)
      if (inStock === 'true' || inStock === true) {
        query.stock = { $gt: 0 };
      }

      // 5. Sorting
      let sortOptions: ProductSortOptions = { _id: -1 }; // default newest first (indexed by default)
      if (sort === 'price_asc') {
        sortOptions = { price: 1 };
      } else if (sort === 'price_desc') {
        sortOptions = { price: -1 };
      } else if (sort === 'rating_desc') {
        sortOptions = { rating: -1 };
      } else if (sort === 'name_asc') {
        sortOptions = { name: 1 };
      } else if (sort === 'oldest') {
        sortOptions = { _id: 1 };
      }

      // 6. Pagination Math
      const pageNum = Math.max(1, Number(page) || 1);
      const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
      const skip = (pageNum - 1) * limitNum;

      // Execute total count and paginated query concurrently for performance
      // Using .lean() for better read performance (returns plain JS objects)
      const [total, products] = await Promise.all([
        Product.countDocuments(query),
        Product.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean(),
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

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Failed to fetch products', { error: (error as Error).message });
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: (error as Error).message });
  }
};

/**
 * @desc    Fetch single product using Cache-Aside Strategy
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid product ID format' });
      return;
    }

    // Cache-Aside for single product (1800s TTL)
    const product = await getOrSetCache(
      `product:${id}`,
      () => Product.findById(id).lean(),
      1800
    );

    if (product) {
      res.json({ success: true, data: product });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    logger.error('Failed to fetch product', { error: (error as Error).message });
    res.status(500).json({ success: false, message: 'Failed to fetch product', error: (error as Error).message });
  }
};

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid product ID format' });
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
      logger.info(`Product updated: ${updatedProduct.name} (${id})`);
      res.json({ success: true, data: updatedProduct });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    logger.error('Failed to update product', { error: (error as Error).message });
    res.status(500).json({ success: false, message: 'Failed to update product', error: (error as Error).message });
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid product ID format' });
      return;
    }

    const product = await Product.findByIdAndDelete(id);

    if (product) {
      // Invalidate list and single product cache
      await invalidateCache(['products', `product:${id}`]);
      logger.info(`Product deleted: ${product.name} (${id})`);
      res.json({ success: true, data: null, message: 'Product removed successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    logger.error('Failed to delete product', { error: (error as Error).message });
    res.status(500).json({ success: false, message: 'Failed to delete product', error: (error as Error).message });
  }
};

/**
 * @desc    Get product statistics via aggregation pipeline
 * @route   GET /api/products/stats
 * @access  Public
 */
export const getProductStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getOrSetCache('products:stats', async () => {
      const result = await Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
            avgRating: { $avg: '$rating' },
            totalStock: { $sum: '$stock' },
          },
        },
        { $sort: { count: -1 } },
      ]);

      const totals = await Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            avgPrice: { $avg: '$price' },
            avgRating: { $avg: '$rating' },
            totalStock: { $sum: '$stock' },
          },
        },
      ]);

      return {
        byCategory: result,
        overall: totals[0] || { totalProducts: 0, avgPrice: 0, avgRating: 0, totalStock: 0 },
      };
    }, 600);

    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Failed to get product stats', { error: (error as Error).message });
    res.status(500).json({ success: false, message: 'Failed to get product statistics' });
  }
};
