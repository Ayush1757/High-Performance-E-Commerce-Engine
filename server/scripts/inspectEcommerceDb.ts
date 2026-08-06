import mongoose from 'mongoose';

async function inspectEcommerceDb() {
  console.log('Inspecting "ecommerce" database on mongodb://127.0.0.1:27017/ecommerce...');
  const conn = await mongoose.connect('mongodb://127.0.0.1:27017/ecommerce');
  const db = conn.connection.db;

  const productSample = await db.collection('products').findOne({});
  console.log('\n--- Sample Document in "products" collection ---');
  console.log(JSON.stringify(productSample, null, 2));

  const productCount = await db.collection('products').countDocuments();
  console.log(`\nTotal Documents in "products" collection: ${productCount}`);

  const categorySample = await db.collection('category').findOne({});
  console.log('\n--- Sample Document in "category" collection ---');
  console.log(JSON.stringify(categorySample, null, 2));

  const categoryCount = await db.collection('category').countDocuments();
  console.log(`\nTotal Documents in "category" collection: ${categoryCount}`);

  await mongoose.disconnect();
  process.exit(0);
}

inspectEcommerceDb().catch(console.error);
