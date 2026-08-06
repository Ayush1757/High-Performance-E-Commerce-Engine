import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { generateProductEmbedding } from '../src/utils/embeddings';

dotenv.config();

function extractBrand(title: any, category: string): string {
  if (!title || typeof title !== 'string') return category || 'Amazon Brand';
  const cleanTitle = String(title).replace(/^"|"$/g, '').trim();
  const firstWord = cleanTitle.split(/\s+/)[0].replace(/[^a-zA-Z0-9]/g, '');
  if (firstWord.length > 1 && !/^\d+$/.test(firstWord)) {
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  }
  return category || 'Generic';
}

async function syncEcommerceDb() {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce';
  console.log(`\n====================================`);
  console.log(`🔄 SYNCING ECOMMERCE DATABASE ON: ${mongoURI}`);
  console.log(`====================================\n`);

  const conn = await mongoose.connect(mongoURI);
  const db = conn.connection.db;

  // 1. Load Categories
  const categoryDocs = await db.collection('category').find({}).toArray();
  const categoryMap = new Map<number, string>();
  categoryDocs.forEach((cat) => {
    categoryMap.set(cat.id, cat.category_name);
  });
  console.log(`✅ Loaded ${categoryMap.size} category mappings from "category" collection.`);

  // 2. Count Total Products
  const totalProducts = await db.collection('products').countDocuments();
  console.log(`📦 Found ${totalProducts.toLocaleString()} product documents in "products" collection.`);

  // 3. Process products in cursor batch chunks
  const cursor = db.collection('products').find({});
  let processedCount = 0;
  let updatedCount = 0;
  const BATCH_SIZE = 2500;
  let bulkOps: any[] = [];

  console.log(`⚡ Transforming raw documents to match Product model schema & embedding vectors...`);

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    if (!doc) continue;

    processedCount++;

    // Check if fields are missing/need transformation
    const title = doc.title || doc.name || 'Untitled Product';
    const categoryName = categoryMap.get(doc.category_id) || doc.category || 'General';
    let price = typeof doc.price === 'number' && doc.price > 0 ? doc.price : parseFloat(doc.price || '0');
    if (isNaN(price) || price <= 0) {
      price = typeof doc.listPrice === 'number' && doc.listPrice > 0 ? doc.listPrice : parseFloat(doc.listPrice || '0');
    }
    if (isNaN(price) || price <= 0) price = 19.99;

    let rating = typeof doc.stars === 'number' ? doc.stars : (typeof doc.rating === 'number' ? doc.rating : parseFloat(doc.stars || doc.rating || '4.5'));
    if (isNaN(rating) || rating < 0) rating = 4.0;
    if (rating > 5) rating = 5.0;

    const brand = doc.brand || extractBrand(title, categoryName);
    const description = doc.description || `High quality ${title} under ${categoryName}. Top rated item with ${rating} stars.${doc.boughtInLastMonth ? ` Over ${doc.boughtInLastMonth} bought in last month.` : ''}`;
    const images = Array.isArray(doc.images) && doc.images.length > 0 ? doc.images : [doc.imgUrl || 'https://placehold.co/600x600?text=Product'];
    const stock = doc.stock || 50;

    // Generate vector embedding if missing
    const embedding = doc.embedding || (await generateProductEmbedding(title, description, categoryName, brand));

    bulkOps.push({
      updateOne: {
        filter: { _id: doc._id },
        update: {
          $set: {
            name: title,
            category: categoryName,
            price: Number(price.toFixed(2)),
            rating: Number(rating.toFixed(1)),
            brand,
            description,
            images,
            stock,
            embedding,
          },
        },
      },
    });

    if (bulkOps.length >= BATCH_SIZE) {
      await db.collection('products').bulkWrite(bulkOps, { ordered: false });
      updatedCount += bulkOps.length;
      console.log(`   ➜ Processed & Synced ${updatedCount.toLocaleString()} / ${totalProducts.toLocaleString()} products...`);
      bulkOps = [];
    }

    // Cap initial fast sync batch if database is huge for instant responsiveness
    if (updatedCount >= 100000) {
      console.log(`\nℹ️ Reached 100,000 document sync checkpoint for high-speed performance.`);
      break;
    }
  }

  if (bulkOps.length > 0) {
    await db.collection('products').bulkWrite(bulkOps, { ordered: false });
    updatedCount += bulkOps.length;
    bulkOps = [];
  }

  console.log(`\n====================================`);
  console.log(`✅ ECOMMERCE DATABASE SYNC COMPLETE`);
  console.log(`====================================`);
  console.log(`Synced Documents:  ${updatedCount.toLocaleString()}`);
  console.log(`Database URI:      ${mongoURI}`);
  console.log(`====================================\n`);

  await mongoose.disconnect();
  process.exit(0);
}

syncEcommerceDb().catch(console.error);
