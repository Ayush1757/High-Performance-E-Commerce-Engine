import fs from 'fs';
import path from 'path';
import readline from 'readline';
import dotenv from 'dotenv';
import { connectDB } from '../src/config/db';
import { Product } from '../src/models/Product';
import { generateProductEmbedding } from '../src/utils/embeddings';

dotenv.config();

interface CategoryMap {
  [id: string]: string;
}

// Brand helper function to extract clean brand name from product title
function extractBrand(title: string, category: string): string {
  if (!title) return 'Amazon Brand';
  const cleanTitle = title.replace(/^"|"$/g, '').trim();
  const firstWord = cleanTitle.split(/\s+/)[0].replace(/[^a-zA-Z0-9]/g, '');
  if (firstWord.length > 1 && !/^\d+$/.test(firstWord)) {
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  }
  return category || 'Generic';
}

// Basic CSV Splitter ignoring commas inside quotes
function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

async function runImport() {
  const startTime = Date.now();
  console.log('\n====================================');
  console.log('🚀 AMAZON PRODUCT CATALOG IMPORTING SCRIPT');
  console.log('====================================\n');

  // 1. Connect to Database
  await connectDB();

  const dataDir = path.join(__dirname, '../data');
  const categoriesPath = path.join(dataDir, 'amazon_categories.csv');
  const productsPath = path.join(dataDir, 'amazon_products.csv');

  if (!fs.existsSync(productsPath)) {
    console.error(`❌ CSV File not found at: ${productsPath}`);
    process.exit(1);
  }

  // 2. Load Categories Mapping
  const categoryMap: CategoryMap = {};
  if (fs.existsSync(categoriesPath)) {
    const catLines = fs.readFileSync(categoriesPath, 'utf-8').split('\n');
    for (let i = 1; i < catLines.length; i++) {
      const line = catLines[i].trim();
      if (!line) continue;
      const firstComma = line.indexOf(',');
      if (firstComma !== -1) {
        const id = line.substring(0, firstComma).trim();
        let name = line.substring(firstComma + 1).trim();
        if (name.startsWith('"') && name.endsWith('"')) {
          name = name.substring(1, name.length - 1);
        }
        categoryMap[id] = name;
      }
    }
  }
  console.log(`✅ Loaded ${Object.keys(categoryMap).length} categories from amazon_categories.csv`);

  // 3. Load Existing Product Names from Database for Deduplication
  console.log('🔍 Fetching existing product names for deduplication...');
  const existingNamesList = await Product.distinct('name');
  const seenTitlesSet = new Set<string>(existingNamesList.map((n: string) => n.toLowerCase().trim()));
  console.log(`ℹ️ Found ${seenTitlesSet.size} pre-existing unique product titles in database.`);

  // 4. Stream & Parse Amazon CSV Dataset
  const fileStream = fs.createReadStream(productsPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let totalRowsInCSV = 0;
  let importedCount = 0;
  let skippedDuplicatesCount = 0;
  let invalidRowsCount = 0;

  const BATCH_SIZE = 2500;
  let currentBatch: any[] = [];
  let isHeader = true;

  console.log('\n📦 Processing dataset stream & inserting in optimized batches...');

  for await (const line of rl) {
    if (!line.trim()) continue;
    if (isHeader) {
      isHeader = false;
      continue;
    }

    totalRowsInCSV++;

    const cols = parseCSVLine(line);
    // Header format: asin(0), title(1), imgUrl(2), productURL(3), stars(4), reviews(5), price(6), listPrice(7), category_id(8), isBestSeller(9), boughtInLastMonth(10)
    let title = cols[1] || '';
    if (title.startsWith('"') && title.endsWith('"')) {
      title = title.substring(1, title.length - 1);
    }
    title = title.trim();

    const imgUrl = cols[2] || '';
    const starsStr = cols[4] || '0';
    const priceStr = cols[6] || '0';
    const listPriceStr = cols[7] || '0';
    const categoryId = cols[8] || '';
    const boughtInLastMonth = cols[10] || '0';

    // Data Cleaning & Validation (TASK 3)
    if (!title) {
      invalidRowsCount++;
      continue;
    }

    const normTitle = title.toLowerCase().trim();
    if (seenTitlesSet.has(normTitle)) {
      skippedDuplicatesCount++;
      continue;
    }
    seenTitlesSet.add(normTitle);

    let price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) {
      price = parseFloat(listPriceStr);
    }
    if (isNaN(price) || price <= 0) {
      invalidRowsCount++;
      continue;
    }

    let rating = parseFloat(starsStr);
    if (isNaN(rating) || rating < 0) rating = 0;
    if (rating > 5) rating = 5;

    if (!imgUrl || !imgUrl.startsWith('http')) {
      invalidRowsCount++;
      continue;
    }

    const category = categoryMap[categoryId] || 'General';
    const brand = extractBrand(title, category);
    const description = `High quality ${title} under ${category}. Top rated product with ${rating} stars.${boughtInLastMonth !== '0' ? ` Over ${boughtInLastMonth} bought in last month.` : ''}`;
    const stock = Math.floor(Math.random() * 80) + 20; // Stock between 20 and 100

    // TASK 6: Generate Vector Embeddings
    const embedding = await generateProductEmbedding(title, description, category, brand);

    currentBatch.push({
      name: title,
      description,
      price: Number(price.toFixed(2)),
      category,
      brand,
      stock,
      images: [imgUrl],
      rating: Number(rating.toFixed(1)),
      embedding,
    });

    // Batch Insertion (TASK 8)
    if (currentBatch.length >= BATCH_SIZE) {
      await Product.insertMany(currentBatch, { ordered: false });
      importedCount += currentBatch.length;
      console.log(`   ➜ Imported ${importedCount.toLocaleString()} products (Processed ${totalRowsInCSV.toLocaleString()} rows)...`);
      currentBatch = [];
    }
  }

  // Insert remaining batch
  if (currentBatch.length > 0) {
    await Product.insertMany(currentBatch, { ordered: false });
    importedCount += currentBatch.length;
    currentBatch = [];
  }

  const durationSec = Math.round((Date.now() - startTime) / 1000);
  const finalProductCount = await Product.countDocuments();

  console.log('\n====================================');
  console.log('✅ AMAZON PRODUCT CATALOG IMPORT COMPLETE');
  console.log('====================================');
  console.log(`Total Rows in CSV:       ${totalRowsInCSV.toLocaleString()}`);
  console.log(`Products Imported:       ${importedCount.toLocaleString()}`);
  console.log(`Skipped Duplicates:      ${skippedDuplicatesCount.toLocaleString()}`);
  console.log(`Invalid Rows Filtered:   ${invalidRowsCount.toLocaleString()}`);
  console.log(`Import Duration:         ${durationSec} seconds`);
  console.log(`Final Database Count:    ${finalProductCount.toLocaleString()} products`);
  console.log('====================================\n');

  // TASK 11: Write IMPORT_REPORT.md
  const reportContent = `# Amazon Product Catalog Import Report

## Summary
The Amazon Products Dataset from Kaggle has been successfully cleaned, transformed, embedded, and imported into the MongoDB database.

---

## Import Telemetry & Metrics

| Metric | Value |
|---|---|
| **Total Rows in CSV** | ${totalRowsInCSV.toLocaleString()} |
| **Imported Products** | ${importedCount.toLocaleString()} |
| **Skipped Duplicates** | ${skippedDuplicatesCount.toLocaleString()} |
| **Invalid Rows Filtered** | ${invalidRowsCount.toLocaleString()} |
| **Import Duration** | ${durationSec} seconds |
| **Final MongoDB Collection Count** | ${finalProductCount.toLocaleString()} |

---

## Pipeline Execution Details

1. **Data Cleaning**:
   - Filtered missing titles and invalid/zero price records.
   - Validated rating boundaries [0 - 5].
   - Filtered out broken/malformed image URLs.
2. **Category Mapping**:
   - Mapped \`category_id\` to string names via \`amazon_categories.csv\`.
3. **Deduplication**:
   - Filtered out duplicate product names using in-memory and database title indexes.
4. **AI Vector Embeddings**:
   - Generated 256-dimensional TF-IDF vector embeddings for every product record based on title, category, brand, and description.
5. **Batch Insertion Optimization**:
   - Utilized high-speed bulk insertion batches of ${BATCH_SIZE} records.
`;

  const reportPath = path.join(__dirname, '../../IMPORT_REPORT.md');
  fs.writeFileSync(reportPath, reportContent, 'utf-8');
  console.log(`📄 Summary report saved to: IMPORT_REPORT.md`);

  process.exit(0);
}

runImport().catch((err) => {
  console.error('Fatal error during import:', err);
  process.exit(1);
});
