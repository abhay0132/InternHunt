// Scraping/saveToDB.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, saveInternships, removeExpiredInternships } from './utils/dbHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const saveDataToDB = async () => {
  console.log('💾 Starting database import...\n');

  try {
    // Connect to database
    const connected = await connectDB();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }

    // Load JSON files
    const files = ['internshala.json', 'indeed.json', 'glassdoor.json'];
    const allInternships = [];

    for (const file of files) {
      const filePath = path.join(__dirname, 'data', file);

      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${filePath}, skipping...`);
        continue;
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      allInternships.push(...data);
      console.log(`📄 Loaded ${data.length} internships from ${file}`);
    }

    if (allInternships.length === 0) {
      console.log('⚠️ No internships to save');
      process.exit(0);
    }

    // Save to database
    console.log(`\n💾 Saving ${allInternships.length} internships to database...`);
    const saved = await saveInternships(allInternships);
    
    // Remove expired
    console.log('🗑️ Removing expired internships...');
    await removeExpiredInternships();

    console.log(`\n✅ Successfully saved ${saved} internships to database`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
};

saveDataToDB();