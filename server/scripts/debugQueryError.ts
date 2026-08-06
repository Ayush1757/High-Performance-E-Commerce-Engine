import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../src/models/Product';

dotenv.config();

async function debugQueryError() {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce';
  console.log(`Connecting to: ${mongoURI}`);
  await mongoose.connect(mongoURI);

  try {
    const query = { name: { $exists: true } };
    const [total, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query).sort({ createdAt: -1 }).skip(0).limit(8).lean(),
    ]);
    console.log(`Query Success! Total matching: ${total}, Products count: ${products.length}`);
  } catch (err: any) {
    console.error('Captured Query Error Stack:', err);
  }

  await mongoose.disconnect();
  process.exit(0);
}

debugQueryError();
