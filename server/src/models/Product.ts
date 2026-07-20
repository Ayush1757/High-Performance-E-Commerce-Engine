import mongoose, { Document, Schema, Model } from 'mongoose';

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
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// 3. Create and export the Model.
export const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
