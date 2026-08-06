import mongoose from 'mongoose';

async function checkDatabases() {
  console.log('Inspecting MongoDB databases on mongodb://127.0.0.1:27017/...');
  const conn = await mongoose.connect('mongodb://127.0.0.1:27017/admin');
  const adminDb = conn.connection.db.admin();
  const dbs = await adminDb.listDatabases();
  console.log('\nDatabases found:');

  for (const dbInfo of dbs.databases) {
    const dbName = dbInfo.name;
    if (['admin', 'config', 'local'].includes(dbName)) continue;
    const dbConn = mongoose.connection.useDb(dbName);
    const collections = await dbConn.db.listCollections().toArray();
    const colNames = collections.map((c) => c.name);
    console.log(` - Database: "${dbName}" -> Collections: [${colNames.join(', ')}]`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

checkDatabases().catch(console.error);
