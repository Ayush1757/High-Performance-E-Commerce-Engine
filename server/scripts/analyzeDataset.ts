import fs from 'fs';
import path from 'path';
import readline from 'readline';

interface CategoryMap {
  [id: string]: string;
}

async function analyzeDataset() {
  const dataDir = path.join(__dirname, '../data');
  const categoriesPath = path.join(dataDir, 'amazon_categories.csv');
  const productsPath = path.join(dataDir, 'amazon_products.csv');

  console.log('--- TASK 1: DATASET ANALYSIS REPORT GENERATOR ---');

  // 1. Load Categories Map
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
  console.log(`Loaded ${Object.keys(categoryMap).length} categories from amazon_categories.csv.`);

  // 2. Stream and Analyze Products CSV
  const fileStream = fs.createReadStream(productsPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let totalRows = 0;
  let missingNames = 0;
  let missingPrices = 0;
  let invalidPrices = 0;
  let invalidRatings = 0;
  let emptyCategories = 0;
  let brokenImageUrls = 0;
  let duplicateAsins = 0;
  let duplicateTitles = 0;

  const seenAsins = new Set<string>();
  const seenTitles = new Set<string>();

  let isHeader = true;
  let columns: string[] = [];

  // Basic CSV Splitter ignoring commas inside quotes
  function parseCSVLine(text: string): string[] {
    const result = [];
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

  for await (const line of rl) {
    if (!line.trim()) continue;
    if (isHeader) {
      columns = line.split(',').map((c) => c.trim());
      isHeader = false;
      continue;
    }

    totalRows++;

    const cols = parseCSVLine(line);
    // Header order: asin(0), title(1), imgUrl(2), productURL(3), stars(4), reviews(5), price(6), listPrice(7), category_id(8), isBestSeller(9), boughtInLastMonth(10)
    const asin = cols[0] || '';
    let title = cols[1] || '';
    if (title.startsWith('"') && title.endsWith('"')) {
      title = title.substring(1, title.length - 1);
    }
    const imgUrl = cols[2] || '';
    const starsStr = cols[4] || '0';
    const priceStr = cols[6] || '0';
    const listPriceStr = cols[7] || '0';
    const categoryId = cols[8] || '';

    // Checks
    if (!title || title.trim() === '') {
      missingNames++;
    }

    if (seenAsins.has(asin)) {
      duplicateAsins++;
    } else if (asin) {
      seenAsins.add(asin);
    }

    const normTitle = title.toLowerCase().trim();
    if (seenTitles.has(normTitle)) {
      duplicateTitles++;
    } else if (normTitle) {
      seenTitles.add(normTitle);
    }

    const price = parseFloat(priceStr);
    const listPrice = parseFloat(listPriceStr);
    if (isNaN(price) || (price <= 0 && listPrice <= 0)) {
      invalidPrices++;
    }

    const stars = parseFloat(starsStr);
    if (isNaN(stars) || stars < 0 || stars > 5) {
      invalidRatings++;
    }

    if (!categoryId || !categoryMap[categoryId]) {
      emptyCategories++;
    }

    if (!imgUrl || !imgUrl.startsWith('http')) {
      brokenImageUrls++;
    }

    if (totalRows % 500000 === 0) {
      console.log(`Analyzed ${totalRows} rows...`);
    }
  }

  console.log('\n====================================');
  console.log('TASK 1 - DATASET ANALYSIS SUMMARY');
  console.log('====================================');
  console.log(`Total Rows in CSV:       ${totalRows}`);
  console.log(`Columns (${columns.length}):           ${columns.join(', ')}`);
  console.log(`Unique ASINs:            ${seenAsins.size}`);
  console.log(`Duplicate ASINs:         ${duplicateAsins}`);
  console.log(`Duplicate Product Names: ${duplicateTitles}`);
  console.log(`Missing Product Names:   ${missingNames}`);
  console.log(`Invalid / Zero Prices:   ${invalidPrices}`);
  console.log(`Invalid Ratings:         ${invalidRatings}`);
  console.log(`Unmapped Categories:     ${emptyCategories}`);
  console.log(`Broken Image URLs:       ${brokenImageUrls}`);
  console.log('====================================\n');
}

analyzeDataset().catch(console.error);
