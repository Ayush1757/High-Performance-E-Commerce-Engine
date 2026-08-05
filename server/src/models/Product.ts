import mongoose, { Document, Schema, Model } from 'mongoose';
import { invalidateCache, invalidateCachePattern } from '../utils/cache';

// 1. Create an interface representing a document in MongoDB.
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  brand: string;
  images: string[];
  rating: number;
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

// 2. Create a Schema corresponding to the document interface.
const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    brand: { type: String, required: true, trim: true },
    images: { type: [String], required: true, default: [] },
    rating: { type: Number, required: true, min: 0, max: 5, default: 0 },
    embedding: { type: [Number], select: false }, // Hidden by default for performance
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Performance Optimization: Indexes for fast search, filter, and sorting
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ category: 1, price: 1 });

// Helper function to handle automatic cache invalidation
const clearProductCache = async (doc?: IProduct | null) => {
  const keysToInvalidate: string[] = ['products'];
  if (doc && doc._id) {
    keysToInvalidate.push(`product:${doc._id}`);
  }
  await invalidateCache(keysToInvalidate);
  await invalidateCachePattern('products:*');
};

// 3. Register Mongoose Hooks for Automatic Cache Invalidation
productSchema.post('save', async function (doc) {
  await clearProductCache(doc);
});

productSchema.post('findOneAndUpdate', async function (doc) {
  await clearProductCache(doc);
});

productSchema.post('findOneAndDelete', async function (doc) {
  await clearProductCache(doc);
});

productSchema.post('deleteMany', async function () {
  await clearProductCache();
});

// 4. Create and export the Model.
export const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
