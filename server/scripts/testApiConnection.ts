import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../src/models/Product';

dotenv.config();

async function testApiConnection() {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce';
  console.log(`Connecting to: ${mongoURI}`);
  await mongoose.connect(mongoURI);

  const products = await Product.find({ name: { $exists: true } }).limit(5).lean();
  console.log(`\nRetrieved ${products.length} active products from "ecommerce.products":`);
  products.forEach((p, i) => {
    console.log(` ${i + 1}. [${p.category}] ${p.name} - $${p.price} (Rating: ${p.rating}, Brand: ${p.brand})`);
  });

  await mongoose.disconnect();
  process.exit(0);
}

testApiConnection().catch(console.error);
