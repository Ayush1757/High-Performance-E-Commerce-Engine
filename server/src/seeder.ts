import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from './models/Product';
import { connectDB } from './config/db';
import { generateProductEmbedding } from './utils/embeddings';

dotenv.config();

connectDB();

const categories = ['Electronics', 'Shoes', 'Mobiles', 'Clothing', 'Accessories'];
const brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'Zara', 'Gucci', 'LG'];

const adjectives = ['Premium', 'Ultra', 'Pro', 'Classic', 'Modern', 'Slim', 'Smart', 'Eco'];
const productTypes: Record<string, string[]> = {
  Electronics: ['Headphones', 'Speaker', 'Camera', 'Monitor', 'Keyboard', 'Mouse'],
  Shoes: ['Running Shoes', 'Sneakers', 'Boots', 'Sandals', 'Loafers', 'Trainers'],
  Mobiles: ['Smartphone', 'Tablet', 'Smart Watch', 'Phone Case', 'Charger', 'Power Bank'],
  Clothing: ['T-Shirt', 'Jacket', 'Jeans', 'Hoodie', 'Dress', 'Shorts'],
  Accessories: ['Watch', 'Sunglasses', 'Wallet', 'Belt', 'Backpack', 'Hat'],
};

const generateProducts = (count: number) => {
  const products = [];
  for (let i = 1; i <= count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const types = productTypes[category];
    const productType = types[Math.floor(Math.random() * types.length)];
    const name = `${brand} ${adjective} ${productType}`;

    products.push({
      name,
      description: `${adjective} ${productType} by ${brand}. High quality ${category.toLowerCase()} product with excellent performance and durability. Perfect for everyday use.`,
      price: Number((Math.random() * 1000 + 10).toFixed(2)),
      category,
      stock: Math.floor(Math.random() * 500),
      brand,
      images: [`https://placehold.co/400x400/1a1a2e/e94560?text=${encodeURIComponent(productType)}`],
      rating: Number((Math.random() * 5).toFixed(1)),
    });
  }
  return products;
};

const importData = async () => {
  try {
    // Clear existing products to prevent duplicates
    await Product.deleteMany();

    const sampleProducts = generateProducts(1000);

    console.log('Inserting 1000 products...');
    const insertedProducts = await Product.insertMany(sampleProducts);

    // Generate embeddings for each product (in batches of 50)
    console.log('Generating embeddings for all products...');
    const batchSize = 50;
    for (let i = 0; i < insertedProducts.length; i += batchSize) {
      const batch = insertedProducts.slice(i, i + batchSize);
      const updates = await Promise.all(
        batch.map(async (product) => {
          const embedding = await generateProductEmbedding(
            product.name,
            product.description,
            product.category,
            product.brand
          );
          return {
            updateOne: {
              filter: { _id: product._id },
              update: { $set: { embedding } },
            },
          };
        })
      );
      await Product.bulkWrite(updates);
      console.log(`  Embedded ${Math.min(i + batchSize, insertedProducts.length)} / ${insertedProducts.length}`);
    }

    console.log('1000 Products Imported with Embeddings!');
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
