import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from './models/Product';
import { connectDB } from './config/db';

dotenv.config();

connectDB();

const categories = ['Electronics', 'Shoes', 'Mobiles', 'Clothing', 'Accessories'];
const brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'Zara', 'Gucci', 'LG'];

const generateProducts = (count: number) => {
  const products = [];
  for (let i = 1; i <= count; i++) {
    products.push({
      name: `Demo Product ${i}`,
      description: `This is a randomly generated description for product ${i}. High quality and durable.`,
      price: Number((Math.random() * 1000 + 10).toFixed(2)),
      category: categories[Math.floor(Math.random() * categories.length)],
      stock: Math.floor(Math.random() * 500),
      brand: brands[Math.floor(Math.random() * brands.length)],
      images: ['https://via.placeholder.com/300'],
      rating: Number((Math.random() * 5).toFixed(1)),
    });
  }
  return products;
};

const importData = async () => {
  try {
    // Clear existing products to prevent duplicates or just insert directly.
    // For a clean seed, let's delete existing products.
    await Product.deleteMany();

    const sampleProducts = generateProducts(1000);

    await Product.insertMany(sampleProducts);

    console.log('1000 Products Imported!');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error('Error destroying data:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
